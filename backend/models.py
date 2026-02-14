from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class UserRole(str, Enum):
    ADMIN = "admin"
    PSYCHOLOGIST = "psychologist"
    ASSISTANT = "assistant"
    READER = "reader"

class CaseStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.ASSISTANT)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    cases_created = relationship("Case", back_populates="creator")

class Case(Base):
    __tablename__ = "cases"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    patient_code: Mapped[str] = mapped_column(String(100), index=True)
    patient_name_hidden: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[CaseStatus] = mapped_column(SQLEnum(CaseStatus), default=CaseStatus.QUEUED)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User", back_populates="cases_created")
    files = relationship("CaseFile", back_populates="case", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="case", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="case", cascade="all, delete-orphan")
    clinical_analysis = relationship("ClinicalAnalysis", back_populates="case", uselist=False, cascade="all, delete-orphan")

class CaseFile(Base):
    __tablename__ = "case_files"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"))
    original_file_url: Mapped[str] = mapped_column(Text)
    processed_images_urls: Mapped[dict] = mapped_column(JSON) # List of URLs
    dpi: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    case = relationship("Case", back_populates="files")

class ClinicalAnalysis(Base):
    """
    Tabela principal para o Laudo Clínico Profissional (PaloCheck Pro).
    Armazena as 3 camadas de dados:
    1. Metrics Auto: O que o robô mediu.
    2. Manual Overrides: O que o psicólogo corrigiu.
    3. Interpretations: O texto final do laudo.
    """
    __tablename__ = "clinical_analyses"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Camada 1: Métricas Automáticas Expandidas
    # { "margins": {...}, "slant": {...}, "intervals": [...] }
    metrics_auto: Mapped[dict] = mapped_column(JSON, default=dict) 
    
    # Camada 2: Ajustes Manuais e Checkboxes Qualitativos
    # { "intervals": [...], "flags": ["tremor", "hooks"], "corrections": {...} }
    manual_overrides: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Camada 3: Interpretação e Texto
    # { "productivity_class": "Media", "rhythm_class": "Rigido", "obs": "..." }
    interpretations: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Status do Laudo
    status: Mapped[str] = mapped_column(String(50), default="DRAFT")

    
    case = relationship("Case", back_populates="clinical_analysis")

class Detection(Base):
    __tablename__ = "detections"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"))
    palo_objects: Mapped[dict] = mapped_column(JSON) # JSON with coordinates/props
    roi_config: Mapped[dict] = mapped_column(JSON) # JSON with Regions of Interest
    scale_mm_per_px: Mapped[Optional[float]] = mapped_column(Float)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    case = relationship("Case", back_populates="detections")

class Metric(Base):
    __tablename__ = "metrics"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"))
    total_count: Mapped[int] = mapped_column(Integer)
    by_interval: Mapped[dict] = mapped_column(JSON)
    stats: Mapped[dict] = mapped_column(JSON) # trend, CV, mean, etc.
    confidence_level: Mapped[str] = mapped_column(String(50)) # High, Medium, Low
    confidence_reasons: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    case = relationship("Case", back_populates="metrics")

class Ruleset(Base):
    __tablename__ = "rulesets"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)
    author: Mapped[Optional[str]] = mapped_column(String(255))
    year: Mapped[Optional[int]] = mapped_column(Integer)
    intervals_config: Mapped[dict] = mapped_column(JSON)
    thresholds: Mapped[dict] = mapped_column(JSON)
    templates: Mapped[dict] = mapped_column(JSON)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"))
    draft_text: Mapped[str] = mapped_column(Text)
    final_text: Mapped[Optional[str]] = mapped_column(Text)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    case = relationship("Case", back_populates="reports")

class LeadDemo(Base):
    __tablename__ = "leads_demo"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    company: Mapped[str] = mapped_column(String(255))
    role: Mapped[Optional[str]] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), index=True)
    whatsapp: Mapped[str] = mapped_column(String(50))
    city_uf: Mapped[Optional[str]] = mapped_column(String(100))
    estimated_volume: Mapped[Optional[str]] = mapped_column(String(50))
    message: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    subject: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(50), default="normal")
    user_email: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    event_name: Mapped[str] = mapped_column(String(100))
    cta_id: Mapped[str] = mapped_column(String(100))
    page: Mapped[str] = mapped_column(String(100))
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    utm_json: Mapped[Optional[dict]] = mapped_column(JSON)
    referrer: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class NormativeGroup(Base):
    __tablename__ = "normative_groups"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)
    population_criteria: Mapped[dict] = mapped_column(JSON) # e.g., {"age_range": [18, 25], "education": "higher"}
    reference_table: Mapped[dict] = mapped_column(JSON) # The actual norm values (Mean, SD for metrics)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    case_id: Mapped[Optional[int]] = mapped_column(ForeignKey("cases.id"))
    action: Mapped[str] = mapped_column(String(100))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MetricsHistory(Base):
    """
    Phase 2: Audit Trail for Clinical Metrics.
    Tracks every field-level edit made by the psychologist.
    """
    __tablename__ = "metrics_history"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"), index=True)
    field_name: Mapped[str] = mapped_column(String(100))  # e.g., "interval_1", "tremor_flag"
    old_value: Mapped[str] = mapped_column(Text)  # JSON string
    new_value: Mapped[str] = mapped_column(Text)  # JSON string
    changed_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class Job(Base):
    __tablename__ = "jobs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id"))
    file_id: Mapped[Optional[int]] = mapped_column(ForeignKey("case_files.id"))
    status: Mapped[JobStatus] = mapped_column(SQLEnum(JobStatus), default=JobStatus.QUEUED)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    current_step: Mapped[Optional[str]] = mapped_column(String(100)) # preprocess, detect, metrics, interpret
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

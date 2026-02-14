from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict
from models import UserRole, CaseStatus

# Base Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Case Schemas
class CaseBase(BaseModel):
    patient_code: str
    patient_name_hidden: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: int
    status: CaseStatus
    created_by: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CaseFileResponse(BaseModel):
    id: int
    case_id: int
    original_file_url: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Detection & Metrics
class DetectionResponse(BaseModel):
    palo_objects: dict
    roi_config: dict
    scale_mm_per_px: Optional[float]
    model_config = ConfigDict(from_attributes=True)

class MetricResponse(BaseModel):
    total_count: int
    by_interval: dict
    stats: dict
    confidence_level: str
    model_config = ConfigDict(from_attributes=True)

# Report Schemas
class ReportResponse(BaseModel):
    draft_text: str
    final_text: Optional[str]
    reviewed_at: Optional[datetime]
    version: int
    model_config = ConfigDict(from_attributes=True)

class ReportUpdate(BaseModel):
    draft_text: Optional[str] = None
    final_text: Optional[str] = None
    is_reviewed: bool = False

class RulesetBase(BaseModel):
    name: str
    description: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    intervals_config: Dict[str, Any]
    thresholds: Dict[str, Any]
    templates: Dict[str, Any]
    is_active: bool = True

class RulesetCreate(RulesetBase):
    pass

class RulesetResponse(RulesetBase):
    id: int
    version: int
    model_config = ConfigDict(from_attributes=True)

# Marketing & Funnel Schemas
class LeadCreate(BaseModel):
    name: str
    company: str
    role: Optional[str] = None
    email: EmailStr
    whatsapp: str
    city_uf: Optional[str] = None
    estimated_volume: Optional[str] = None
    message: Optional[str] = None

class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "normal"
    user_email: EmailStr

class EventCreate(BaseModel):
    event_name: str
    cta_id: str
    page: str
    utm_json: Optional[dict] = None
    referrer: Optional[str] = None

# Normative Group Schemas
class NormativeGroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    population_criteria: Dict[str, Any]
    reference_table: Dict[str, Any]
    is_active: bool = True

class NormativeGroupCreate(NormativeGroupBase):
    pass

class NormativeGroupResponse(NormativeGroupBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Job Schemas
class JobResponse(BaseModel):
    id: int
    case_id: int
    status: str
    progress: int
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Phase 2: Audit Trail
class MetricsHistoryCreate(BaseModel):
    field_name: str
    old_value: str
    new_value: str

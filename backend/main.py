from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.staticfiles import StaticFiles
import shutil
from pathlib import Path
import uuid
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from typing import List
from datetime import datetime

import models, schemas, auth, database
from database import engine, get_db
import secrets
import hashlib
from datetime import timedelta
import numpy as np
import json

def jsonify_dict(obj):
    """
    Recursively converts NumPy types to standard Python types for JSON serialization.
    """
    if isinstance(obj, dict):
        return {k: jsonify_dict(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [jsonify_dict(v) for v in obj]
    elif isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return jsonify_dict(obj.tolist())
    else:
        return obj

# Create tables in SQLite
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PaloCheck API", version="1.0.0")

# Setup static files for storage access
UPLOAD_DIR = Path("../storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory="../storage"), name="storage")

@app.on_event("startup")
def ensure_default_user():
    db = next(get_db())
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            print("[STARTUP] Criando admin padrão...")
            hashed_pass = auth.get_password_hash("palo123")
            db.add(models.User(
                name="PaloCheck Admin",
                email="admin@palocheck.com.br",
                password_hash=hashed_pass,
                role=models.UserRole.ADMIN
            ))
            db.commit()
    except Exception as e:
        print(f"[STARTUP-ERROR]: {e}")
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In prod, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Marketing & Funnel Endpoints (Public)
@app.post("/api/leads", status_code=status.HTTP_201_CREATED)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    new_lead = models.LeadDemo(**lead.model_dump())
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    print(f"[MARKETING] Novo Lead capturado: {lead.email}")
    return {"status": "success", "id": new_lead.id}

@app.post("/api/tickets", status_code=status.HTTP_201_CREATED)
def create_support_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    new_ticket = models.SupportTicket(**ticket.model_dump())
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    print(f"[SUPPORT] Novo Ticket aberto: {ticket.subject}")
    return {"status": "success", "id": new_ticket.id}

@app.post("/api/events", status_code=status.HTTP_200_OK)
def track_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    # Optional: Associate with current user if token exists via safe try/except
    user_id = None
    # (Future logic for associating guest/user events)
    
    new_event = models.Event(
        **event.model_dump(),
        user_id=user_id
    )
    db.add(new_event)
    db.commit()
    return {"status": "tracked"}

# Root redirect or generic info
@app.get("/")
def read_root():
    return {"app": "PaloCheck API", "version": "3.6-industrial"}

@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_pass = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_pass,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

from fastapi.security import OAuth2PasswordRequestForm
from typing import Union

@app.post("/auth/login", response_model=schemas.Token)
@app.post("/token", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    email = form_data.username
    password = form_data.password
    
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user or not auth.verify_password(password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Users Management
@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN]))):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Cases Management
@app.get("/cases", response_model=List[schemas.CaseResponse])
def get_cases(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Simple isolation: Assistents see all, but only psychologists edit
    return db.query(models.Case).all()

@app.post("/cases", response_model=schemas.CaseResponse)
def create_case(
    case: schemas.CaseCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN, models.UserRole.PSYCHOLOGIST, models.UserRole.ASSISTANT]))
):
    print(f"[API] Criando caso: {case.patient_code} por User: {current_user.id}")
    try:
        new_case = models.Case(
            patient_code=case.patient_code,
            patient_name_hidden=case.patient_name_hidden,
            created_by=current_user.id
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        print(f"[API] Caso criado com sucesso: ID {new_case.id}")
        return new_case
    except Exception as e:
        print(f"[API-ERROR] Falha ao criar caso: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cases/{case_id}/upload", response_model=schemas.CaseFileResponse)
def upload_case_file(
    case_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    print(f"[API] Upload iniciado: Caso {case_id}, Arquivo: {file.filename}, Size: {file.size}")
    
    # 0. Validate Case Existence
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        print(f"[API-ERROR] Caso {case_id} não encontrado para upload")
        raise HTTPException(status_code=404, detail="Caso não encontrado")

    try:
        # 1. Save file to disk
        file_id = str(uuid.uuid4())
        extension = Path(file.filename).suffix
        file_name = f"{file_id}{extension}"
        dest_path = UPLOAD_DIR / file_name
        
        with dest_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Save record in database
        new_file = models.CaseFile(
            case_id=case_id,
            original_file_url=str(dest_path),
            processed_images_urls={},
            dpi=300 # Default
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        print(f"[API] Upload concluído: ID {new_file.id} para Caso {case_id}")
        return new_file
    except Exception as e:
        print(f"[API-ERROR] Falha no upload: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno no upload: {str(e)}")

from fastapi import BackgroundTasks
import uuid

@app.post("/cases/{case_id}/analyze", response_model=schemas.JobResponse)
def analyze_case(
    case_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    print(f"[API] Início de análise solicitado: Caso {case_id}")
    
    # 1. Get the latest file for this case
    case_file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).order_by(models.CaseFile.created_at.desc()).first()
    if not case_file:
        print(f"[API-ERROR] Tentativa de análise sem arquivo: Caso {case_id}")
        raise HTTPException(status_code=400, detail="Nenhum arquivo encontrado para este caso.")
        
    try:
        # 2. Create Job record
        new_job = models.Job(
            case_id=case_id,
            file_id=case_file.id,
            status=models.JobStatus.QUEUED,
            progress=0,
            current_step="iniciando"
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        
        # 3. Schedule task
        background_tasks.add_task(
            process_vision_task, 
            case_id=case_id, 
            file_name=Path(case_file.original_file_url).name, 
            dest_path=Path(case_file.original_file_url),
            job_id=new_job.id
        )
        print(f"[API] Job {new_job.id} enfileirado com sucesso para Caso {case_id}")
        return new_job
    except Exception as e:
        print(f"[API-ERROR] Falha ao enfileirar job: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao iniciar processamento: {str(e)}")

@app.get("/cases/{case_id}/jobs/latest", response_model=schemas.JobResponse)
def get_latest_job(case_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.case_id == case_id).order_by(models.Job.created_at.desc()).first()
    if not job:
        raise HTTPException(status_code=404, detail="Nenhum processo em andamento.")
    return job

@app.post("/cases/{case_id}/reprocess")
def reprocess_case(
    case_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Clear old metrics/detections and reprocess the case from scratch."""
    # 1. Verify case exists
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado")
    
    # 2. Get the file to reprocess
    case_file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).order_by(models.CaseFile.created_at.desc()).first()
    if not case_file:
        raise HTTPException(status_code=400, detail="Nenhum arquivo associado a este caso")
    
    # 3. Clear old data
    db.query(models.Detection).filter(models.Detection.case_id == case_id).delete()
    db.query(models.Metric).filter(models.Metric.case_id == case_id).delete()
    db.query(models.Job).filter(models.Job.case_id == case_id).delete()
    db.commit()
    
    print(f"[REPROCESS] Dados antigos limpos para Caso {case_id}")
    
    # 4. Create new job
    new_job = models.Job(
        case_id=case_id,
        file_id=case_file.id,
        status=models.JobStatus.QUEUED,
        progress=0,
        current_step="iniciando"
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    # 5. Schedule reprocessing
    background_tasks.add_task(
        process_vision_task, 
        case_id=case_id, 
        file_name=Path(case_file.original_file_url).name, 
        dest_path=Path(case_file.original_file_url),
        job_id=new_job.id
    )
    
    print(f"[REPROCESS] Job {new_job.id} iniciado para Caso {case_id}")
    return {"status": "reprocessing", "job_id": new_job.id}

@app.get("/settings/rulesets", response_model=List[schemas.RulesetResponse])
def list_rulesets(db: Session = Depends(get_db)):
    return db.query(models.Ruleset).all()

@app.post("/settings/rulesets", response_model=schemas.RulesetResponse)
def create_ruleset(data: schemas.RulesetCreate, db: Session = Depends(get_db)):
    # Deactivate current active one if new one is active
    if data.is_active:
        db.query(models.Ruleset).update({"is_active": False})
    
    new_ruleset = models.Ruleset(
        **data.model_dump(),
        version=1
    )
    db.add(new_ruleset)
    db.commit()
    db.refresh(new_ruleset)
    return new_ruleset

@app.get("/settings/ruleset/active", response_model=schemas.RulesetResponse)
def get_active_ruleset(db: Session = Depends(get_db)):
    ruleset = db.query(models.Ruleset).filter(models.Ruleset.is_active == True).first()
    if not ruleset:
        # Create a default if not exists
        from report_engine import DEFAULT_RULESET
        ruleset = models.Ruleset(
            name="Padrão PaloCheck",
            intervals_config={"count": 5},
            thresholds=DEFAULT_RULESET["thresholds"],
            templates=DEFAULT_RULESET["templates"]
        )
        db.add(ruleset)
        db.commit()
        db.refresh(ruleset)
    return ruleset

# Helper for file paths
UPLOAD_DIR = Path("../storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

from fastapi import BackgroundTasks
import uuid

def process_vision_task(case_id: int, file_name: str, dest_path: Path, job_id: int):
    db_gen = database.get_db()
    db = next(db_gen)
    try:
        db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
        db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
        if not db_case or not db_job: return
        
        db_job.status = models.JobStatus.PROCESSING
        db_job.progress = 10
        db_job.current_step = "preprocess"
        db.commit()

        from vision import PaloDetector
        detector = PaloDetector()
        
        print(f"[VISION-JOB] Iniciando: {case_id}")
        raw_img, gray_img, processed_img = detector.preprocess(str(dest_path))
        
        # Detect Test Area (ROI) - Ignore header/footer
        roi, found = detector.detect_test_area(processed_img)
        
        db_job.progress = 30
        db_job.current_step = "detect"
        db.commit()
        
        # Passed ROI to confinement detection to official test area
        palos = detector.detect_palos(processed_img, gray_img, roi=roi)
        
        # 4. Logical Segmentation (Lines -> Intervals)
        # Use gray_img for consistent height reference
        lines = detector.cluster_lines(palos, img_height=gray_img.shape[0])
        intervals = detector.segment_intervals(lines)
        
        db_job.progress = 60
        db_job.current_step = "metrics"
        db.commit()
        
        # Calibration (300DPI fallback)
        mm_per_px = 25.4 / 300 
        # Pass img_dims=(width, height) from GRAY image
        metrics_data = detector.calculate_metrics(intervals, mm_per_px=mm_per_px, img_dims=(gray_img.shape[1], gray_img.shape[0]))
        
        # Save Detections
        new_detection = models.Detection(
            case_id=case_id,
            palo_objects=jsonify_dict({
                "palos": palos,
                "marks": getattr(detector, 'last_marks', [])
            }),
            roi_config=jsonify_dict({"roi": roi})
        )
        db.add(new_detection)
        
        # Save Metrics (Including Phase 2 Clinical Metrics)
        is_na = metrics_data.get("total") == "N/A"
        new_metric = models.Metric(
            case_id=case_id,
            total_count=-1 if is_na else int(metrics_data["total"]),
            by_interval=jsonify_dict({"counts": metrics_data["intervals"]}),
            stats=jsonify_dict({k: v for k, v in metrics_data.items() if k not in ["total", "intervals"]}),
            confidence_level="High" if metrics_data.get("confidence_score", 0) > 75 and not is_na else "Low",
            confidence_reasons=jsonify_dict({
                "score": metrics_data.get("confidence_score", 0),
                "alerts": metrics_data.get("confidence_reasons", [])
            })
        )
        db.add(new_metric)
        
        # Save Warped Image
        processed_filename = f"warped_{file_name}"
        processed_path = UPLOAD_DIR / processed_filename
        import cv2
        cv2.imwrite(str(processed_path), raw_img)
        
        # Update existing CaseFile or create one? 
        # The upload endpoint already created one. Let's update it.
        db_file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).order_by(models.CaseFile.created_at.desc()).first()
        if db_file:
            db_file.processed_images_urls = {"warped": str(processed_path)}
        
        db_job.progress = 100
        db_job.status = models.JobStatus.DONE
        db_job.current_step = "concluido"
        
        # Check if needs review
        if metrics_data.get("regional_confidence", {}).get("needs_review", False):
             # You might want a specific status for this
             # For now, let's keep it DONE but the frontend will show the warnings
             db_case.status = models.CaseStatus.DONE 
        else:
             db_case.status = models.CaseStatus.DONE
             
        db.commit()
    except Exception as e:
        print(f"[VISION-JOB-ERROR]: {e}")
        db_job.status = models.JobStatus.FAILED
        db_job.error_message = str(e)
        db_case.status = models.CaseStatus.FAILED
        db.commit()

@app.get("/cases/{case_id}/detections", response_model=schemas.DetectionResponse)
def get_detections(case_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    det = db.query(models.Detection).filter(models.Detection.case_id == case_id).first()
    if not det:
        raise HTTPException(status_code=404, detail="Detecções não encontradas")
    return det

@app.get("/cases/{case_id}/metrics", response_model=schemas.MetricResponse)
def get_metrics(case_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    metrics = db.query(models.Metric).filter(models.Metric.case_id == case_id).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="Métricas não encontradas")
    return metrics

@app.post("/cases/{case_id}/report/finalize")
def finalize_report(
    case_id: int, 
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # 1. Validate State
        case = db.query(models.Case).filter(models.Case.id == case_id).first()
        if not case: raise HTTPException(status_code=404, detail="Case not found")

        # CRITICAL: Block PDF if ROI is invalid or metrics are N/A
        metrics = db.query(models.Metric).filter(models.Metric.case_id == case_id).first()
        if metrics and (metrics.total_count == -1 or metrics.confidence_level == "Low" or "N/A" in str(metrics.by_interval)):
             # We check for -1 or N/A strings as indicators of failure
             raise HTTPException(
                 status_code=400, 
                 detail="BLOQUEIO DE SEGURANÇA: A ROI do exame é inválida ou inconclusiva. "
                        "Ajuste a ROI manualmente antes de tentar finalizar o laudo."
             )
        
        if not payload.get("is_reviewed", False):
            raise HTTPException(status_code=400, detail="O laudo deve ser revisado e a flag de confirmação marcada antes de finalizar.")
        
        # 2. Render PDF (ReportLab)
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        
        filename = f"report_{case_id}_{uuid.uuid4().hex[:8]}.pdf"
        filepath = UPLOAD_DIR / filename
        
        c = canvas.Canvas(str(filepath), pagesize=A4)
        page_w, page_h = A4
        
        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, page_h - 60, "LAUDO DE AVALIAÇÃO PALOGRÁFICA")
        c.setStrokeColorRGB(0.2, 0.4, 0.8) # Blue accent
        c.line(50, page_h - 70, page_w - 50, page_h - 70)
        
        # Patient Info
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, page_h - 100, "DADOS DO EXAMINANDO")
        c.setFont("Helvetica", 11)
        c.drawString(50, page_h - 120, f"Referência Interna: #{case.id}")
        c.drawString(50, page_h - 135, f"Código do Paciente: {case.patient_code}")
        c.drawString(50, page_h - 150, f"Data de Emissão: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        
        # Synthesis Title
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, page_h - 190, "SÍNTESE CLÍNICA E INTERPRETAÇÃO")
        c.setStrokeColorRGB(0.8, 0.8, 0.8)
        c.line(50, page_h - 195, page_w - 50, page_h - 195)
        
        # Main Text
        c.setFont("Helvetica", 11)
        text_object = c.beginText(50, page_h - 220)
        text_object.setLeading(14)
        
        raw_text = payload.get("final_text", "")
        # Basic wrap logic (very simple)
        for line in raw_text.split('\n'):
            if not line.strip(): 
                text_object.textLine("")
                continue
            text_object.textLine(line)
            
        c.drawText(text_object)
        
        # Footer
        c.setFont("Helvetica-Oblique", 8)
        c.setStrokeColorRGB(0.9, 0.9, 0.9)
        c.line(50, 60, page_w - 50, 60)
        footer_text = "Este documento é um suporte técnico para avaliação psicológica. A validade jurídica requer a assinatura do profissional habilitado."
        c.drawCentredString(page_w / 2, 45, footer_text)
        c.drawCentredString(page_w / 2, 35, "Gerado por PaloCheck v3 - Sistema de Visão Computacional Avançada")
        
        c.save()
        
        # 3. Save Record
        # (Assuming Report model exists or using CaseFile for now)
        case.status = models.CaseStatus.DONE
        db.commit()
        
        return {
            "status": "success", 
            "report_url": f"http://localhost:8000/storage/uploads/{filename}"
        }
        
    except Exception as e:
        print(f"[REPORT-ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cases/{case_id}/report/draft")
def get_report_draft(case_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN, models.UserRole.PSYCHOLOGIST]))):
    metrics = db.query(models.Metric).filter(models.Metric.case_id == case_id).first()
    if not metrics:
        raise HTTPException(status_code=404, detail="Métricas não encontradas")
    
    ruleset = db.query(models.Ruleset).filter(models.Ruleset.is_active == True).first()
    if not ruleset:
        from report_engine import DEFAULT_RULESET
        ruleset_data = DEFAULT_RULESET
    else:
        ruleset_data = {
            "thresholds": ruleset.thresholds,
            "templates": ruleset.templates
        }
    
    from report_engine import ReportEngine
    engine = ReportEngine(ruleset_data)
    
    context = {
        "patient_id": case_id,
        "date": datetime.now().strftime("%d/%m/%Y")
    }
    
    draft = engine.generate_draft(
        metrics={
            "total": metrics.total_count,
            "intervals": metrics.by_interval["counts"],
            "nor": metrics.stats["nor"],
            "cv": metrics.stats["cv"],
            "trend": metrics.stats.get("trend", 0),
            "mean": metrics.stats["mean"],
            "avg_pressure": metrics.stats["avg_pressure"],
            "avg_spacing_mm": metrics.stats["avg_spacing_mm"],
            "slant": metrics.stats.get("slant", 90),
            "interline_avg_mm": metrics.stats.get("interline_avg_mm", "N/A"),
            "tremor_suggested": metrics.stats.get("tremor_suggested", False),
            "crossings_detected": metrics.stats.get("crossings_detected", False)
        },
        context=context
    )
    return {"draft_text": draft}
def generate_clinical_pdf(case, filepath, clinical_data, db):
    """
    Generates a comprehensive professional PDF report for palographic analysis.
    """
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.colors import HexColor
    from reportlab.lib.units import mm
    
    # Get metrics from database
    metric = db.query(models.Metric).filter(models.Metric.case_id == case.id).first()
    metrics_data = metric.stats if metric else {}
    by_interval = metric.by_interval if metric else {}
    
    c = canvas.Canvas(str(filepath), pagesize=A4)
    page_w, page_h = A4
    
    # Colors
    primary_blue = HexColor("#1E40AF")
    dark_gray = HexColor("#374151")
    light_gray = HexColor("#9CA3AF")
    bg_blue = HexColor("#EFF6FF")
    
    y = page_h - 50
    
    # === HEADER ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "LAUDO DE AVALIAÇÃO PALOGRÁFICA")
    y -= 5
    c.setStrokeColor(primary_blue)
    c.setLineWidth(2)
    c.line(50, y, page_w - 50, y)
    y -= 25
    
    # === PATIENT INFO ===
    c.setFillColor(dark_gray)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "DADOS DO EXAMINANDO")
    y -= 18
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Referência Interna: #{case.id}")
    c.drawString(250, y, f"Código: {case.patient_code}")
    y -= 14
    c.drawString(50, y, f"Data de Emissão: {datetime.now().strftime('%d/%m/%Y às %H:%M')}")
    y -= 30
    
    # === PRODUTIVIDADE ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "1. PRODUTIVIDADE")
    y -= 5
    c.setStrokeColor(light_gray)
    c.setLineWidth(0.5)
    c.line(50, y, page_w - 50, y)
    y -= 18
    
    # Interval counts
    counts = by_interval.get("counts", [0, 0, 0, 0, 0])
    total = sum(counts) if counts else 0
    nor = metrics_data.get("nor", 0)
    cv = metrics_data.get("cv", 0)
    
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "Palos por Tempo:")
    x_pos = 150
    for i, count in enumerate(counts[:5]):
        c.drawString(x_pos, y, f"{i+1}º: {count}")
        x_pos += 70
    y -= 16
    c.drawString(50, y, f"Total de Palos: {total}")
    c.drawString(200, y, f"NOR: {nor:.2f}" if nor else "NOR: N/A")
    c.drawString(320, y, f"CV: {cv:.2f}%" if cv else "CV: N/A")
    y -= 28
    
    # === INCLINAÇÃO ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "2. INCLINAÇÃO (SLANT)")
    y -= 5
    c.setStrokeColor(light_gray)
    c.line(50, y, page_w - 50, y)
    y -= 18
    
    slant_avg = metrics_data.get("slant", 90)
    slant_by_interval = metrics_data.get("slant_by_interval", [90]*5)
    slant_class = clinical_data.get("slant", {}).get("classification", "")
    
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Média Geral: {slant_avg:.1f}°")
    if slant_class:
        c.drawString(180, y, f"Classificação: {slant_class}")
    y -= 16
    c.drawString(50, y, "Por Tempo:")
    x_pos = 120
    for i, angle in enumerate(slant_by_interval[:5]):
        c.drawString(x_pos, y, f"{i+1}º: {angle:.1f}°")
        x_pos += 70
    y -= 28
    
    # === TAMANHO DOS PALOS ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "3. TAMANHO DOS PALOS (mm)")
    y -= 5
    c.setStrokeColor(light_gray)
    c.line(50, y, page_w - 50, y)
    y -= 18
    
    size_max = metrics_data.get("size_max_by_interval", [0]*5)
    size_min = metrics_data.get("size_min_by_interval", [0]*5)
    
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "Maior:")
    x_pos = 100
    for i, sz in enumerate(size_max[:5]):
        c.drawString(x_pos, y, f"{i+1}º: {sz:.2f}")
        x_pos += 70
    y -= 16
    c.drawString(50, y, "Menor:")
    x_pos = 100
    for i, sz in enumerate(size_min[:5]):
        c.drawString(x_pos, y, f"{i+1}º: {sz:.2f}")
        x_pos += 70
    y -= 28
    
    # === LAYOUT E MARGENS ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "4. LAYOUT E MARGENS (mm)")
    y -= 5
    c.setStrokeColor(light_gray)
    c.line(50, y, page_w - 50, y)
    y -= 18
    
    margins_mm = metrics_data.get("margins_mm", {})
    top_margin = margins_mm.get("top", 0)
    left_margins = margins_mm.get("left", [0]*5)
    right_margins = margins_mm.get("right", [0]*5)
    interline = metrics_data.get("interline_avg_mm", 0)
    
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Margem Superior: {top_margin:.1f} mm")
    c.drawString(220, y, f"Média Entrelinhas: {interline:.1f} mm")
    y -= 16
    c.drawString(50, y, "Margens Esq.:")
    x_pos = 140
    for i, m in enumerate(left_margins[:5]):
        c.drawString(x_pos, y, f"{i+1}º: {m:.1f}")
        x_pos += 60
    y -= 16
    c.drawString(50, y, "Margens Dir.:")
    x_pos = 140
    for i, m in enumerate(right_margins[:5]):
        c.drawString(x_pos, y, f"{i+1}º: {m:.1f}")
        x_pos += 60
    y -= 28
    
    # === INDICADORES QUALITATIVOS ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "5. INDICADORES QUALITATIVOS")
    y -= 5
    c.setStrokeColor(light_gray)
    c.line(50, y, page_w - 50, y)
    y -= 18
    
    qual = clinical_data.get("qualitative", {})
    tremor = qual.get("tremor_confirmed", False)
    crossings = qual.get("crossings", False)
    hooks = qual.get("hooks", {})
    
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Tremor: {'Sim' if tremor else 'Não confirmado'}")
    c.drawString(200, y, f"Cruzamentos: {'Sim' if crossings else 'Não'}")
    y -= 16
    hooks_total = sum(hooks.values()) if isinstance(hooks, dict) else 0
    c.drawString(50, y, f"Ganchos: {hooks_total} total")
    if isinstance(hooks, dict) and hooks_total > 0:
        hook_detail = f"(Sup.Esq: {hooks.get('top_left', 0)}, Sup.Dir: {hooks.get('top_right', 0)}, Inf.Esq: {hooks.get('bottom_left', 0)}, Inf.Dir: {hooks.get('bottom_right', 0)})"
        c.drawString(150, y, hook_detail)
    y -= 35
    
    # === OBSERVAÇÕES DO PSICÓLOGO ===
    c.setFillColor(primary_blue)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "6. SÍNTESE CLÍNICA E OBSERVAÇÕES")
    y -= 5
    c.setStrokeColor(light_gray)
    c.line(50, y, page_w - 50, y)
    y -= 18
    
    observation = clinical_data.get("observation", "")
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 10)
    
    if observation:
        # Word wrap the observation text
        from textwrap import wrap
        lines = []
        for paragraph in observation.split('\n'):
            if paragraph.strip():
                lines.extend(wrap(paragraph, width=85))
            else:
                lines.append("")
        
        for line in lines[:15]:  # Limit to 15 lines on first page
            c.drawString(50, y, line)
            y -= 14
    else:
        c.setFillColor(light_gray)
        c.drawString(50, y, "(Nenhuma observação registrada pelo psicólogo)")
        y -= 14
    
    # === FOOTER ===
    c.setFillColor(light_gray)
    c.setFont("Helvetica-Oblique", 8)
    c.setStrokeColor(light_gray)
    c.setLineWidth(0.5)
    c.line(50, 80, page_w - 50, 80)
    c.drawCentredString(page_w / 2, 65, "Este documento é um suporte técnico à avaliação psicológica.")
    c.drawCentredString(page_w / 2, 55, "Requer validação e assinatura de profissional habilitado (CRP).")
    c.drawCentredString(page_w / 2, 40, f"Gerado por PaloCheck Pro • {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    
    # Signature area
    c.setFillColor(dark_gray)
    c.setFont("Helvetica", 9)
    c.line(350, 100, page_w - 50, 100)
    c.drawCentredString((350 + page_w - 50) / 2, 88, "Assinatura do Psicólogo / CRP")
    
    c.save()


@app.post("/cases/{case_id}/clinical")
def save_clinical_analysis(
    case_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Saves analysis AND returns PDF URL if finalized."""
    try:
        case = db.query(models.Case).filter(models.Case.id == case_id).first()
        if not case: 
            raise HTTPException(status_code=404, detail="Case not found")

        analysis = db.query(models.ClinicalAnalysis).filter(models.ClinicalAnalysis.case_id == case_id).first()
        if not analysis:
            analysis = models.ClinicalAnalysis(case_id=case_id)
            db.add(analysis)
        
        # Persist data
        analysis.manual_overrides = {
            "productivity": payload.get("productivity", {}),
            "slant": payload.get("slant", {}),
            "sizes": payload.get("sizes", {}),
            "margins": payload.get("margins", {}),
            "qualitative": payload.get("qualitative", {})
        }
        # Observation is the final text used in the report
        final_text = payload.get("observation", "")
        analysis.interpretations = {"final_text": final_text}
        
        # Check if we should finalize and generate PDF
        report_url = None
        if payload.get("is_reviewed", False):
            analysis.status = "FINALIZED"
            case.status = models.CaseStatus.DONE
            
            # Generate PDF
            try:
                filename = f"report_{case_id}_{uuid.uuid4().hex[:8]}.pdf"
                filepath = UPLOAD_DIR / filename
                print(f"[PDF] Generating PDF at {filepath}")
                # Pass full clinical data and db for metrics lookup
                clinical_data = {
                    "productivity": payload.get("productivity", {}),
                    "slant": payload.get("slant", {}),
                    "sizes": payload.get("sizes", {}),
                    "margins": payload.get("margins", {}),
                    "qualitative": payload.get("qualitative", {}),
                    "observation": payload.get("observation", "")
                }
                generate_clinical_pdf(case, filepath, clinical_data, db)
                report_url = f"http://localhost:8000/storage/uploads/{filename}"
                print(f"[PDF] Generated successfully: {report_url}")

                print(f"[PDF] Generated successfully: {report_url}")
            except Exception as pdf_err:
                print(f"[PDF-ERROR] {pdf_err}")
                import traceback
                traceback.print_exc()
                # Re-raise so we can see the error
                raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(pdf_err)}")


        db.commit()
        return {
            "status": "success", 
            "message": "Dados salvos com sucesso!",
            "report_url": report_url
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CLINICAL-SAVE-ERROR] {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/cases/{case_id}/file")
def get_case_file_info(case_id: int, db: Session = Depends(get_db)):
    file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    # Try to return the warped/processed version if available
    path_to_serve = file.processed_images_urls.get("warped") or file.original_file_url
    filename = Path(path_to_serve).name
    return {"url": f"http://localhost:8000/storage/uploads/{filename}"}

# Normative Groups Management
@app.get("/settings/normative-groups", response_model=List[schemas.NormativeGroupResponse])
def list_normative_groups(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.NormativeGroup).all()

@app.post("/settings/normative-groups", response_model=schemas.NormativeGroupResponse)
def create_normative_group(data: schemas.NormativeGroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.check_role([models.UserRole.ADMIN, models.UserRole.PSYCHOLOGIST]))):
    new_group = models.NormativeGroup(**data.model_dump())
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@app.get("/settings/normative-groups/{group_id}", response_model=schemas.NormativeGroupResponse)
def get_normative_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.NormativeGroup).filter(models.NormativeGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo normativo não encontrado")
    return group

# Password Reset Endpoints
@app.post("/api/auth/password/reset-request")
def reset_password_request(data: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    # Always return 200 OK for security (avoid email enumeration)
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user:
        # 1. Generate secure token
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # 2. Save token hash
        new_reset_token = models.PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=30)
        )
        db.add(new_reset_token)
        db.commit()
        
        # 3. Log link to console (Simulation)
        print("\n" + "="*50)
        print("SIMULAÇÃO DE ENVIO DE E-MAIL (DEV MODE)")
        print(f"Para: {user.email}")
        print(f"Link: http://localhost:3001/redefinir-senha?token={token}")
        print("="*50 + "\n")
        
    return {"message": "Se o e-mail estiver cadastrado, você receberá um link de recuperação."}

@app.post("/api/auth/password/reset-confirm")
def reset_password_confirm(data: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(data.token.encode()).hexdigest()
    
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token_hash == token_hash,
        models.PasswordResetToken.expires_at > datetime.utcnow(),
        models.PasswordResetToken.used_at == None
    ).first()
    
    if not reset_token:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")
    
    user = db.query(models.User).filter(models.User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    # 1. Update password
    user.password_hash = auth.get_password_hash(data.new_password)
    
    # 2. Mark token as used
    reset_token.used_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Sua senha foi redefinida com sucesso."}

# =============================================================================
# Phase 2: Audit Trail (MetricsHistory)
# =============================================================================

@app.post("/cases/{case_id}/clinical/history")
def log_metric_change(
    case_id: int,
    data: schemas.MetricsHistoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Log a clinical metric change for audit purposes."""
    new_entry = models.MetricsHistory(
        case_id=case_id,
        field_name=data.field_name,
        old_value=data.old_value,
        new_value=data.new_value,
        changed_by=current_user.id
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"status": "logged", "id": new_entry.id}

@app.get("/cases/{case_id}/clinical/history")
def get_metrics_history(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Retrieve audit trail for a case's clinical metrics."""
    history = db.query(models.MetricsHistory).filter(
        models.MetricsHistory.case_id == case_id
    ).order_by(models.MetricsHistory.changed_at.desc()).all()
    
    return [
        {
            "id": h.id,
            "field_name": h.field_name,
            "old_value": h.old_value,
            "new_value": h.new_value,
            "changed_by": h.changed_by,
            "changed_at": h.changed_at.isoformat()
        }
        for h in history
    ]

@app.post("/cases/{case_id}/dataset-approve")
def approve_for_dataset(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Saves the current case results to the AI Training Dataset folder."""
    # 1. Fetch case and detections
    case_file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).first()
    detection = db.query(models.Detection).filter(models.Detection.case_id == case_id).first()
    
    if not case_file or not detection:
        raise HTTPException(status_code=404, detail="Dados de detecção não encontrados para este caso.")
    
    # 2. Setup Dataset Directory
    dataset_dir = Path("storage/dataset")
    dataset_dir.mkdir(parents=True, exist_ok=True)
    
    # 3. Save JSON metadata
    import json
    meta_path = dataset_dir / f"case_{case_id}_meta.json"
    with open(meta_path, "w") as f:
        json.dump({
            "case_id": case_id,
            "palos": detection.palo_objects.get("palos", []),
            "approved_by": current_user.id,
            "approved_at": datetime.now().isoformat()
        }, f)
    
    # 4. Copy current warped image
    import shutil
    img_path = Path(case_file.original_file_url)
    dest_img = dataset_dir / f"case_{case_id}_raw.png"
    if img_path.exists():
        shutil.copy(img_path, dest_img)
    
    return {"status": "success", "message": "Caso salvo no dataset de treinamento!"}

@app.get("/settings/dataset-stats")
def get_dataset_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Returns statistics about the collected dataset for AI training."""
    dataset_dir = Path("storage/dataset")
    if not dataset_dir.exists():
        return {"case_count": 0, "total_palos": 0}
    
    import json
    meta_files = list(dataset_dir.glob("*.json"))
    total_palos = 0
    
    for meta in meta_files:
        try:
            with open(meta, "r") as f:
                data = json.load(f)
                total_palos += len(data.get("palos", []))
        except:
            continue
            
    return {
        "case_count": len(meta_files),
        "total_palos": total_palos,
        "target_cases": 50,
        "progress_percent": min(100, round((len(meta_files) / 50) * 100, 1))
    }

# Additional endpoints (etc.) will be added in further phases

# Manual Correction Endpoints
@app.delete("/cases/{case_id}/detections/items/{item_id}")
def delete_detection_item(
    case_id: int, 
    item_id: str, 
    type: str, # "palo" or "mark"
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    detection = db.query(models.Detection).filter(models.Detection.case_id == case_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detecção não encontrada")
    
    # Create copies to trigger SQLAlchemy change tracking
    new_objects = dict(detection.palo_objects)
    
    if type == "palo":
        # Convert item_id to int for palos
        try:
            p_id = int(item_id)
            new_list = [p for p in new_objects.get("palos", []) if p.get("id") != p_id]
            new_objects["palos"] = new_list
        except:
            pass
    elif type == "mark":
        new_list = [m for m in new_objects.get("marks", []) if m.get("id") != item_id]
        new_objects["marks"] = new_list
    
    detection.palo_objects = new_objects
    db.commit()
    
    # Recalculate metrics automatically after deletion
    # Get common data
    case_file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).order_by(models.CaseFile.created_at.desc()).first()
    if not case_file: return {"status": "item removed"}
    
    from vision import PaloDetector
    detector = PaloDetector()
    
    # Load image for height reference in clustering
    # This is slightly expensive but ensures metrics stay synced
    try:
        import cv2
        img = cv2.imread(case_file.original_file_url)
        img_h = img.shape[0]
        img_w = img.shape[1]
        
        # 1. Cluster surviving palos
        # Ensure we pass marks back to detector for segmentation
        detector.last_marks = new_objects.get("marks", [])
        lines = detector.cluster_lines(new_objects.get("palos", []), img_height=img_h)
        intervals = detector.segment_intervals(lines)
        
        # 2. Recalculate metrics
        mm_per_px = detection.scale_mm_per_px or (25.4 / 300)
        metrics_data = detector.calculate_metrics(intervals, mm_per_px=mm_per_px, img_dims=(img_w, img_h))
        
        # 3. Update existing metrics record
        db_metric = db.query(models.Metric).filter(models.Metric.case_id == case_id).first()
        if db_metric:
            db_metric.total_count = int(metrics_data["total"])
            db_metric.by_interval = jsonify_dict({"counts": metrics_data["intervals"]})
            
            # Map remaining metrics to stats field
            db_metric.stats = jsonify_dict({k: v for k, v in metrics_data.items() if k not in ["total", "intervals"]})
            db.commit()
    except Exception as e:
        print(f"[RECALC-ERROR] {e}")

    return {"status": "item removed and metrics updated"}

@app.post("/cases/{case_id}/detections/items")
def add_detection_item(
    case_id: int, 
    item: dict, 
    type: str, # "palo" or "mark"
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    detection = db.query(models.Detection).filter(models.Detection.case_id == case_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detecção não encontrada")
    
    new_objects = dict(detection.palo_objects)
    
    if type == "palo":
        palos = list(new_objects.get("palos", []))
        # Avoid duplicates
        if not any(p.get("id") == item.get("id") for p in palos):
            palos.append(item)
            new_objects["palos"] = palos
    elif type == "mark":
        marks = list(new_objects.get("marks", []))
        if not any(m.get("id") == item.get("id") for m in marks):
            marks.append(item)
            new_objects["marks"] = marks
    
    detection.palo_objects = new_objects
    db.commit()
    
    # Recalculate metrics
    case_file = db.query(models.CaseFile).filter(models.CaseFile.case_id == case_id).order_by(models.CaseFile.created_at.desc()).first()
    if case_file:
        from vision import PaloDetector
        detector = PaloDetector()
        try:
            import cv2
            img = cv2.imread(case_file.original_file_url)
            img_h = img.shape[0]
            img_w = img.shape[1]
            detector.last_marks = new_objects.get("marks", [])
            lines = detector.cluster_lines(new_objects.get("palos", []), img_height=img_h)
            intervals = detector.segment_intervals(lines)
            mm_per_px = detection.scale_mm_per_px or (25.4 / 300)
            metrics_data = detector.calculate_metrics(intervals, mm_per_px=mm_per_px, img_dims=(img_w, img_h))
            
            db_metric = db.query(models.Metric).filter(models.Metric.case_id == case_id).first()
            if db_metric:
                print(f"[RECALC] Case {case_id}: Total={metrics_data['total']}, Intervals={metrics_data['intervals']}")
                db_metric.total_count = int(metrics_data["total"])
                db_metric.by_interval = jsonify_dict({"counts": metrics_data["intervals"]})
                db_metric.stats = jsonify_dict({k: v for k, v in metrics_data.items() if k not in ["total", "intervals"]})
                db.commit()
        except Exception as e:
            import traceback
            print(f"[RECALC-ERROR] {e}")
            traceback.print_exc()

    return {"status": "item added/restored"}

@app.put("/cases/{case_id}/metrics/overrides")
def override_metrics(
    case_id: int, 
    payload: dict, # {"counts": [n1, n2, n3, n4, n5]}
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    db_metric = db.query(models.Metric).filter(models.Metric.case_id == case_id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Métricas não encontradas")
    
    counts = payload.get("counts", [])
    if len(counts) != 5:
        raise HTTPException(status_code=400, detail="Forneça exatamente 5 intervalos")
    
    # 1. Update Counts
    db_metric.by_interval = jsonify_dict({"counts": [int(c) for c in counts]})
    db_metric.total_count = sum(int(c) for c in counts)
    
    # 2. Recalculate Aggregate Stats
    import numpy as np
    vals = [int(v) for v in counts if v > 0]
    if vals:
        mean = np.mean(vals)
        std = np.std(vals)
        cv = (std / mean * 100) if mean > 0 else 0
        
        # NOR calculation logic (as used in vision.py)
        # Using the same simplified logic as current detector for consistency
        diffs = [abs(counts[i+1] - counts[i]) for i in range(len(counts)-1)]
        nor = (sum(diffs) / db_metric.total_count * 100) if db_metric.total_count > 0 else 0
        
        new_stats = dict(db_metric.stats)
        new_stats["mean"] = round(float(mean), 2)
        new_stats["cv"] = round(float(cv), 2)
        new_stats["nor"] = round(float(nor), 2)
        new_stats["is_manual_override"] = True
        
        db_metric.stats = jsonify_dict(new_stats)
    
    db.commit()
    return {"status": "metrics updated with manual overrides"}

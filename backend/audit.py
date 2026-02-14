from datetime import datetime
from sqlalchemy.orm import Session
import models

class AuditLogger:
    @staticmethod
    def log(db: Session, user_id: int, action: str, case_id: int = None, payload: dict = None):
        """
        Records an imutable event in the database for auditing purposes.
        """
        new_log = models.AuditLog(
            user_id=user_id,
            case_id=case_id,
            action=action,
            payload=payload or {},
            created_at=datetime.utcnow()
        )
        db.add(new_log)
        db.commit()
        
    @staticmethod
    def log_change(db: Session, user_id: int, case_id: int, field: str, old_value: any, new_value: any):
        """
        Specific helper for tracking changes in data (e.g., manual correction of palos).
        """
        payload = {
            "field": field,
            "old": old_value,
            "new": new_value
        }
        AuditLogger.log(db, user_id, f"UPDATE_{field.upper()}", case_id, payload)

    @staticmethod
    def log_export(db: Session, user_id: int, case_id: int, report_type: str):
        """
        Tracks who exported which report and when.
        """
        AuditLogger.log(db, user_id, f"EXPORT_{report_type.upper()}", case_id)

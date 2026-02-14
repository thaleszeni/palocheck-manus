import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Case, CaseFile, Detection, Metric, ClinicalAnalysis, Job, Report

# Database setup
DATABASE_URL = "sqlite:///./palocheck.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def cleanup():
    db = SessionLocal()
    try:
        print("🚀 Iniciando limpeza profunda do ambiente...")
        
        # 1. Clear database tables
        print("Emptying database tables...")
        tables = [Report, ClinicalAnalysis, Metric, Detection, Job, CaseFile, Case]
        for table in tables:
            try:
                db.query(table).delete()
            except Exception as e:
                print(f"Skipping table {table.__tablename__}: {e}")
        db.commit()
        print("✅ Banco de dados limpo.")
        
        # 2. Clear storage/uploads
        upload_dir = "storage/uploads"
        if os.path.exists(upload_dir):
            print(f"Cleaning {upload_dir}...")
            for filename in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f'Failed to delete {file_path}. Reason: {e}')
            print("✅ Pasta uploads limpa.")
            
        print("\n✨ Ambiente resetado com sucesso! PRONTO PARA OS NOVOS 50 CASOS.")
        
    except Exception as e:
        print(f"❌ Erro durante a limpeza: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()

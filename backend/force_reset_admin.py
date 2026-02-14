import models
import auth
import database
from sqlalchemy.orm import Session

def force_reset_admin():
    db = next(database.get_db())
    
    admin_user = db.query(models.User).filter(models.User.email == "admin@palocheck.com.br").first()
    if not admin_user:
        print("Admin não encontrado. Criando novo...")
        admin_user = models.User(
            name="Administrador PaloCheck",
            email="admin@palocheck.com.br",
            role=models.UserRole.ADMIN
        )
        db.add(admin_user)
    
    admin_user.password_hash = auth.get_password_hash("palo123")
    db.commit()
    print("Senha do Admin resetada para: palo123")

if __name__ == "__main__":
    force_reset_admin()

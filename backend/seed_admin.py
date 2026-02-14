import models
import auth
import database
from sqlalchemy.orm import Session

def seed_admin():
    db = next(database.get_db())
    
    # Check if admin already exists
    existing_admin = db.query(models.User).filter(models.User.email == "admin@palocheck.com.br").first()
    if existing_admin:
        print("Admin já existe no sistema.")
        return

    hashed_password = auth.get_password_hash("palo123")
    
    admin_user = models.User(
        name="Thales Admin Master",
        email="admin@palocheck.com.br",
        password_hash=hashed_password,
        role=models.UserRole.ADMIN
    )
    
    db.add(admin_user)
    db.commit()
    print("Usuário Admin criado com sucesso!")
    print("Email: admin@palocheck.com.br")
    print("Senha: palo123admin")

if __name__ == "__main__":
    seed_admin()

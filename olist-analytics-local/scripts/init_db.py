import sys
import os

# Adiciona a pasta 'src' ao path do sistema para permitir imports relativos
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT_DIR, "src"))

from database.database import engine, Base
from database.models import BusinessProfile, FinancialRecord

def init_db():
    print("--- Inicializando banco de dados SQLite ---")
    Base.metadata.create_all(bind=engine)
    print("--- Tabelas criadas com sucesso. ---")

if __name__ == "__main__":
    init_db()

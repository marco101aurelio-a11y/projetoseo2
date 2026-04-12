import sys
import os
import unittest
from sqlalchemy.orm import Session

# Adiciona a pasta 'src' ao path do sistema para permitir imports relativos
# Se o arquivo está em src/tests/test_finance_db.py, o pai direto é src.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.database import SessionLocal, engine, Base
from services.financial_service import FinancialService
from database.models import BusinessProfile, FinancialRecord

class TestFinancialDB(unittest.TestCase):
    def setUp(self):
        # Garante que as tabelas existam
        Base.metadata.create_all(bind=engine)
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_create_and_update_profile(self):
        print("\n--- Testando Perfil de Negócio ---")
        profile_data = {
            "funnel_type": "b2c_ecommerce",
            "fixed_costs": 5000.0,
            "tax_rate": 0.15,
            "cogs_pct": 0.25
        }
        profile = FinancialService.update_profile(self.db, profile_data)
        self.assertEqual(profile.fixed_costs, 5000.0)
        self.assertEqual(profile.tax_rate, 0.15)
        print(f"--- Perfil salvo: {profile.funnel_type}, Custos: {profile.fixed_costs}")

    def test_add_financial_record(self):
        print("\n--- Testando Registro Financeiro (Verdade Financeira) ---")
        record_data = {
            "month_year": "2024-10",
            "real_revenue": 150000.0,
            "real_orders": 1200,
            "source": "manual"
        }
        record = FinancialService.add_financial_record(self.db, record_data)
        self.assertEqual(record.real_revenue, 150000.0)
        
        # Teste de update (mesmo mês)
        record_data["real_revenue"] = 155000.0
        record_updated = FinancialService.add_financial_record(self.db, record_data)
        self.assertEqual(record_updated.real_revenue, 155000.0)
        print(f"--- Registro salvo para {record.month_year}: R$ {record.real_revenue}")

    def test_get_latest_record(self):
        print("\n--- Testando Busca de Último Registro ---")
        latest = FinancialService.get_latest_record(self.db)
        self.assertIsNotNone(latest)
        print(f"--- Ultimo faturamento encontrado: {latest.month_year} - R$ {latest.real_revenue}")

if __name__ == "__main__":
    unittest.main()

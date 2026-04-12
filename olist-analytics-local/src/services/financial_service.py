from sqlalchemy.orm import Session
from database.models import BusinessProfile, FinancialRecord
from datetime import datetime
from typing import Optional, List

class FinancialService:
    @staticmethod
    def get_profile(db: Session) -> Optional[BusinessProfile]:
        """Busca o único perfil de negócio (para MVP de usuário único)."""
        return db.query(BusinessProfile).first()

    @staticmethod
    def update_profile(db: Session, data: dict) -> BusinessProfile:
        """Cria ou atualiza o perfil do negócio (Passos 1-3 do Wizard)."""
        profile = db.query(BusinessProfile).first()
        if not profile:
            profile = BusinessProfile(**data)
            db.add(profile)
        else:
            for key, value in data.items():
                setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def add_financial_record(db: Session, data: dict) -> FinancialRecord:
        """Adiciona um registro mensal de faturamento real (Verdade Financeira)."""
        # Se já existir um registro para o mesmo mês, sobrescrevemos
        existing = db.query(FinancialRecord).filter(
            FinancialRecord.month_year == data.get("month_year")
        ).first()
        
        if existing:
            for key, value in data.items():
                setattr(existing, key, value)
            record = existing
        else:
            record = FinancialRecord(**data)
            db.add(record)
            
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_latest_record(db: Session) -> Optional[FinancialRecord]:
        """Retorna o registro financeiro mais recente para análise."""
        return db.query(FinancialRecord).order_by(FinancialRecord.month_year.desc()).first()

    @staticmethod
    def get_all_records(db: Session) -> List[FinancialRecord]:
        """Retorna todo o histórico financeiro."""
        return db.query(FinancialRecord).order_by(FinancialRecord.month_year.desc()).all()

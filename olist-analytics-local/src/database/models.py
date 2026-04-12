from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class BusinessProfile(Base):
    """
    Perfil do negócio do usuário (configurado via Wizard).
    """
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    funnel_type = Column(String, default="b2c_ecommerce")
    fixed_costs = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    cogs_pct = Column(Float, default=0.0)
    marketplace_fee = Column(Float, default=0.0)
    shipping_rate = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FinancialRecord(Base):
    """
    Registros mensais de faturamento real (Verdade Financeira).
    """
    __tablename__ = "financial_records"

    id = Column(Integer, primary_key=True, index=True)
    month_year = Column(String, index=True) # Formato: YYYY-MM
    real_revenue = Column(Float, default=0.0)
    real_orders = Column(Integer, default=0)
    real_leads = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0) # GA4 fallback
    source = Column(String, default="manual") # manual, api, or chat
    created_at = Column(DateTime, default=datetime.utcnow)

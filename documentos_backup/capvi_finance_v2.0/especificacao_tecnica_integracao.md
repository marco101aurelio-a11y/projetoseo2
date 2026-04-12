# 🔗 Especificação Técnica: Integração Finance + Meta Ads

## Fluxo de Dados Detalhado

### Cenário: Usuário quer ver DRE com dados reais do Meta

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Usuario acessa Dashboard                                    │
│     └─> Chama: GET /api/v1/finance/analyze/meta                │
│                  └─ Params: user_id, date_range="last_7d"      │
│                                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────▼───────────────────┐
        │  FinancialService.analyze_with   │
        │      meta_data(user_id, ...)     │
        └──────────────┬───────────────────┘
                       │
   ┌───────────────────┼───────────────────┐
   │                   │                   │
   ▼                   ▼                   ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   DB.GET    │  │  MetaAds    │  │   Validate   │
│ BusinessPro │  │  Engine.    │  │   Timezone   │
│    file     │  │  performance│  │   & Dates    │
└─────────────┘  └─────────────┘  └──────────────┘
   │                   │                   │
   │ Returns:          │ Returns:          │ Returns:
   │ {funnel_type,     │ {spend,clicks,    │ dateRange
   │  cogs_pct,        │  impressions,     │ validated
   │  fixed_costs,     │  sessions,        │
   │  tax_rate, ...}   │  conversions, ...}│
   │                   │                   │
   └───────────────────┼───────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ _extract_traffic_data()         │
        │ Constrói TrafficRawData         │
        │ {investment, clicks,            │
        │  impressions, sessions,         │
        │  orders, revenue,               │
        │  cogs_pct, fixed_costs, ...}   │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │  FinanceEngine.                 │
        │  analyze_from_raw()             │
        │  (JAX pure functions)           │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ Output: {                       │
        │  summary: {...},                │
        │  metricas_primarias: {...},     │
        │  metricas_secundarias: {...},   │
        │  dre: {...},                    │
        │  engenharia_reversa: {...},     │
        │  diagnostico: {...}             │
        │ }                               │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ save_financial_record()         │
        │ Armazena em BD:                 │
        │ FinancialRecord {               │
        │   user_id, month, revenue,      │
        │   ebitda, roas, ...             │
        │ }                               │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ _calculate_blended_roas()       │
        │ Compara:                        │
        │ - Meta ROAS (do pixel)          │
        │ - Real ROAS (receita/spend)     │
        │ - Diferença                     │
        └──────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │ _format_response()              │
        │ Prepara JSON final              │
        └──────────────┬─────────────────┘
                       │
┌──────────────────────▼──────────────────────┐
│ Retorna ao Cliente:                         │
│ {                                           │
│   "success": true,                          │
│   "data": {                                 │
│     "summary": {...},                       │
│     "dre": {...},                           │
│     "blended_roas": {                       │
│       "meta_roas": 2.5,                     │
│       "real_roas": 2.3,                     │
│       "delta_pct": -8.0,                    │
│       "insight": "..."                      │
│     },                                      │
│     "from_database": true                   │
│   },                                        │
│   "meta": {...}                             │
│ }                                           │
└────────────────────────────────────────────┘
```

---

## Classes e Métodos Necessários

### 1. models.py (SQLAlchemy)

```python
# ─── BusinessProfile ───
class BusinessProfile(Base):
    __tablename__ = "business_profiles"
    
    # Chaves
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), unique=True, index=True)
    
    # Configurações do negócio
    funnel_type = Column(String(50), default="b2c_ecommerce")
    cogs_pct = Column(Float, default=0.35)
    fixed_costs = Column(Float, default=5000.0)
    tax_rate = Column(Float, nullable=True)
    shipping_rate = Column(Float, nullable=True)
    marketplace_fee = Column(Float, nullable=True)
    avg_frequency = Column(Float, nullable=True)  # compras/ano
    avg_customer_life = Column(Float, nullable=True)  # meses
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relacionamento
    financial_records = relationship("FinancialRecord", backref="profile")

# ─── FinancialRecord ───
class FinancialRecord(Base):
    __tablename__ = "financial_records"
    
    # Chaves
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), ForeignKey("business_profiles.user_id"))
    
    # Período
    year_month = Column(String(7), index=True)  # "2025-04"
    
    # Dados brutos do Meta
    investment = Column(Float)
    clicks = Column(Integer)
    impressions = Column(Integer)
    sessions = Column(Integer)
    
    # Dados de negócio
    orders = Column(Integer)
    revenue = Column(Float)
    leads = Column(Integer, default=0)
    mqls = Column(Integer, default=0)
    sqls = Column(Integer, default=0)
    
    # Métricas calculadas (cache para dashboard)
    ebitda = Column(Float)
    roas = Column(Float)
    ltv_cac = Column(Float)
    health_score = Column(Integer)  # 0-100
    
    # ROAS comparado
    meta_roas = Column(Float, nullable=True)  # Do pixel
    real_roas = Column(Float, nullable=True)  # Receita / Spend
    blended_roas = Column(Float, nullable=True)
    
    # Meta
    calculated_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50), default="api")  # "api" ou "manual"
```

### 2. database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Usar variável de ambiente para DB URL
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./capvi.db")

engine = create_engine(DB_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
```

### 3. financial_service.py (Orchestrator)

```python
from engines.finance_engine import FinanceEngine, TrafficRawData
from engines.meta_ads_engine import MetaAdsEngine
from models import BusinessProfile, FinancialRecord
from database import SessionLocal
from datetime import datetime

class FinancialService:
    """Orquestra fluxo completo: Meta → Finance → BD"""
    
    def __init__(self):
        self.db = SessionLocal()
    
    def analyze_with_meta_data(self, user_id: str, date_range: str = "last_7d"):
        """
        Fluxo completo: busca profile, puxa Meta, calcula finance, salva BD
        """
        try:
            # 1. Busca profile
            profile = self._get_or_create_profile(user_id)
            
            # 2. Valida Meta credentials
            meta_engine = self._init_meta_engine(user_id)
            if not meta_engine:
                return self._error_response("Meta credentials não configuradas")
            
            # 3. Puxa dados do Meta
            meta_perf = meta_engine.get_performance(date_range)
            
            # 4. Extrai TrafficRawData
            traffic_data = self._extract_traffic_data(meta_perf, profile)
            
            # 5. Calcula finance
            finance_engine = FinanceEngine(profile.funnel_type)
            dre_result = finance_engine.analyze_from_raw(traffic_data)
            
            # 6. Calcula Blended ROAS
            blended_data = self._calculate_blended_roas(
                dre_result, meta_perf, traffic_data
            )
            dre_result["data"]["blended_roas"] = blended_data
            
            # 7. Salva em BD
            self._save_financial_record(user_id, dre_result, traffic_data)
            
            # 8. Retorna formatado
            return {
                "success": True,
                "data": dre_result["data"],
                "from_database": True,
                "meta": dre_result["meta"]
            }
            
        except Exception as e:
            return self._error_response(str(e))
    
    def _extract_traffic_data(self, meta_perf: dict, profile: BusinessProfile) -> TrafficRawData:
        """Converte Meta performance em TrafficRawData"""
        
        summary = meta_perf["summary"]
        
        # Extrai conversões (compras) da campanha
        total_conversions = 0
        total_revenue = 0
        for campaign in meta_perf.get("campaigns", []):
            total_conversions += campaign.get("conversions", 0)
            if campaign.get("roas"):
                total_revenue += campaign["spend"] * campaign["roas"]
        
        # Fallback se não tiver conversões rastreadas
        if total_conversions == 0:
            total_conversions = 1  # Mínimo para evitar div by zero
        if total_revenue == 0:
            total_revenue = summary["total_spend"] * 2.0  # Estimativa
        
        return TrafficRawData(
            investment=summary["total_spend"],
            clicks=summary["total_clicks"],
            impressions=summary["total_impressions"],
            sessions=int(summary["total_clicks"] * 0.8),  # Est: 80% se tornam sessões
            orders=total_conversions,
            revenue=total_revenue,
            
            # Do perfil
            cogs_pct=profile.cogs_pct,
            fixed_costs=profile.fixed_costs,
            
            # Taxas customizadas
            tax_rate=profile.tax_rate,
            shipping_rate=profile.shipping_rate,
            marketplace_fee=profile.marketplace_fee,
            avg_frequency=profile.avg_frequency,
            avg_customer_life=profile.avg_customer_life,
            
            funnel_type=profile.funnel_type
        )
    
    def _calculate_blended_roas(self, dre_result: dict, meta_perf: dict, 
                                traffic_data: TrafficRawData) -> dict:
        """Compara Meta ROAS vs Receita Real / Spend"""
        
        # ROAS do Meta (baseado no pixel)
        meta_roas = dre_result["data"]["summary"]["roas"]
        
        # ROAS real (receita reportada / gasto)
        real_roas = traffic_data.revenue / traffic_data.investment
        
        # Delta
        delta = real_roas - meta_roas
        delta_pct = (delta / meta_roas) * 100 if meta_roas > 0 else 0
        
        # Insight
        if delta_pct < -20:
            insight = "⚠️ Pixel está subtraindo receita. Verifique rastreamento."
        elif delta_pct < -5:
            insight = "Receita real é menor que Meta rastreia. Normal (-5% ok)."
        elif delta_pct > 10:
            insight = "✅ Receita real supera o rastreamento do pixel."
        else:
            insight = "✅ Meta está rastreando corretamente."
        
        return {
            "meta_roas": round(meta_roas, 2),
            "real_roas": round(real_roas, 2),
            "delta": round(delta, 2),
            "delta_pct": round(delta_pct, 1),
            "insight": insight,
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    def _save_financial_record(self, user_id: str, dre_result: dict, 
                               traffic_data: TrafficRawData):
        """Persiste resultado em BD para histórico"""
        
        from dateutil.relativedelta import relativedelta
        today = datetime.utcnow()
        year_month = today.strftime("%Y-%m")
        
        record = FinancialRecord(
            user_id=user_id,
            year_month=year_month,
            
            # Brutos
            investment=traffic_data.investment,
            clicks=traffic_data.clicks,
            impressions=traffic_data.impressions,
            sessions=traffic_data.sessions,
            orders=traffic_data.orders,
            revenue=traffic_data.revenue,
            
            # Calculados
            ebitda=dre_result["data"]["summary"]["ebitda"],
            roas=dre_result["data"]["summary"]["roas"],
            ltv_cac=dre_result["data"]["summary"]["ltv_cac_ratio"],
            health_score=dre_result["data"]["diagnostico"]["health_score"],
            
            # Blended
            meta_roas=dre_result["data"]["blended_roas"]["meta_roas"],
            real_roas=dre_result["data"]["blended_roas"]["real_roas"],
            blended_roas=dre_result["data"]["blended_roas"]["delta_pct"],
            
            source="api"
        )
        
        self.db.add(record)
        self.db.commit()
    
    def _get_or_create_profile(self, user_id: str) -> BusinessProfile:
        """Busca ou cria profile padrão"""
        profile = self.db.query(BusinessProfile).filter_by(user_id=user_id).first()
        
        if not profile:
            profile = BusinessProfile(
                user_id=user_id,
                funnel_type="b2c_ecommerce",
                cogs_pct=0.35,
                fixed_costs=5000.0
            )
            self.db.add(profile)
            self.db.commit()
        
        return profile
    
    def _init_meta_engine(self, user_id: str) -> Optional[MetaAdsEngine]:
        """Busca credenciais do Meta e inicializa engine"""
        # TODO: Buscar em BD/cache com credentials do usuário
        try:
            return MetaAdsEngine(
                app_id=os.getenv("META_APP_ID"),
                app_secret=os.getenv("META_APP_SECRET"),
                access_token=os.getenv(f"META_ACCESS_TOKEN_{user_id}"),
                ad_account_id=os.getenv(f"META_AD_ACCOUNT_{user_id}")
            )
        except Exception as e:
            print(f"Erro inicializando Meta: {e}")
            return None
    
    def _error_response(self, message: str) -> dict:
        return {
            "success": False,
            "error": message,
            "data": None
        }
```

---

## API Endpoints (FastAPI)

```python
# main_api.py (adicionar)

from fastapi import APIRouter, Depends, HTTPException
from financial_service import FinancialService
from database import get_db

router = APIRouter(prefix="/api/v1/finance", tags=["finance"])

# ─── 1. Salvar Perfil (Onboarding) ───
@router.post("/profile")
async def save_profile(
    user_id: str,
    funnel_type: str,
    cogs_pct: float,
    fixed_costs: float,
    tax_rate: Optional[float] = None,
    shipping_rate: Optional[float] = None,
    marketplace_fee: Optional[float] = None,
    avg_frequency: Optional[float] = None,
    avg_customer_life: Optional[float] = None,
    db = Depends(get_db)
):
    """Salva configurações do negócio no BD"""
    from models import BusinessProfile
    
    profile = db.query(BusinessProfile).filter_by(user_id=user_id).first()
    
    if profile:
        # Update
        profile.funnel_type = funnel_type
        profile.cogs_pct = cogs_pct
        # ... etc
    else:
        # Create
        profile = BusinessProfile(
            user_id=user_id,
            funnel_type=funnel_type,
            # ...
        )
        db.add(profile)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Perfil salvo",
        "profile": {
            "funnel_type": profile.funnel_type,
            "cogs_pct": profile.cogs_pct,
            "fixed_costs": profile.fixed_costs
        }
    }

# ─── 2. Buscar Perfil ───
@router.get("/profile")
async def get_profile(user_id: str, db = Depends(get_db)):
    """Retorna configurações atuais"""
    from models import BusinessProfile
    
    profile = db.query(BusinessProfile).filter_by(user_id=user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    return {
        "success": True,
        "profile": {
            "funnel_type": profile.funnel_type,
            "cogs_pct": profile.cogs_pct,
            "fixed_costs": profile.fixed_costs,
            "tax_rate": profile.tax_rate,
            "shipping_rate": profile.shipping_rate,
            "marketplace_fee": profile.marketplace_fee,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat()
        }
    }

# ─── 3. Registrar Faturamento Manual ───
@router.post("/records")
async def add_financial_record(
    user_id: str,
    month: str,  # "2025-04"
    revenue: float,
    orders: int,
    leads: Optional[int] = None,
    db = Depends(get_db)
):
    """Registra faturamento real do mês (pode ser chamado via chat)"""
    from models import FinancialRecord
    
    record = FinancialRecord(
        user_id=user_id,
        year_month=month,
        revenue=revenue,
        orders=orders,
        leads=leads or 0,
        source="manual"
    )
    
    db.add(record)
    db.commit()
    
    return {
        "success": True,
        "message": f"Registro de {month} salvo",
        "record": {
            "month": month,
            "revenue": revenue,
            "orders": orders
        }
    }

# ─── 4. Analisar com Dados do Meta (PRINCIPAL) ───
@router.get("/analyze/meta")
async def analyze_with_meta(
    user_id: str,
    date_range: str = "last_7d"
):
    """
    Fluxo completo:
    1. Busca perfil do usuário
    2. Puxa dados do Meta
    3. Calcula DRE
    4. Salva em BD
    5. Retorna com Blended ROAS
    """
    service = FinancialService()
    result = service.analyze_with_meta_data(user_id, date_range)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

# ─── 5. Histórico de Registros ───
@router.get("/history")
async def get_financial_history(
    user_id: str,
    months: int = 12,
    db = Depends(get_db)
):
    """Retorna últimos N meses de FinancialRecords"""
    from models import FinancialRecord
    from sqlalchemy import desc
    
    records = (
        db.query(FinancialRecord)
        .filter_by(user_id=user_id)
        .order_by(desc(FinancialRecord.year_month))
        .limit(months)
        .all()
    )
    
    return {
        "success": True,
        "records": [
            {
                "month": r.year_month,
                "revenue": r.revenue,
                "ebitda": r.ebitda,
                "roas": r.roas,
                "health_score": r.health_score,
                "blended_roas": r.blended_roas,
                "calculated_at": r.calculated_at.isoformat()
            }
            for r in records
        ]
    }
```

---

## Teste Integrado (pytest)

```python
# tests/test_financial_integration.py

def test_full_pipeline(test_user_id="user_123"):
    """Testa fluxo completo: Profile → Meta → Finance → BD"""
    
    db = SessionLocal()
    service = FinancialService()
    
    # 1. Save profile
    profile = BusinessProfile(
        user_id=test_user_id,
        funnel_type="b2c_ecommerce",
        cogs_pct=0.35,
        fixed_costs=5000.0
    )
    db.add(profile)
    db.commit()
    
    # 2. Analyze with Meta
    result = service.analyze_with_meta_data(test_user_id)
    
    assert result["success"] == True
    assert "blended_roas" in result["data"]
    assert result["from_database"] == True
    
    # 3. Verify BD
    record = db.query(FinancialRecord).filter_by(user_id=test_user_id).first()
    assert record is not None
    assert record.ebitda is not None
    assert record.blended_roas is not None
    
    print("✅ Full pipeline test passed!")
```

---

## Resumo das Mudanças

| Arquivo | Tipo | O que muda |
|---------|------|-----------|
| `models.py` | NEW | BusinessProfile, FinancialRecord |
| `database.py` | NEW | SQLAlchemy engine, sessionmaker |
| `financial_service.py` | NEW | Orchestrator (Meta → Finance → BD) |
| `finance_engine.py` | MODIFY | Corrigir `__init__`, adicionar docstrings |
| `meta_ads_engine.py` | MINOR | Sem mudanças (compatível) |
| `main_api.py` | MODIFY | Adicionar 5 endpoints novos |

---

## Diagrama de Arquitetura Final

```
        ┌─────────────────────────────────────────┐
        │         Frontend Dashboard               │
        │  (React - DRETable.tsx)                  │
        └──────────────────┬──────────────────────┘
                           │
                    GET /api/v1/finance/
                    analyze/meta
                           │
        ┌──────────────────▼──────────────────────┐
        │      FastAPI Router (main_api.py)       │
        │  - POST /profile                        │
        │  - GET /profile                         │
        │  - POST /records                        │
        │  - GET /analyze/meta (PRINCIPAL)        │
        │  - GET /history                         │
        └──────────────────┬──────────────────────┘
                           │
        ┌──────────────────▼──────────────────────┐
        │   FinancialService (Orchestrator) ✨    │
        │  - analyze_with_meta_data()             │
        │  - _extract_traffic_data()              │
        │  - _calculate_blended_roas()            │
        │  - _save_financial_record()             │
        └──┬───────────────────────────┬───────┬──┘
           │                           │       │
     ┌─────▼────────┐     ┌───────────▼────┐ │
     │ BusinessProf │     │  FinanceEngine │ │
     │   ile (BD)   │     │  + MetaAds     │ │
     └──────────────┘     │  Engine        │ │
                          └────────────────┘ │
                                             │
                          ┌──────────────────▼──┐
                          │ FinancialRecord(BD) │
                          │  (histórico)        │
                          └─────────────────────┘
```

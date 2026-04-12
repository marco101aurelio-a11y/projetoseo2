# 📦 finance_api_endpoints.py
#
# Cole essas rotas no seu main_api.py (ou crie um novo arquivo e importe)
#
# Instruções:
# 1. Copie a seção FastAPI Router para seu main_api.py
# 2. Certifique-se que tem os imports corretos
# 3. Inclua o router no FastAPI: app.include_router(router)
# 4. Teste com: curl ou Postman

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session

from database import get_db
from models import BusinessProfile, FinancialRecord
from financial_service_extended import FinancialService, RevenueValidator
from engines.meta_ads_engine import MetaAdsEngine
from engines.finance_engine import FinanceEngine, TrafficRawData

# ─────────────────────────────────────────────────────────
# Request/Response Models (Pydantic)
# ─────────────────────────────────────────────────────────

class SaveProfileRequest(BaseModel):
    """Dados do Onboarding/Wizard"""
    user_id: str = Field(..., description="ID único do usuário")
    funnel_type: str = Field("b2c_ecommerce", description="Tipo de funil")
    cogs_pct: float = Field(0.35, description="% de custo do produto")
    fixed_costs: float = Field(5000.0, description="Custos fixos mensais")
    tax_rate: Optional[float] = None
    shipping_rate: Optional[float] = None
    marketplace_fee: Optional[float] = None


class SaveFinancialRecordRequest(BaseModel):
    """Dados de faturamento mensal"""
    user_id: str
    month: str = Field(..., description="YYYY-MM")
    revenue: float = Field(..., description="Receita bruta do mês")
    orders: int = Field(..., description="Número de pedidos")
    leads: int = Field(0, description="Leads gerados (opcional)")


class ValidateAndSaveRequest(BaseModel):
    """Validação com salvamento"""
    user_id: str
    month: str = Field(..., description="YYYY-MM")
    revenue: float = Field(..., description="Receita reportada")
    orders: int
    leads: int = Field(0)
    validate_against_meta: bool = Field(
        True, 
        description="Validar contra dados do Meta?"
    )


class GetEstimateRequest(BaseModel):
    """Solicitar estimativa de receita"""
    user_id: str
    month: str = Field(..., description="YYYY-MM")


# ─────────────────────────────────────────────────────────
# FastAPI Router
# ─────────────────────────────────────────────────────────

router = APIRouter(
    prefix="/api/v1/finance",
    tags=["finance"],
    responses={404: {"description": "Not found"}}
)


# ───────────────── PERFIL (Onboarding) ──────────────────

@router.post("/profile")
async def save_business_profile(
    request: SaveProfileRequest,
    db: Session = Depends(get_db)
):
    """
    Salva ou atualiza perfil de negócio do usuário.
    
    Chamado no final do Wizard de onboarding.
    
    Example:
    POST /api/v1/finance/profile
    {
        "user_id": "user_123",
        "funnel_type": "b2c_ecommerce",
        "cogs_pct": 0.35,
        "fixed_costs": 5000.0
    }
    """
    
    try:
        # Buscar ou criar
        profile = db.query(BusinessProfile).filter_by(user_id=request.user_id).first()
        
        if profile:
            # Update
            profile.funnel_type = request.funnel_type
            profile.cogs_pct = request.cogs_pct
            profile.fixed_costs = request.fixed_costs
            profile.tax_rate = request.tax_rate
            profile.shipping_rate = request.shipping_rate
            profile.marketplace_fee = request.marketplace_fee
            profile.updated_at = datetime.utcnow()
        else:
            # Create
            profile = BusinessProfile(
                user_id=request.user_id,
                funnel_type=request.funnel_type,
                cogs_pct=request.cogs_pct,
                fixed_costs=request.fixed_costs,
                tax_rate=request.tax_rate,
                shipping_rate=request.shipping_rate,
                marketplace_fee=request.marketplace_fee,
            )
            db.add(profile)
        
        db.commit()
        db.refresh(profile)
        
        return {
            "success": True,
            "action": "CREATED" if not profile.id else "UPDATED",
            "message": f"Perfil salvo para {request.user_id}",
            "profile": {
                "user_id": profile.user_id,
                "funnel_type": profile.funnel_type,
                "cogs_pct": profile.cogs_pct,
                "fixed_costs": profile.fixed_costs,
                "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
            }
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile")
async def get_business_profile(
    user_id: str = Query(..., description="ID do usuário"),
    db: Session = Depends(get_db)
):
    """
    Recupera perfil de negócio salvo.
    
    Example:
    GET /api/v1/finance/profile?user_id=user_123
    """
    
    profile = db.query(BusinessProfile).filter_by(user_id=user_id).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    return {
        "success": True,
        "profile": {
            "user_id": profile.user_id,
            "funnel_type": profile.funnel_type,
            "cogs_pct": profile.cogs_pct,
            "fixed_costs": profile.fixed_costs,
            "tax_rate": profile.tax_rate,
            "shipping_rate": profile.shipping_rate,
            "marketplace_fee": profile.marketplace_fee,
            "auto_validate_revenue": profile.auto_validate_revenue,
            "validation_tolerance_pct": profile.validation_tolerance_pct,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
        }
    }


# ────────────── REGISTROS FINANCEIROS ──────────────────

@router.post("/records")
async def save_financial_record(
    request: SaveFinancialRecordRequest,
    db: Session = Depends(get_db)
):
    """
    Registra faturamento mensal (entrada manual).
    
    ⚠️ Se você quer validação automática, use /validate-and-save
    
    Example:
    POST /api/v1/finance/records
    {
        "user_id": "user_123",
        "month": "2025-04",
        "revenue": 150000.00,
        "orders": 1200,
        "leads": 0
    }
    """
    
    try:
        record = FinancialRecord(
            user_id=request.user_id,
            year_month=request.month,
            revenue=request.revenue,
            orders=request.orders,
            leads=request.leads,
            source="manual"
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        
        return {
            "success": True,
            "message": f"Registrado faturamento de {request.month}",
            "record": {
                "month": request.month,
                "revenue": request.revenue,
                "orders": request.orders,
                "leads": request.leads,
                "saved_at": record.calculated_at.isoformat(),
            }
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/records")
async def get_financial_records(
    user_id: str = Query(..., description="ID do usuário"),
    months: int = Query(12, description="Quantos meses de histórico"),
    db: Session = Depends(get_db)
):
    """
    Retorna histórico de registros financeiros.
    
    Example:
    GET /api/v1/finance/records?user_id=user_123&months=6
    """
    
    from sqlalchemy import desc
    
    records = (
        db.query(FinancialRecord)
        .filter_by(user_id=user_id)
        .order_by(desc(FinancialRecord.year_month))
        .limit(months)
        .all()
    )
    
    if not records:
        return {
            "success": True,
            "records": [],
            "message": "Nenhum registro encontrado"
        }
    
    return {
        "success": True,
        "total": len(records),
        "records": [
            {
                "month": r.year_month,
                "revenue": r.revenue,
                "orders": r.orders,
                "leads": r.leads,
                "ebitda": r.ebitda,
                "ebitda_pct": r.ebitda_pct,
                "roas": r.roas,
                "health_score": r.health_score,
                "status_geral": r.status_geral,
                "validation_status": r.validation_status,
                "validation_confidence": r.validation_confidence,
                "source": r.source,
                "calculated_at": r.calculated_at.isoformat() if r.calculated_at else None,
            }
            for r in records
        ]
    }


# ────────── VALIDAÇÃO & ANÁLISE ────────────────────────

@router.post("/validate-and-save")
async def validate_and_save_revenue(
    request: ValidateAndSaveRequest,
    db: Session = Depends(get_db)
):
    """
    ✨ NOVO: Valida faturamento contra Meta + salva automaticamente.
    
    Fluxo:
    1. Busca Meta performance do mês (se disponível)
    2. Valida revenue reportada contra expectativa
    3. Salva com status de validação
    4. Retorna confirmação para o Chat/User
    
    Exemplo de uso no Chat:
    User: "Registre meu faturamento de R$ 150.000 para Outubro"
    Chat chama:
    POST /api/v1/finance/validate-and-save
    {
        "user_id": "user_123",
        "month": "2025-10",
        "revenue": 150000.0,
        "orders": 1200,
        "validate_against_meta": true
    }
    
    Resposta esperada:
    {
        "success": true,
        "saved": true,
        "validation": {
            "status": "ALINHADO",
            "confidence": 0.85,
            "message": "✅ Pequena variação de 12%. Normal.",
            "details": {...}
        },
        "message": "Registrado com sucesso!"
    }
    """
    
    service = FinancialService(db)
    
    try:
        # 1. Buscar profile
        profile = db.query(BusinessProfile).filter_by(user_id=request.user_id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
        
        # 2. Se auto_validate, buscar Meta data (opcional)
        meta_performance = None
        if request.validate_against_meta and profile.auto_validate_revenue:
            # TODO: Implementar busca de Meta performance do mês
            # Por enquanto, deixa como None (sistema usa benchmark)
            pass
        
        # 3. Salvar com validação
        result = service.save_financial_record_with_validation(
            user_id=request.user_id,
            month=request.month,
            revenue_reported=request.revenue,
            orders=request.orders,
            leads=request.leads,
            meta_performance=meta_performance
        )
        
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/estimate")
async def get_revenue_estimate(
    user_id: str = Query(..., description="ID do usuário"),
    month: str = Query(..., description="YYYY-MM"),
    db: Session = Depends(get_db)
):
    """
    Retorna estimativa de qual deveria ser a receita.
    
    Útil para o usuário conferir antes de reportar.
    
    Example:
    GET /api/v1/finance/estimate?user_id=user_123&month=2025-04
    
    Resposta:
    {
        "estimated_revenue": 125000.00,
        "roas_used": 2.5,
        "roas_source": "historical",
        "range": {
            "min": 100000.00,
            "max": 150000.00
        },
        "message": "Você deveria ter receita entre..."
    }
    """
    
    service = FinancialService(db)
    estimate = service.get_validation_estimate(user_id=user_id, month=month)
    
    if "error" in estimate:
        raise HTTPException(status_code=400, detail=estimate.get("message"))
    
    return {
        "success": True,
        "estimate": estimate,
    }


@router.get("/analyze/meta")
async def analyze_with_meta(
    user_id: str = Query(..., description="ID do usuário"),
    date_range: str = Query("last_7d", description="Período: last_7d | last_30d | this_month"),
    db: Session = Depends(get_db)
):
    """
    Fluxo completo: Meta → Finance Engine → DRE com validação.
    
    Prioridade:
    1. Se houver faturamento real salvo no BD → usa esse (Verdade Financeira)
    2. Senão → estima a partir de Meta conversions
    3. Sempre usa custos do Onboarding salvo
    
    Response:
    {
        "success": true,
        "data": {
            "summary": {...},
            "dre": {...},
            "diagnostico": {...},
            "blended_roas": {...},
            "is_real_data": true/false
        },
        "from_database": true/false
    }
    """
    
    service = FinancialService(db)
    
    try:
        result = service.analyze_with_meta_data(user_id, date_range)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))
        
        return result
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
async def compare_months(
    user_id: str = Query(..., description="ID do usuário"),
    month_current: str = Query(..., description="YYYY-MM (mês atual)"),
    month_previous: Optional[str] = Query(None, description="YYYY-MM (mês anterior, opcional)"),
    db: Session = Depends(get_db)
):
    """
    Compara dois meses: crescimento, tendências, alertas de mudança.
    
    Example:
    GET /api/v1/finance/compare?user_id=user_123&month_current=2025-04&month_previous=2025-03
    
    Resposta:
    {
        "success": true,
        "comparison": {
            "revenue": {
                "current": 150000,
                "previous": 140000,
                "growth_pct": 7.14,
                "trend": "UP"
            },
            "ebitda": {...},
            "alerts": [...]
        }
    }
    """
    
    try:
        from sqlalchemy import desc
        
        # Buscar registros
        current = db.query(FinancialRecord).filter_by(
            user_id=user_id, year_month=month_current
        ).first()
        
        if not current:
            raise HTTPException(status_code=404, detail=f"Nenhum dado para {month_current}")
        
        # Se month_previous não foi informado, usar anterior
        if not month_previous:
            from datetime import datetime, timedelta
            prev_date = (
                datetime.strptime(month_current, "%Y-%m") - timedelta(days=30)
            ).strftime("%Y-%m")
            month_previous = prev_date
        
        previous = db.query(FinancialRecord).filter_by(
            user_id=user_id, year_month=month_previous
        ).first()
        
        if not previous:
            return {
                "success": True,
                "comparison": {
                    "month_current": month_current,
                    "month_previous": month_previous,
                    "message": "Sem dados para comparação",
                    "current": {
                        "revenue": current.revenue,
                        "ebitda": current.ebitda,
                        "roas": current.roas,
                    },
                    "previous": None,
                }
            }
        
        # Calcular deltas
        def calc_growth(curr, prev):
            if not prev or prev == 0:
                return None
            return ((curr - prev) / prev) * 100 if curr else 0
        
        revenue_growth = calc_growth(current.revenue, previous.revenue)
        ebitda_growth = calc_growth(current.ebitda, previous.ebitda)
        
        # Trending
        revenue_trend = "UP" if revenue_growth > 5 else "DOWN" if revenue_growth < -5 else "FLAT"
        ebitda_trend = "UP" if ebitda_growth > 5 else "DOWN" if ebitda_growth < -5 else "FLAT"
        
        # Alertas
        alerts = []
        if revenue_growth and revenue_growth < -15:
            alerts.append({
                "severity": "CRITICAL",
                "message": f"Receita caiu {abs(revenue_growth):.1f}%"
            })
        elif ebitda_growth and ebitda_growth < -20:
            alerts.append({
                "severity": "WARNING",
                "message": f"EBITDA caiu {abs(ebitda_growth):.1f}%"
            })
        
        return {
            "success": True,
            "comparison": {
                "month_current": month_current,
                "month_previous": month_previous,
                "revenue": {
                    "current": round(current.revenue, 2) if current.revenue else 0,
                    "previous": round(previous.revenue, 2) if previous.revenue else 0,
                    "growth_pct": round(revenue_growth, 2) if revenue_growth else 0,
                    "trend": revenue_trend,
                },
                "ebitda": {
                    "current": round(current.ebitda, 2) if current.ebitda else 0,
                    "previous": round(previous.ebitda, 2) if previous.ebitda else 0,
                    "growth_pct": round(ebitda_growth, 2) if ebitda_growth else 0,
                    "trend": ebitda_trend,
                },
                "roas": {
                    "current": round(current.roas, 2) if current.roas else 0,
                    "previous": round(previous.roas, 2) if previous.roas else 0,
                },
                "alerts": alerts,
            }
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────
# Como incluir no main_api.py
# ─────────────────────────────────────────────────────────
#
# from fastapi import FastAPI
# from finance_api_endpoints import router as finance_router
#
# app = FastAPI()
# app.include_router(finance_router)
#
# OU, se quiser manter tudo em um arquivo, copie as rotas direto.


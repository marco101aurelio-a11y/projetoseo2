from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from math_jax import MathIntelligenceJAX
from agent_squad import AgentSquadOrchestrator
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from datetime import datetime
import uvicorn
import os
import sys

# Adiciona src ao path para imports dos novos módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.meta_ads_service import MetaAdsService
from connectors.meta_to_finance_connector import MetaToFinanceConnector
from engines.finance_engine import FinanceEngine, TrafficRawData
from engines.funnel_models import list_funnel_types
from routes.meta_auth import router as meta_auth_router

load_dotenv()

app = FastAPI(title="Capvi Intelligence API - JAX Bridge")

# Configuração de CORS para permitir que o App de SEO acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, coloque o domínio do seu app aqui
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

math_engine   = MathIntelligenceJAX()
squad         = AgentSquadOrchestrator()
meta_service  = MetaAdsService()
meta_connector= MetaToFinanceConnector()

# Register Routers
app.include_router(meta_auth_router)

class AgentChatRequest(BaseModel):
    agent_name: str
    chat_history: List[Dict[str, Any]]
    user_input: str

class KeywordAnalysisRequest(BaseModel):
    keyword: str
    volume: int
    competition: int
    cpc: float

class KeywordSimulationRequest(BaseModel):
    keyword: str
    country: str = "BR"
    engine: str = "google"

class GrowthRequest(BaseModel):
    impact: float
    confidence: float
    ease: float

class RetentionRequest(BaseModel):
    r: float  # Recency
    f: float  # Frequency
    m: float  # Monetary

class DreRequest(BaseModel):
    investment: float
    roas: float
    fixed_costs: float
    cogs_pct: float = 0.3

# ── Novos modelos para Meta Ads + FinanceEngine v2.0
class MetaAnalyzeRequest(BaseModel):
    """
    Requisição para análise completa: Meta Ads → FinanceEngine.
    Combina dados da API (ad_account_id) com dados do negócio (cogs_pct, fixed_costs).
    """
    ad_account_id: str           # ID da conta Meta (sem 'act_')
    period: str = "maximum"    # Período: last_7d, last_30d, last_90d, maximum
    funnel_type: str = "b2c_ecommerce"  # Modelo de funil do negócio
    cogs_pct: float = 0.30       # % custo do produto
    fixed_costs: float = 3000.0  # R$ custos fixos mensais
    tax_rate: Optional[float] = None
    shipping_rate: Optional[float] = None
    marketplace_fee: Optional[float] = None
    use_mock: bool = False       # True para usar dados de demo sem API real
    access_token: Optional[str] = None # Token real do OAuth

class RawTrafficRequest(BaseModel):
    """
    Análise direta via dados manuais — sem API externa.
    Usuário informa as métricas brutas manualmente no Estúdio.
    """
    investment: float
    clicks: int
    impressions: int
    sessions: int
    orders: int
    revenue: float
    cogs_pct: float = 0.30
    fixed_costs: float = 3000.0
    funnel_type: str = "b2c_ecommerce"
    leads: int = 0
    mqls: int = 0
    sqls: int = 0
    tax_rate: Optional[float] = None
    shipping_rate: Optional[float] = None
    marketplace_fee: Optional[float] = None

class FinanceRequest(BaseModel):
    revenue: float
    costs: float
    fixed_costs: float
    cac: float
    ltv: float

@app.get("/")
def read_root():
    return {"status": "online", "engine": "JAX V5.2", "features": ["SEO", "Growth", "Retention", "Finance", "DRE Pro"]}

@app.post("/analyze/keyword")
def analyze_keyword(data: KeywordAnalysisRequest):
    try:
        result = math_engine.analyze_keyword(data.volume, data.competition, data.cpc)
        return {"keyword": data.keyword, "analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/keyword_simulation")
def simulate_keyword(data: KeywordSimulationRequest):
    try:
        return math_engine.simulate_keyword_metrics(data.keyword, data.country, data.engine)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/growth")
def analyze_growth(data: GrowthRequest):
    try:
        return math_engine.analyze_growth(data.impact, data.confidence, data.ease)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/retention")
def analyze_retention(data: RetentionRequest):
    try:
        return math_engine.analyze_retention(data.r, data.f, data.m)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/finance")
def analyze_finance(data: FinanceRequest):
    try:
        return math_engine.analyze_finance(
            data.revenue, data.costs, data.fixed_costs, data.cac, data.ltv
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/dre")
async def analyze_dre(request: DreRequest):
    try:
        return math_engine.simulate_dre(
            request.investment, request.roas, request.fixed_costs, request.cogs_pct
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analyze/benchmarks")
def get_benchmarks():
    try:
        return math_engine.get_benchmarks()
    except Exception as e:
        print(f"⚠️ Erro ao buscar benchmarks: {e}")
        # Fallback premium se os CSVs não existirem
        return {
            "total_customers": 158420,
            "avg_recency": 142.5,
            "avg_frequency": 2.14,
            "avg_monetary": 184.50,
            "segments": {
                "Champions": 1240,
                "Loyal": 4520,
                "At Risk": 8900,
                "Lost": 2400
            }
        }

@app.post("/agent/chat")
async def process_agent_chat(req: AgentChatRequest):
    try:
        response = squad.chat_with_agent(req.agent_name, req.chat_history, req.user_input)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════
# NOVOS ENDPOINTS — Meta Ads + FinanceEngine v2.0
# Retrocompatíveis — não afetam endpoints anteriores
# ═══════════════════════════════════════════════════════

@app.get("/meta/campaigns/{ad_account_id}")
async def get_meta_campaigns(ad_account_id: str, period: str = "last_30d"):
    """
    Busca métricas de campanhas do Meta Ads.
    Se META_ACCESS_TOKEN não estiver configurado, retorna mock.
    """
    try:
        if not meta_service._initialized:
            return meta_service.get_mock_data(ad_account_id)
        result = meta_service.get_campaign_metrics(ad_account_id, period)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/meta/accounts")
async def get_meta_accounts(access_token: str):
    """Lista as contas de anúncios do usuário usando um token real."""
    token_to_use = access_token
    if access_token == "env_master_token":
        env_token = os.getenv("META_ACCESS_TOKEN")
        token_to_use = env_token if env_token and not env_token.startswith("INSERT_") else None

    result = meta_service.get_my_ad_accounts(token_to_use)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/finance/analyze/meta")
async def analyze_meta_to_dre(req: MetaAnalyzeRequest):
    """
    Pipeline: Meta Ads -> Normalização -> FinanceEngine.
    """
    try:
        # 1. Busca dados do Meta
        # Prioriza dados do .env se disponíveis e o frontend não mandou nada específico
        env_token = os.getenv("META_ACCESS_TOKEN")
        env_account = os.getenv("META_AD_ACCOUNT_ID")
        
        token = req.access_token or (env_token if not env_token.startswith("INSERT_") else None)
        ad_account = req.ad_account_id
        
        if ad_account == "demo_account" and env_account and not env_account.startswith("INSERT_"):
            ad_account = env_account

        is_demo = ad_account == "demo_account" or not token
        
        if req.use_mock or is_demo:
            meta_res = meta_service.get_mock_data(ad_account)
        else:
            meta_res = meta_service.get_campaign_metrics(
                ad_account_id=ad_account, 
                date_preset=req.period,
                access_token=token
            )
        
        # Se falhou com os dados reais, tentamos o mock como fallback final
        if not meta_res["success"] and not is_demo:
             meta_res = meta_service.get_mock_data("demo_account")
             meta_res["meta"]["fallback_active"] = True

        if not meta_res["success"]:
            raise HTTPException(status_code=400, detail=meta_res["error"])

        # 2. Normaliza via conector -> TrafficRawData
        traffic_data = meta_connector.build_traffic_data(
            meta_insights=meta_res["data"]["campanhas_raw"],
            cogs_pct=req.cogs_pct,
            fixed_costs=req.fixed_costs,
            funnel_type=req.funnel_type,
            tax_rate=req.tax_rate,
            shipping_rate=req.shipping_rate,
            marketplace_fee=req.marketplace_fee,
        )

        # 3. Roda FinanceEngine JAX
        engine = FinanceEngine(funnel_type=traffic_data.funnel_type)
        result = engine.analyze_from_raw(traffic_data)

        # 4. Enriquece com dados das campanhas individuais
        result["meta"]["calculado_em"]      = datetime.utcnow().isoformat()
        result["meta"]["fonte"]              = "meta_ads"
        result["meta"]["periodo"]            = req.period
        result["meta"]["ad_account_id"]     = ad_account
        result["meta"]["is_demo"]           = is_demo
        result["meta"]["fallback_active"]   = meta_res["meta"].get("fallback_active", False)
        
        result["data"]["campanhas_meta"]    = meta_res["data"]["campanhas"]
        result["data"]["resumo_meta"]       = meta_res["data"]["resumo"]

        return result

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/finance/analyze/raw")
async def analyze_raw_traffic(req: RawTrafficRequest):
    """
    Análise via dados manuais — sem API externa.
    Usuário informa as métricas diretamente no Estúdio.
    """
    try:
        data = TrafficRawData(
            investment=req.investment, clicks=req.clicks,
            impressions=req.impressions, sessions=req.sessions,
            orders=req.orders, revenue=req.revenue,
            cogs_pct=req.cogs_pct, fixed_costs=req.fixed_costs,
            funnel_type=req.funnel_type, leads=req.leads,
            mqls=req.mqls, sqls=req.sqls,
            tax_rate=req.tax_rate, shipping_rate=req.shipping_rate,
            marketplace_fee=req.marketplace_fee,
        )
        engine = FinanceEngine(funnel_type=req.funnel_type)
        result = engine.analyze_from_raw(data)
        result["meta"]["calculado_em"] = datetime.utcnow().isoformat()
        result["meta"]["fonte"] = "manual"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/finance/funnel-types")
def get_funnel_types():
    """Lista os modelos de funil disponíveis para o onboarding do usuário."""
    return {"success": True, "data": list_funnel_types(), "error": None, "meta": {}}


if __name__ == "__main__":
    print("Iniciando Ponte JAX V5.2 - Capvi Intelligence na porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

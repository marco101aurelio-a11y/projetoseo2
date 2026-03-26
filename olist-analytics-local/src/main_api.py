from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from math_jax import MathIntelligenceJAX
import uvicorn

app = FastAPI(title="Capvi Intelligence API - JAX Bridge")

# Configuração de CORS para permitir que o App de SEO acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, coloque o domínio do seu app aqui
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

math_engine = MathIntelligenceJAX()

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

if __name__ == "__main__":
    print("🔋 Iniciando Ponte JAX V5.2 — Capvi Intelligence na porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

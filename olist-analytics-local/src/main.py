from fastapi import FastAPI
from processor import OlistProcessor
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="V4 Analytics Engine")
processor = OlistProcessor()

@app.get("/")
def read_root():
    return {"status": "online", "module": "olist-analytics"}

@app.get("/api/rfm")
def get_rfm_summary():
    try:
        benchmarks = processor.get_summary_benchmarks()
        return benchmarks
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/benchmarks")
def get_full_benchmarks():
    # Retorna o resumo para ser injetado no Skill
    try:
        return processor.get_summary_benchmarks()
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

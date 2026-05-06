from supabase import Client
from datetime import datetime
from typing import Optional, List, Any

class FinancialService:
    @staticmethod
    def get_profile(db: Client) -> Optional[dict]:
        """Busca o perfil de negócio (primeiro registro da business_configs)."""
        res = db.table("business_configs").select("*").limit(1).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def update_profile(db: Client, data: dict) -> dict:
        """Cria ou atualiza o perfil do negócio no Supabase."""
        profile = FinancialService.get_profile(db)
        
        # Faz o map de campos síncronos se necessário (ex: meta_ad_account_id)
        if "id" in data: del data["id"] # Não sobrescrever ID serial/uuid
        
        if not profile:
            res = db.table("business_configs").insert(data).execute()
        else:
            res = db.table("business_configs").update(data).eq("id", profile["id"]).execute()
        
        return res.data[0] if res.data else {}

    @staticmethod
    def add_financial_record(db: Client, data: dict) -> dict:
        """Adiciona um registro na historical_metrics (Verdade Financeira)."""
        # Verifica se já existe um registro para o mesmo mês
        month_year = data.get("month_year")
        
        # Tenta encontrar registro existente
        existing = db.table("historical_metrics").select("id").eq("month_year", month_year).limit(1).execute()
        
        if existing.data:
            record_id = existing.data[0]["id"]
            res = db.table("historical_metrics").update(data).eq("id", record_id).execute()
        else:
            # Se não tiver metric_date, tentamos inferir
            if "metric_date" not in data and month_year:
                data["metric_date"] = f"{month_year}-01"
            
            res = db.table("historical_metrics").insert(data).execute()
            
        return res.data[0] if res.data else {}

    @staticmethod
    def get_latest_record(db: Client) -> Optional[dict]:
        """Retorna o registro financeiro mais recente."""
        res = db.table("historical_metrics").select("*").order("month_year", desc=True).limit(1).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def get_all_records(db: Client) -> List[dict]:
        """Retorna todo o histórico financeiro do Supabase."""
        res = db.table("historical_metrics").select("*").order("month_year", desc=True).execute()
        return res.data or []

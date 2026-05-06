import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Configuração Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Singleton do Cliente Supabase
_supabase: Client = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            # Fallback para evitar crash imediato se as chaves não estiverem no env
            print("⚠️ Aviso: SUPABASE_URL ou SUPABASE_KEY não configurados.")
        else:
            _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase

# Mock de get_db para manter compatibilidade com FastAPI Depends
def get_db():
    """
    Retorna o cliente Supabase. 
    Mantido o nome get_db para evitar quebra em main_api.py.
    """
    return get_supabase()

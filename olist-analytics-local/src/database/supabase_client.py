"""
supabase_client.py — Cliente Supabase para o Motor JAX (Capvi OS)
Substitui a conexão SQLite local pelo banco remoto compartilhado.
"""

import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_supabase_client = None

def get_supabase():
    """Retorna instância singleton do cliente Supabase."""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError(
                "❌ SUPABASE_URL e SUPABASE_KEY devem estar configurados no .env"
            )
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

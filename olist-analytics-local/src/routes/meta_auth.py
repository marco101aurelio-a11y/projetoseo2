from fastapi import APIRouter, HTTPException, Query
import os
import requests
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/auth/meta", tags=["Meta Auth"])

# Meta Config
APP_ID = os.getenv("META_APP_ID")
APP_SECRET = os.getenv("META_APP_SECRET")
REDIRECT_URI = os.getenv("META_REDIRECT_URI", "http://localhost:5173/auth/meta/callback")

@router.get("/url")
async def get_auth_url():
    """Retorna a URL para o usuário iniciar o login do Facebook."""
    if not APP_ID:
        raise HTTPException(status_code=500, detail="META_APP_ID no configurado no .env")
    
    # Escopos necessários para Marketing API
    scopes = ["ads_read", "ads_management", "business_management", "public_profile"]
    scope_str = ",".join(scopes)
    
    auth_url = (
        f"https://www.facebook.com/v18.0/dialog/oauth?"
        f"client_id={APP_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope={scope_str}"
        f"&response_type=code"
    )
    return {"url": auth_url}

@router.get("/callback")
async def meta_callback(code: str = Query(...)):
    """Recebe o code do Meta e troca por um token de acesso de longa durao."""
    if not APP_ID or not APP_SECRET:
        raise HTTPException(status_code=500, detail="Credenciais Meta incompleta no .env")

    # 1. Trocar code por Short-Lived Token
    token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
    params = {
        "client_id": APP_ID,
        "redirect_uri": REDIRECT_URI,
        "client_secret": APP_SECRET,
        "code": code,
    }
    
    response = requests.get(token_url, params=params)
    data = response.json()
    
    if "error" in data:
        raise HTTPException(status_code=400, detail=data["error"].get("message", "Erro na troca de token"))
    
    short_lived_token = data.get("access_token")
    
    # 2. Trocar por Long-Lived Token (60 dias)
    long_lived_url = "https://graph.facebook.com/v18.0/oauth/access_token"
    params = {
        "grant_type": "fb_exchange_token",
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "fb_exchange_token": short_lived_token,
    }
    
    response = requests.get(long_lived_url, params=params)
    data = response.json()
    
    if "error" in data:
         raise HTTPException(status_code=400, detail="Erro ao gerar long-lived token")

    # NOTA: Em um sistema real, salvaríamos isso em um DB vinculado ao user/project.
    # Por ora, devolveremos ao frontend para ser salvo no localStorage (conforme plano).
    return {
        "success": True,
        "access_token": data.get("access_token"),
        "expires_in": data.get("expires_in"),
        "token_type": data.get("token_type")
    }

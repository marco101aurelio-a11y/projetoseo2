import os
from dotenv import load_dotenv
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
import json

load_dotenv()

token = os.getenv("META_ACCESS_TOKEN")
account_id = os.getenv("META_AD_ACCOUNT_ID")

if not token or not account_id:
    print("ERRO: Credenciais ausentes no .env")
else:
    FacebookAdsApi.init(access_token=token)
    account = AdAccount(f"act_{account_id}")
    
    fields = [
        "campaign_name",
        "campaign_id",
        "objective",
        "spend"
    ]
    
    params = {
        "date_preset": "maximum",
        "level": "campaign",
    }
    
    try:
        print(f"Buscando campos {fields} para conta {account_id}...")
        insights = account.get_insights(fields=fields, params=params)
        
        sample = []
        for i, val in enumerate(insights):
            sample.append(dict(val))
            if i >= 2: break
            
        print("Amostra de dados recebidos:")
        print(json.dumps(sample, indent=2))
    except Exception as e:
        print(f"FALHA: {e}")

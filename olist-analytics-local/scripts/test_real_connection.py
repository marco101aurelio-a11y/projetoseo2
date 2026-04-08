import os
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.exceptions import FacebookRequestError

def test_meta_connection():
    print("--- Teste de Conexão Meta Ads ---")
    
    # Busca credenciais do .env (simulando o carregamento do sistema)
    # Nota: Em ambiente real usamos dotenv, aqui pegamos direto do os.environ se já estiver lá
    # ou podemos ler o arquivo .env manualmente para o teste.
    
    token = "EAAYoD52fdE8BRA15O888I8CX5iMnJv4WuUXEkBtEbGM7S2hDlCnLY2tbjnKs2kOBFpAVKAJRvqwAWnkgxvUao6oHSxnEfARQc8lpuIayGIfPozrXwUDZBG9XdpLdPIsAeJKsmEzKw0USfB1ndJSO67qgZCaDomOtyF23nnouZCAw7gX3aPJhZC934Nqs3xeY9zBs"
    account_id = "317590331118373"
    
    print(f"Token (truncado): {token[:10]}...")
    print(f"ID da Conta: {account_id}")

    try:
        FacebookAdsApi.init(access_token=token)
        account = AdAccount(f"act_{account_id}")
        
        # Tenta buscar o nome da conta
        print("Boscando informações da conta...")
        me = account.api_get(fields=['name', 'currency'])
        print(f"SUCESSO! Conectado à conta: {me['name']} ({me['currency']})")
        
        # Tenta buscar insights básicos
        print("Boscando insights (últimos 7 dias)...")
        insights = account.get_insights(fields=['spend', 'impressions'], params={'date_preset': 'last_7d'})
        
        total_spend = sum(float(i['spend']) for i in insights)
        print(f"Insights recuperados: Gasto total de R$ {total_spend:.2f} nos últimos 7 dias.")
        
        return True
    except FacebookRequestError as e:
        print(f"ERRO DE API: {e.api_error_message()}")
        return False
    except Exception as e:
        print(f"ERROINESPERADO: {str(e)}")
        return False

if __name__ == "__main__":
    test_meta_connection()

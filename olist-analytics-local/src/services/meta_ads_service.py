"""
meta_ads_service.py — Serviço de integração com Meta Marketing API
Responsabilidade: buscar dados brutos da API e devolvê-los normalizados.
NÃO calcula métricas de negócio — isso é responsabilidade do FinanceEngine.

ENTRADA: ad_account_id + date_preset + access_token (env)
SAÍDA: dict padronizado { success, data, error, meta }

Setup:
  pip install facebook-business
  .env: META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN
"""

import os
from typing import Optional

# Importação condicional — evita crash se biblioteca não estiver instalada
try:
    from facebook_business.api import FacebookAdsApi
    from facebook_business.adobjects.adaccount import AdAccount
    from facebook_business.adobjects.campaign import Campaign
    from facebook_business.exceptions import FacebookRequestError
    META_SDK_AVAILABLE = True
except ImportError:
    META_SDK_AVAILABLE = False


class MetaAdsService:
    """
    Serviço de acesso à Meta Marketing API.
    Inicializa com credenciais do .env — nunca hardcoded.
    """

    # Campos de insights que sempre buscamos
    INSIGHT_FIELDS = [
        "campaign_name",
        "campaign_id",
        "impressions",
        "reach",
        "clicks",
        "spend",
        "cpm",
        "cpc",
        "ctr",
        "actions",        # conversões (purchase, lead, add_to_cart...)
        "action_values",  # valores monetários das conversões
        "frequency",
    ]

    def __init__(self, access_token: Optional[str] = None):
        """
        Inicializa a conexão com a Meta API.
        Pode usar o token do .env ou um token passado dinamicamente (OAuth).
        """
        self._initialized = False
        if not META_SDK_AVAILABLE:
            return

        if access_token == "env_master_token":
            access_token = None

        app_id       = os.getenv("META_APP_ID")
        app_secret   = os.getenv("META_APP_SECRET")
        token        = access_token or os.getenv("META_ACCESS_TOKEN")

        # Limpeza de placeholders
        if app_id and app_id.startswith("INSERT_"): app_id = None
        if app_secret and app_secret.startswith("INSERT_"): app_secret = None
        if token and token.startswith("INSERT_"): token = None

        if token:
            try:
                # Se não temos app_secret real, passamos apenas o token
                # Evita enviar appsecret_proof falso (dummy_secret) que o Facebook rejeita.
                if app_id and app_secret:
                    FacebookAdsApi.init(
                        app_id=app_id,
                        app_secret=app_secret,
                        access_token=token
                    )
                else:
                    FacebookAdsApi.init(access_token=token)
                self._initialized = True
            except Exception:
                self._initialized = False

    def get_my_ad_accounts(self, access_token: str) -> dict:
        """
        Lista todas as contas de anúncios vinculadas ao token do usuário.
        """
        if not META_SDK_AVAILABLE:
            return self._error("SDK Meta não instalado.")
        
        try:
            # Re-inicializa com o token do usuário se necessário
            self.__init__(access_token=access_token)
            
            # 'me' refere-se ao usuário dono do token
            from facebook_business.adobjects.user import User
            me = User(fbid='me')
            accounts = me.get_ad_accounts(fields=['name', 'account_id', 'currency', 'account_status'])
            
            account_list = []
            for acc in accounts:
                account_list.append({
                    "id": acc.get('account_id'),
                    "name": acc.get('name'),
                    "status": acc.get('account_status'),
                    "currency": acc.get('currency')
                })
            
            return {"success": True, "data": account_list}
        except Exception as e:
            return self._error(f"Erro ao listar contas: {str(e)}")

    def get_account_info(self, ad_account_id: str, access_token: Optional[str] = None) -> dict:
        """
        Busca informações básicas da conta de anúncios.
        """
        if access_token:
            self.__init__(access_token=access_token)

        if not self._initialized:
            return self._error("Meta SDK não inicializado.")

        try:
            account = AdAccount(f"act_{ad_account_id}")
            info = account.api_get(fields=["name", "currency", "account_status", "amount_spent"])
            return {
                "success": True,
                "data": {
                    "nome":         info.get("name"),
                    "moeda":        info.get("currency"),
                    "status":       info.get("account_status"),
                    "gasto_total":  float(info.get("amount_spent", 0)) / 100,
                },
                "error": None,
                "meta": {"ad_account_id": ad_account_id}
            }
        except Exception as e:
            return self._error(f"Erro ao buscar conta: {str(e)}")

    def get_campaign_metrics(
        self,
        ad_account_id: str,
        date_preset: str = "last_30d",
        include_inactive: bool = False,
        access_token: Optional[str] = None
    ) -> dict:
        """
        Busca métricas agregadas de todas as campanhas da conta.
        """
        if access_token:
            self.__init__(access_token=access_token)

        if not self._initialized:
            return self._error("Meta SDK não inicializado.")

        try:
            account = AdAccount(f"act_{ad_account_id}")

            params = {
                "date_preset": date_preset,
                "level":       "campaign",
                "time_increment": 1,  # breakdown diário
            }

            # Busca insights
            insights = account.get_insights(
                fields=self.INSIGHT_FIELDS,
                params=params
            )

            campanhas_raw    = []
            campanhas_parsed = []
            total_spend      = 0.0
            total_impressions = 0
            total_clicks     = 0
            total_orders     = 0
            total_revenue    = 0.0
            total_leads      = 0

            for insight in insights:
                # Agrega por data — coleta o dict completo para o conector
                insight_dict = dict(insight)
                campanhas_raw.append(insight_dict)

                spend      = self._to_float(insight.get("spend", 0))
                impressions= self._to_int(insight.get("impressions", 0))
                clicks     = self._to_int(insight.get("clicks", 0))
                orders     = self._extract_action_count(insight_dict, "purchase")
                revenue    = self._extract_action_value(insight_dict, "purchase")
                leads      = self._extract_action_count(insight_dict, "lead")
                add_to_cart= self._extract_action_count(insight_dict, "add_to_cart")

                total_spend       += spend
                total_impressions += impressions
                total_clicks      += clicks
                total_orders      += orders
                total_revenue     += revenue
                total_leads       += leads

                # ROAS por campanha
                roas = revenue / (spend + 1e-9)
                ctr  = self._to_float(insight.get("ctr", 0)) / 100
                cpc  = self._to_float(insight.get("cpc", 0))
                cpm  = self._to_float(insight.get("cpm", 0))

                campanhas_parsed.append({
                    "campaign_id":   insight.get("campaign_id"),
                    "nome":          insight.get("campaign_name"),
                    "investimento":  round(spend, 2),
                    "impressoes":    impressions,
                    "alcance":       self._to_int(insight.get("reach", 0)),
                    "cliques":       clicks,
                    "pedidos":       orders,
                    "receita":       round(revenue, 2),
                    "leads":         leads,
                    "add_to_cart":   add_to_cart,
                    "roas":          round(roas, 2),
                    "ctr":           round(ctr * 100, 2),
                    "cpc":           round(cpc, 2),
                    "cpm":           round(cpm, 2),
                    "frequencia":    self._to_float(insight.get("frequency", 0)),
                })

            # Resumo agregado da conta
            cac_geral  = total_spend / (total_orders + 1e-9)
            roas_geral = total_revenue / (total_spend + 1e-9)
            ctr_geral  = total_clicks / (total_impressions + 1e-9)

            return {
                "success": True,
                "data": {
                    "campanhas":     campanhas_parsed,
                    "campanhas_raw": campanhas_raw,   # para o MetaToFinanceConnector
                    "resumo": {
                        "investimento_total": round(total_spend, 2),
                        "impressoes_total":   total_impressions,
                        "cliques_total":      total_clicks,
                        "pedidos_total":      total_orders,
                        "leads_total":        total_leads,
                        "receita_total":      round(total_revenue, 2),
                        "roas_geral":         round(roas_geral, 2),
                        "cac_geral":          round(cac_geral, 2),
                        "ctr_geral":          round(ctr_geral * 100, 2),
                        "num_campanhas":      len(campanhas_parsed),
                    }
                },
                "error": None,
                "meta": {
                    "ad_account_id": ad_account_id,
                    "date_preset":   date_preset,
                    "fonte":         "meta_ads"
                }
            }

        except Exception as e:
            return self._error(f"Erro ao buscar métricas: {str(e)}")

    def get_mock_data(self, ad_account_id: str = "demo") -> dict:
        """
        Retorna dados mockados para desenvolvimento/demonstração.
        Usado quando META_ACCESS_TOKEN não está configurado.
        Recebe: ad_account_id (ignorado no mock)
        Retorna: estrutura idêntica ao get_campaign_metrics()
        """
        campanhas_raw = [
            {
                "campaign_name": "Vendas | Coleção Verão 2025",
                "campaign_id": "mock_001",
                "spend": "1850.00",
                "impressions": "125000",
                "reach": "89000",
                "clicks": "3200",
                "cpm": "14.80",
                "cpc": "0.58",
                "ctr": "2.56",
                "frequency": "1.40",
                "actions": [
                    {"action_type": "purchase",    "value": "68"},
                    {"action_type": "add_to_cart", "value": "310"},
                    {"action_type": "lead",        "value": "0"},
                ],
                "action_values": [
                    {"action_type": "purchase", "value": "9520.00"}
                ]
            },
            {
                "campaign_name": "Remarketing | Carrinho Abandonado",
                "campaign_id": "mock_002",
                "spend": "420.00",
                "impressions": "35000",
                "reach": "12000",
                "clicks": "980",
                "cpm": "12.00",
                "cpc": "0.43",
                "ctr": "2.80",
                "frequency": "2.92",
                "actions": [
                    {"action_type": "purchase",    "value": "31"},
                    {"action_type": "add_to_cart", "value": "45"},
                ],
                "action_values": [
                    {"action_type": "purchase", "value": "4340.00"}
                ]
            },
        ]

        parsed = []
        total_spend = total_clicks = total_impressions = total_orders = total_revenue = 0.0

        for c in campanhas_raw:
            spend      = self._to_float(c["spend"])
            clicks     = self._to_int(c["clicks"])
            impressions= self._to_int(c["impressions"])
            orders     = self._extract_action_count(c, "purchase")
            revenue    = self._extract_action_value(c, "purchase")
            total_spend       += spend
            total_clicks      += clicks
            total_impressions += impressions
            total_orders      += orders
            total_revenue     += revenue
            parsed.append({
                "campaign_id": c["campaign_id"],
                "nome":        c["campaign_name"],
                "investimento":round(spend, 2),
                "impressoes":  impressions,
                "cliques":     clicks,
                "pedidos":     orders,
                "receita":     round(revenue, 2),
                "roas":        round(revenue / (spend + 1e-9), 2),
                "ctr":         round(self._to_float(c["ctr"]), 2),
                "cpc":         round(self._to_float(c["cpc"]), 2),
                "frequencia":  round(self._to_float(c["frequency"]), 2),
            })

        return {
            "success": True,
            "data": {
                "campanhas":     parsed,
                "campanhas_raw": campanhas_raw,
                "resumo": {
                    "investimento_total": round(total_spend, 2),
                    "cliques_total":      int(total_clicks),
                    "impressoes_total":   int(total_impressions),
                    "pedidos_total":      int(total_orders),
                    "receita_total":      round(total_revenue, 2),
                    "roas_geral":         round(total_revenue / (total_spend + 1e-9), 2),
                    "cac_geral":          round(total_spend / (total_orders + 1e-9), 2),
                    "ctr_geral":          round(total_clicks / (total_impressions + 1e-9) * 100, 2),
                    "num_campanhas":      len(parsed),
                }
            },
            "error": None,
            "meta": {"ad_account_id": ad_account_id, "date_preset": "mock", "fonte": "meta_ads_mock"}
        }

    # ── Helpers de normalização
    @staticmethod
    def _to_float(value) -> float:
        try:   return float(value)
        except: return 0.0

    @staticmethod
    def _to_int(value) -> int:
        try:   return int(float(value))
        except: return 0

    @staticmethod
    def _extract_action_count(campaign: dict, action_type: str) -> int:
        for action in campaign.get("actions", []):
            if action.get("action_type") == action_type:
                try:   return int(float(action.get("value", 0)))
                except: return 0
        return 0

    @staticmethod
    def _extract_action_value(campaign: dict, action_type: str) -> float:
        for action in campaign.get("action_values", []):
            if action.get("action_type") == action_type:
                try:   return float(action.get("value", 0))
                except: return 0.0
        return 0.0

    @staticmethod
    def _error(message: str) -> dict:
        return {"success": False, "data": None, "error": message, "meta": {}}

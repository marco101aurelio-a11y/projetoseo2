"""
meta_to_finance_connector.py — Conector Meta Ads → FinanceEngine
Responsabilidade única: traduzir dados brutos da Meta API para TrafficRawData.
NÃO calcula métricas de negócio — apenas normaliza e agrega.

ENTRADA: lista de insights da Meta API + dados do negócio do usuário
SAÍDA: TrafficRawData pronto para o FinanceEngine consumir
"""

import sys
import os

# Adiciona o path para importar engines
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Optional
from engines.finance_engine import TrafficRawData


class MetaToFinanceConnector:
    """
    Traduz resposta da Meta Marketing API para TrafficRawData.
    Suporta agregação de múltiplas campanhas e detecção de tipo de funil.
    """

    def build_traffic_data(
        self,
        meta_insights: list,              # campanhas_raw da MetaAdsService
        cogs_pct: float,                  # % custo produto — do onboarding do usuário
        fixed_costs: float,               # R$ custos fixos — do onboarding do usuário
        funnel_type: str = "b2c_ecommerce",
        sessions: Optional[int] = None,   # sessões GA4 (se disponível)
        tax_rate: Optional[float] = None,
        shipping_rate: Optional[float] = None,
        marketplace_fee: Optional[float] = None,
    ) -> TrafficRawData:
        """
        Ponto de entrada principal: constrói TrafficRawData a partir dos insights da Meta.

        Recebe:
          - meta_insights: lista de dicts da Meta API (campo campanhas_raw)
          - cogs_pct: % custo do produto (ex: 0.35)
          - fixed_costs: custos fixos mensais em R$
          - funnel_type: tipo de funil que define benchmarks
          - sessions: sessões do GA4 (opcional — estima se não informado)
        Retorna: TrafficRawData
        """
        agg = self._aggregate(meta_insights)

        # Sessões: idealmente GA4. Enquanto não temos, estimamos com bounce rate típico (15%)
        estimated_sessions = sessions or max(1, int(agg["clicks"] * 0.85))

        # Detecta automaticamente se é funil de leads (B2B/Serviço)
        detected_funnel = self._detect_funnel_type(agg, funnel_type)

        return TrafficRawData(
            investment=agg["investment"],
            clicks=agg["clicks"],
            impressions=agg["impressions"],
            sessions=estimated_sessions,
            orders=agg["orders"],
            revenue=agg["revenue"],
            cogs_pct=cogs_pct,
            fixed_costs=fixed_costs,
            funnel_type=detected_funnel,
            leads=agg["leads"],
            tax_rate=tax_rate,
            shipping_rate=shipping_rate,
            marketplace_fee=marketplace_fee,
        )

    def _aggregate(self, insights: list) -> dict:
        """
        Soma todas as campanhas em um único bloco de métricas.
        Recebe: lista de dicts da Meta API
        Retorna: dict com totais agregados
        """
        totals = {
            "investment":  0.0,
            "impressions": 0,
            "clicks":      0,
            "orders":      0,
            "revenue":     0.0,
            "leads":       0,
            "add_to_cart": 0,
        }

        for campaign in insights:
            totals["investment"]  += self._to_float(campaign.get("spend", 0))
            totals["impressions"] += self._to_int(campaign.get("impressions", 0))
            totals["clicks"]      += self._to_int(campaign.get("clicks", 0))
            totals["orders"]      += self._extract_action_count(campaign, "purchase")
            totals["revenue"]     += self._extract_action_value(campaign, "purchase")
            totals["leads"]       += self._extract_action_count(campaign, "lead")
            totals["add_to_cart"] += self._extract_action_count(campaign, "add_to_cart")

        return totals

    def _detect_funnel_type(self, agg: dict, funnel_type_hint: str) -> str:
        """
        Detecta automaticamente se o negócio usa funil de leads.
        Se a conta tem mais leads do que pedidos, sugere funil de serviço.
        O hint do usuário sempre tem prioridade se explicitamente diferente de 'b2c_ecommerce'.
        """
        if funnel_type_hint != "b2c_ecommerce":
            return funnel_type_hint  # usuário escolheu explicitamente

        leads  = agg.get("leads", 0)
        orders = agg.get("orders", 0)

        if leads > orders * 2:
            # Muito mais leads do que pedidos → provável serviço B2C
            return "b2c_servico_agendamento"

        return funnel_type_hint  # e-commerce direto

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
    def _to_float(value) -> float:
        try:   return float(value)
        except: return 0.0

    @staticmethod
    def _to_int(value) -> int:
        try:   return int(float(value))
        except: return 0

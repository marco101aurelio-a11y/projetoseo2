"""
finance_engine.py — Motor Financeiro Capvi v2.0
Fluxo: Métricas Brutas → Primárias → Secundárias → DRE → Diagnóstico por Funil

ENTRADA: TrafficRawData (dados brutos de tráfego + dados do negócio)
SAÍDA: DRE + diagnóstico por etapa + engenharia reversa (para Gemini + Dashboard)

Compatibilidade retroativa mantida via método analyze_finance() e simulate_dre_pro()
"""

import jax.numpy as jnp
from jax import jit
from dataclasses import dataclass, field
from typing import Optional
from engines.funnel_models import get_funnel_model, list_funnel_types


# ─────────────────────────────────────────────────────────
# NÍVEL 1: Estrutura de entrada — o que o engine aceita
# ─────────────────────────────────────────────────────────

@dataclass
class TrafficRawData:
    """
    Dados brutos que vêm das APIs (Meta Ads, Google Ads)
    ou que o usuário informa manualmente no Estúdio.
    Nada aqui é calculado — são coletas puras.
    """
    # ── Obrigatórios — sem estes o DRE não roda
    investment: float          # R$ total investido em ads
    clicks: int                # total de cliques
    impressions: int           # total de impressões
    sessions: int              # sessões no site (GA4 ou estimado)
    orders: int                # pedidos/vendas realizados
    revenue: float             # receita bruta gerada

    # ── Estrutural do negócio — usuário informa no onboarding
    cogs_pct: float            # % custo do produto (ex: 0.35)
    fixed_costs: float         # custos fixos mensais (R$)

    # ── Tipo de funil — define benchmarks e lógica de diagnóstico
    funnel_type: str = "b2c_ecommerce"

    # ── Funil por etapas — opcionais para B2B e serviços
    leads: int = 0             # leads gerados (B2B/Serviço)
    mqls: int = 0              # Marketing Qualified Leads
    sqls: int = 0              # Sales Qualified Leads
    oportunidades: int = 0     # Oportunidades (B2B)

    # ── Taxas opcionais — se não informados, usa benchmark do funnel_type
    tax_rate: Optional[float] = None
    shipping_rate: Optional[float] = None
    marketplace_fee: Optional[float] = None
    avg_frequency: Optional[float] = None
    avg_customer_life: Optional[float] = None


# ─────────────────────────────────────────────────────────
# NÍVEL 2: Cálculos JAX puros (sem efeitos colaterais)
# ─────────────────────────────────────────────────────────

@jit
def _calc_primary_metrics(investment, clicks, impressions, sessions, orders, revenue):
    """
    Deriva métricas primárias das métricas brutas.
    Recebe: dados brutos de tráfego (todos numéricos)
    Retorna: (ctr, cpc, conv_rate, cac, ticket_medio, roas)
    """
    eps = 1e-9
    ctr          = clicks / (impressions + eps)
    cpc          = investment / (clicks + eps)
    conv_rate    = orders / (sessions + eps)
    cac          = investment / (orders + eps)
    ticket_medio = revenue / (orders + eps)
    roas         = revenue / (investment + eps)
    return ctr, cpc, conv_rate, cac, ticket_medio, roas


@jit
def _calc_secondary_metrics(
    revenue, investment, v_costs_total, fixed_costs,
    cac, ticket_medio, avg_frequency, avg_customer_life
):
    """
    Deriva métricas secundárias a partir das primárias + estrutura de custos.
    Recebe: métricas primárias + taxas financeiras
    Retorna: (roi, margem_contrib, margem_contrib_pct, ltv, ltv_cac,
              breakeven_revenue, breakeven_investment, ebitda, ebitda_pct)
    """
    eps = 1e-9
    margem_contrib     = revenue - v_costs_total - investment
    margem_contrib_pct = margem_contrib / (revenue + eps)
    roi                = (revenue - v_costs_total - investment - fixed_costs) / (investment + eps)
    ebitda             = margem_contrib - fixed_costs
    ebitda_pct         = ebitda / (revenue + eps)
    ltv                = ticket_medio * avg_frequency * avg_customer_life
    ltv_cac            = ltv / (cac + eps)
    breakeven_revenue  = fixed_costs / (margem_contrib_pct + eps)
    breakeven_inv      = breakeven_revenue / (revenue / (investment + eps) + eps)
    return (roi, margem_contrib, margem_contrib_pct, ltv, ltv_cac,
            breakeven_revenue, breakeven_inv, ebitda, ebitda_pct)


@jit
def _reverse_engineer_targets(target_ebitda_pct, fixed_costs, total_v_pct, roas):
    """
    Engenharia reversa: dado o EBITDA alvo, qual investimento mínimo necessário?
    Resolve: Investment × [ROAS × (1 - v_pct - target_ebitda_pct) - 1] = Fixed

    Recebe: meta de EBITDA%, custos fixos, % de custos variáveis, ROAS esperado
    Retorna: (investment_needed, revenue_needed, breakeven_investment)
    """
    eps = 1e-9
    denominator          = roas * (1 - total_v_pct - target_ebitda_pct) - 1
    investment_needed    = fixed_costs / (denominator + eps)
    revenue_needed       = investment_needed * roas
    breakeven_denom      = roas * (1 - total_v_pct) - 1
    breakeven_investment = fixed_costs / (breakeven_denom + eps)
    return investment_needed, revenue_needed, breakeven_investment


# ─────────────────────────────────────────────────────────
# NÍVEL 3: Engine principal com fluxo completo
# ─────────────────────────────────────────────────────────

class FinanceEngine:
    """
    Motor financeiro do Capvi v2.0.
    Transforma dados brutos de tráfego em DRE + diagnóstico por funil.
    O Gemini recebe apenas o output estruturado — nunca dados brutos.
    """

    def __init__(self, funnel_type: str = "b2c_ecommerce"):
        """
        Inicializa o engine com o modelo de funil do negócio.
        Recebe: funnel_type (str) — chave do FUNNEL_BENCHMARKS
        """
        self.funnel_type = funnel_type
        self.model       = get_funnel_model(funnel_type)
        self.benchmarks  = self.model["cost_structure"]
        self.etapas      = self.model.get("etapas", {})
        self.conversao_direta = self.model.get("conversao_direta", True)

    def _resolve_rates(self, data: TrafficRawData) -> dict:
        """
        Resolve taxas financeiras.
        Usa valor informado pelo usuário se disponível; caso contrário, benchmark do funil.
        """
        return {
            "tax_rate":       data.tax_rate       or self.benchmarks["tax_rate"],
            "shipping_rate":  data.shipping_rate  or self.benchmarks["shipping_rate"],
            "marketplace_fee":data.marketplace_fee or self.benchmarks["marketplace_fee"],
            "avg_frequency":  data.avg_frequency  or self.benchmarks["avg_frequency_year"],
            "avg_customer_life": data.avg_customer_life or self.benchmarks["avg_customer_life_months"],
        }

    def analyze_from_raw(self, data: TrafficRawData) -> dict:
        """
        ENTRADA PRINCIPAL: dados brutos de tráfego → DRE completo + diagnóstico.

        Fluxo:
        1. Resolve taxas (usuário ou benchmark do funil)
        2. Calcula métricas primárias (das brutas)
        3. Calcula métricas secundárias (das primárias)
        4. Monta DRE linha a linha
        5. Diagnóstico por camada/etapa do funil
        6. Engenharia reversa: quanto precisa para atingir a meta

        Recebe: TrafficRawData
        Retorna: dict padronizado { success, data, error, meta }
        """
        rates       = self._resolve_rates(data)
        total_v_pct = (
            rates["tax_rate"] + rates["shipping_rate"] +
            rates["marketplace_fee"] + data.cogs_pct
        )
        v_costs_total = data.revenue * total_v_pct

        # ── Primárias
        ctr, cpc, conv_rate, cac, ticket_medio, roas = _calc_primary_metrics(
            float(data.investment), float(data.clicks), float(data.impressions),
            float(data.sessions), float(data.orders), float(data.revenue)
        )

        # ── Secundárias
        (roi, margem_contrib, margem_contrib_pct, ltv, ltv_cac,
         breakeven_revenue, breakeven_inv, ebitda, ebitda_pct) = _calc_secondary_metrics(
            float(data.revenue), float(data.investment), float(v_costs_total),
            float(data.fixed_costs), float(cac), float(ticket_medio),
            float(rates["avg_frequency"]), float(rates["avg_customer_life"])
        )

        # ── Engenharia reversa
        target_ebitda = self.benchmarks["target_ebitda_pct"]
        inv_needed, rev_needed, breakeven_investment = _reverse_engineer_targets(
            float(target_ebitda), float(data.fixed_costs),
            float(total_v_pct), float(roas)
        )

        # ── Diagnóstico (canal + funil + financeiro)
        diagnostico = self._diagnose(
            ctr=float(ctr), cpc=float(cpc), conv_rate=float(conv_rate),
            cac=float(cac), roas=float(roas), ltv_cac=float(ltv_cac),
            ebitda_pct=float(ebitda_pct), data=data
        )

        return {
            "success": True,
            "data": {
                "summary": {
                    "revenue":      float(data.revenue),
                    "ebitda":       round(float(ebitda), 2),
                    "ebitda_pct":   round(float(ebitda_pct) * 100, 2),
                    "net_margin":   round(float(ebitda_pct), 4),  # retrocompat
                    "roas":         round(float(roas), 2),
                    "ltv_cac_ratio":round(float(ltv_cac), 2),
                    "breakeven":    round(float(breakeven_revenue), 2),  # retrocompat
                    "status":       diagnostico["status_geral"],
                },
                "metricas_primarias": {
                    "ctr":            round(float(ctr) * 100, 2),
                    "cpc":            round(float(cpc), 2),
                    "taxa_conversao": round(float(conv_rate) * 100, 2),
                    "cac":            round(float(cac), 2),
                    "ticket_medio":   round(float(ticket_medio), 2),
                    "roas":           round(float(roas), 2),
                },
                "metricas_secundarias": {
                    "roi_pct":               round(float(roi) * 100, 2),
                    "margem_contribuicao":   round(float(margem_contrib), 2),
                    "margem_contribuicao_pct": round(float(margem_contrib_pct) * 100, 2),
                    "ltv":                   round(float(ltv), 2),
                    "ltv_cac_ratio":         round(float(ltv_cac), 2),
                },
                "dre": {
                    "receita_bruta":    float(data.revenue),
                    "investimento_ads": float(data.investment),
                    "custos_variaveis": {
                        "total":               round(float(v_costs_total), 2),
                        "impostos":            round(float(data.revenue * rates["tax_rate"]), 2),
                        "frete":               round(float(data.revenue * rates["shipping_rate"]), 2),
                        "comissao_marketplace":round(float(data.revenue * rates["marketplace_fee"]), 2),
                        "cogs_produto":        round(float(data.revenue * data.cogs_pct), 2),
                    },
                    "margem_contribuicao": round(float(margem_contrib), 2),
                    "custos_fixos":        float(data.fixed_costs),
                    "ebitda":              round(float(ebitda), 2),
                    "ebitda_pct":          round(float(ebitda_pct) * 100, 2),
                    # retrocompat com DRETable.tsx
                    "ebitda_final":        round(float(ebitda), 2),
                    "receita_bruta_alias": float(data.revenue),
                },
                "engenharia_reversa": {
                    "para_meta_ebitda_pct":    round(target_ebitda * 100, 1),
                    "investimento_necessario": round(float(inv_needed), 2),
                    "receita_necessaria":      round(float(rev_needed), 2),
                    "breakeven_investment":    round(float(breakeven_investment), 2),
                    "breakeven_revenue":       round(float(breakeven_revenue), 2),
                    "gap_atual":               round(float(inv_needed - data.investment), 2),
                },
                "diagnostico": diagnostico,
            },
            "error": None,
            "meta": {
                "funnel_type": self.funnel_type,
                "funnel_label": self.model["label"],
                "calculado_em": None,  # timestamp injetado pelo router
                "versao": "2.0"
            }
        }

    def _diagnose(self, ctr, cpc, conv_rate, cac, roas,
                  ltv_cac, ebitda_pct, data: TrafficRawData) -> dict:
        """
        Diagnóstico em 3 camadas:
        1. Canal (CTR do anúncio)
        2. Funil (taxas de conversão por etapa)
        3. Financeiro (ROAS, LTV/CAC, EBITDA)

        Recebe: métricas calculadas + dados brutos
        Retorna: { status_geral, health_score, alertas, prioridade_acao }
        """
        alertas = []
        scores  = []
        bench_canal = self.model.get("canal_benchmarks", {}).get("meta_ads", {})

        # ── Camada 1: Canal — CTR do criativo
        if "ctr_estatico" in bench_canal:
            b = bench_canal["ctr_estatico"]
            if ctr < b["ruim"]:
                alertas.append({
                    "nivel": "CRITICO", "camada": "criativo_anuncio", "metrica": "CTR",
                    "valor": f"{ctr*100:.2f}%", "benchmark": f"{b['aceitavel']*100:.1f}%",
                    "mensagem": "CTR crítico. Criativos não geram atenção — revise copy e imagem."
                })
                scores.append(0.2)
            elif ctr < b["aceitavel"]:
                alertas.append({
                    "nivel": "ATENCAO", "camada": "criativo_anuncio", "metrica": "CTR",
                    "valor": f"{ctr*100:.2f}%", "benchmark": f"{b['otimo']*100:.1f}%",
                    "mensagem": "CTR abaixo do ótimo. Teste novos ângulos de copy."
                })
                scores.append(0.6)
            else:
                scores.append(1.0)

        # ── Camada 2: Funil — etapas de conversão
        if not self.conversao_direta and data.leads > 0:
            # Funis B2B/Serviço — diagnóstica por etapa
            etapa_map = {
                "lead_para_mql":           (data.mqls, data.leads),
                "mql_para_sql":            (data.sqls, data.mqls),
                "sql_para_oportunidade":   (data.oportunidades, data.sqls),
                "oportunidade_para_venda": (data.orders, data.oportunidades),
                "lead_para_venda":         (data.orders, data.leads),
            }
            for etapa_key, bench in self.etapas.items():
                if etapa_key not in etapa_map:
                    continue
                numerador, denominador = etapa_map[etapa_key]
                if denominador == 0:
                    continue
                taxa = numerador / denominador
                if taxa < bench["ruim"]:
                    alertas.append({
                        "nivel": "CRITICO", "camada": "funil_vendas",
                        "metrica": bench["label"], "valor": f"{taxa*100:.1f}%",
                        "benchmark": f"{bench['aceitavel']*100:.0f}%",
                        "mensagem": f"Gargalo identificado em: {bench['label']}. Taxa muito abaixo do esperado."
                    })
                    scores.append(0.2)
                elif taxa < bench["aceitavel"]:
                    scores.append(0.6)
                else:
                    scores.append(1.0)
        else:
            # Funil direto — taxa de conversão sessão → pedido
            etapa_direta = self.etapas.get("sessao_para_pedido", {})
            if etapa_direta and data.sessions > 0:
                if conv_rate < etapa_direta.get("ruim", 0.005):
                    alertas.append({
                        "nivel": "CRITICO", "camada": "pagina_produto",
                        "metrica": "Taxa de Conversão",
                        "valor": f"{conv_rate*100:.2f}%",
                        "benchmark": f"{etapa_direta['aceitavel']*100:.1f}%",
                        "mensagem": "Tráfego chegando mas não convertendo. Revisar LP, oferta e checkout."
                    })
                    scores.append(0.2)
                elif conv_rate < etapa_direta.get("aceitavel", 0.015):
                    scores.append(0.6)
                else:
                    scores.append(1.0)

        # ── Camada 3: Financeiro
        healthy_roas = self.benchmarks["healthy_roas"]
        if roas < healthy_roas * 0.6:
            alertas.append({
                "nivel": "CRITICO", "camada": "eficiencia_ads", "metrica": "ROAS",
                "valor": f"{roas:.2f}x", "benchmark": f"{healthy_roas:.1f}x",
                "mensagem": f"ROAS insuficiente para cobrir custos variáveis. Campanha no prejuízo."
            })
            scores.append(0.1)
        elif roas < healthy_roas:
            alertas.append({
                "nivel": "ATENCAO", "camada": "eficiencia_ads", "metrica": "ROAS",
                "valor": f"{roas:.2f}x", "benchmark": f"{healthy_roas:.1f}x",
                "mensagem": "ROAS marginal. Otimize segmentação, lances e criativos."
            })
            scores.append(0.6)
        else:
            scores.append(1.0)

        healthy_ltv_cac = self.benchmarks["healthy_ltv_cac"]
        if ltv_cac < healthy_ltv_cac * 0.5:
            alertas.append({
                "nivel": "CRITICO", "camada": "retencao_cliente", "metrica": "LTV/CAC",
                "valor": f"{ltv_cac:.2f}x", "benchmark": f"{healthy_ltv_cac:.1f}x",
                "mensagem": "CAC maior que o valor gerado. Negócio insustentável no longo prazo."
            })
            scores.append(0.1)
        elif ltv_cac < healthy_ltv_cac:
            scores.append(0.6)
        else:
            scores.append(1.0)

        # ── Status geral
        avg_score = sum(scores) / len(scores) if scores else 0.5
        target_ebitda = self.benchmarks["target_ebitda_pct"]
        if ebitda_pct > target_ebitda and avg_score > 0.7:
            status = "SAUDAVEL"
        elif ebitda_pct > 0.03 or avg_score > 0.5:
            status = "ESTABILIZANDO"
        else:
            status = "CRITICO"

        return {
            "status_geral":    status,
            "health_score":    round(avg_score * 100),
            "alertas":         alertas,
            "prioridade_acao": alertas[0]["camada"] if alertas else None,
        }

    # ─────────────────────────────────────────────────────────
    # RETROCOMPATIBILIDADE — mantém endpoints existentes funcionando
    # ─────────────────────────────────────────────────────────

    def simulate_dre_pro(self, investment, roas, fixed_costs, cogs_pct):
        """
        Retrocompat: mantém o endpoint /analyze/dre funcionando.
        Constrói um TrafficRawData mínimo a partir dos parâmetros legados.
        """
        revenue = investment * roas
        orders  = max(1, int(revenue / 150))  # estimativa de ticket
        data = TrafficRawData(
            investment=investment, clicks=int(investment * 5),
            impressions=int(investment * 500), sessions=int(investment * 4),
            orders=orders, revenue=revenue,
            cogs_pct=cogs_pct, fixed_costs=fixed_costs,
            funnel_type=self.funnel_type
        )
        result = self.analyze_from_raw(data)
        # Mantém estrutura retrocompat do endpoint antigo
        dre = result["data"]["dre"]
        return {
            "summary":      result["data"]["summary"],
            "detailed_dre": {
                "receita_bruta":    dre["receita_bruta"],
                "investimento_ads": dre["investimento_ads"],
                "custos_variaveis": dre["custos_variaveis"],
                "margem_contribuicao": dre["margem_contribuicao"],
                "custos_fixos":     dre["custos_fixos"],
                "ebitda_final":     dre["ebitda"],
            }
        }

    def project_multi_month_dre(self, investment_start, growth_rate, roas_start,
                                 decay_rate, fixed_costs, cogs_pct, months=12):
        """
        Retrocompat: projeção multi-mês com crescimento de investimento e decaimento de ROAS.
        """
        projection = []
        for m in range(months):
            inv   = investment_start * (1 + growth_rate) ** m
            r_val = roas_start * (1 - decay_rate) ** m
            month_data = self.simulate_dre_pro(inv, r_val, fixed_costs, cogs_pct)
            month_data["month"] = m + 1
            projection.append(month_data)
        return projection

    def analyze_finance(self, revenue, costs, fixed_costs, cac, ltv):
        """Retrocompat: versão legada para o endpoint /analyze/finance."""
        eps        = 1e-9
        net_margin = (revenue - costs - fixed_costs) / (revenue + eps)
        ltv_cac    = ltv / (cac + eps)
        return {
            "net_margin":    round(float(net_margin), 4),
            "ltv_cac_ratio": round(float(ltv_cac), 2),
            "status":        "OK" if net_margin > 0.1 else "Refinar"
        }

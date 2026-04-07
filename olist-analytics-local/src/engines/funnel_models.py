"""
funnel_models.py — Modelos de Funil com benchmarks por etapa
Baseado no framework GT (Diagnóstico 26/04/2025) e hierarquia de métricas Capvi.

Cada modelo define:
  - label: nome legível
  - jornada: etapas da conversão em ordem
  - conversao_direta: True se venda ocorre sem funil de leads
  - etapas: benchmarks Ótimo/Aceitável/Ruim por transição
  - canal_benchmarks: CTR/CPC esperado por canal (Meta, Google)
  - cost_structure: taxas e benchmarks financeiros do setor
"""

FUNNEL_BENCHMARKS: dict = {

    # ─────────────────────────────────────────────────────────
    # B2C — E-commerce / Venda Direta (Marketplace, DTC, Loja)
    # Jornada: Ads → Criativo → LP → Compra
    # ─────────────────────────────────────────────────────────
    "b2c_ecommerce": {
        "label": "B2C — E-commerce / Venda Direta",
        "jornada": ["impressoes", "cliques", "sessoes", "pedidos"],
        "conversao_direta": True,
        "etapas": {
            "sessao_para_pedido": {
                "otimo": 0.03, "aceitavel": 0.015, "ruim": 0.005,
                "label": "Sessão → Pedido (Taxa de Conversão)"
            }
        },
        "canal_benchmarks": {
            "meta_ads": {
                "ctr_estatico": {"otimo": 0.015, "aceitavel": 0.008, "ruim": 0.003},
                "ctr_video":    {"otimo": 0.020, "aceitavel": 0.010, "ruim": 0.005},
                "frequencia_max": 4,
                "cpm_referencia": 18.0,
            },
            "google_ads": {
                "ctr_pesquisa": {"otimo": 0.10, "aceitavel": 0.07, "ruim": 0.03},
                "ctr_pmax":     {"otimo": 0.010, "aceitavel": 0.008, "ruim": 0.003},
            }
        },
        "cost_structure": {
            "tax_rate": 0.12,
            "shipping_rate": 0.07,
            "marketplace_fee": 0.15,
            "avg_frequency_year": 2.5,
            "avg_customer_life_months": 18,
            "target_ebitda_pct": 0.12,
            "healthy_roas": 3.0,
            "healthy_ltv_cac": 3.0,
        }
    },

    # ─────────────────────────────────────────────────────────
    # B2C — Serviço com Agendamento (Clínica, Salão, Studio, Academia)
    # Jornada: Ads → LP/WhatsApp → Lead → MQL → SQL → Venda
    # ─────────────────────────────────────────────────────────
    "b2c_servico_agendamento": {
        "label": "B2C — Serviço com Agendamento (Clínica, Salão, Studio)",
        "jornada": ["impressoes", "cliques", "leads", "mqls", "sqls", "vendas"],
        "conversao_direta": False,
        "etapas": {
            "lead_para_mql": {
                "otimo": 0.33, "aceitavel": 0.20, "ruim": 0.10,
                "label": "Lead → MQL (Interesse confirmado)"
            },
            "mql_para_sql": {
                "otimo": 0.33, "aceitavel": 0.25, "ruim": 0.20,
                "label": "MQL → SQL (Qualificado para venda)"
            },
            "sql_para_venda": {
                "otimo": 0.33, "aceitavel": 0.25, "ruim": 0.20,
                "label": "SQL → Venda (Fechamento)"
            },
            "lead_para_venda": {
                "otimo": 0.05, "aceitavel": 0.03, "ruim": 0.01,
                "label": "Lead → Venda (Taxa consolidada do funil)"
            },
        },
        "canal_benchmarks": {
            "meta_ads": {
                "ctr_estatico": {"otimo": 0.015, "aceitavel": 0.008, "ruim": 0.003},
                "ctr_video":    {"otimo": 0.020, "aceitavel": 0.010, "ruim": 0.005},
                "frequencia_max": 3,
            },
            "google_ads": {
                "ctr_pesquisa": {"otimo": 0.10, "aceitavel": 0.07, "ruim": 0.03},
            }
        },
        "cost_structure": {
            "tax_rate": 0.15,
            "shipping_rate": 0.0,
            "marketplace_fee": 0.0,
            "avg_frequency_year": 6.0,
            "avg_customer_life_months": 24,
            "target_ebitda_pct": 0.20,
            "healthy_roas": 4.0,
            "healthy_ltv_cac": 4.0,
        }
    },

    # ─────────────────────────────────────────────────────────
    # B2B — Serviço com Ciclo Longo (Consultoria, SaaS, Agência)
    # Jornada: Ads → LP Form → Lead → MQL → SQL → Oportunidade → Venda
    # ─────────────────────────────────────────────────────────
    "b2b_servico": {
        "label": "B2B — Serviço / Consultoria / SaaS",
        "jornada": ["impressoes", "cliques", "leads", "mqls", "sqls", "oportunidades", "vendas"],
        "conversao_direta": False,
        "etapas": {
            "lp_para_lead": {
                "otimo": 0.08, "aceitavel": 0.05, "ruim": 0.03,
                "label": "LP/Form → Lead"
            },
            "lead_para_mql": {
                "otimo": 0.33, "aceitavel": 0.25, "ruim": 0.10,
                "label": "Lead → MQL"
            },
            "mql_para_sql": {
                "otimo": 0.33, "aceitavel": 0.25, "ruim": 0.10,
                "label": "MQL → SQL"
            },
            "sql_para_oportunidade": {
                "otimo": 0.33, "aceitavel": 0.25, "ruim": 0.10,
                "label": "SQL → Oportunidade"
            },
            "oportunidade_para_venda": {
                "otimo": 0.33, "aceitavel": 0.20, "ruim": 0.10,
                "label": "Oportunidade → Venda (Closing)"
            },
            "lead_para_venda": {
                "otimo": 0.10, "aceitavel": 0.06, "ruim": 0.03,
                "label": "Lead → Venda (Taxa total do funil)"
            },
        },
        "canal_benchmarks": {
            "meta_ads": {
                "ctr_estatico": {"otimo": 0.010, "aceitavel": 0.008, "ruim": 0.003},
                "ctr_video":    {"otimo": 0.015, "aceitavel": 0.010, "ruim": 0.005},
            },
            "google_ads": {
                "ctr_pesquisa": {"otimo": 0.10, "aceitavel": 0.07, "ruim": 0.03},
                "ctr_pmax":     {"otimo": 0.010, "aceitavel": 0.008, "ruim": 0.003},
            }
        },
        "cost_structure": {
            "tax_rate": 0.155,
            "shipping_rate": 0.0,
            "marketplace_fee": 0.0,
            "avg_frequency_year": 1.0,
            "avg_customer_life_months": 24,
            "target_ebitda_pct": 0.25,
            "healthy_roas": 5.0,
            "healthy_ltv_cac": 5.0,
        }
    },

    # ─────────────────────────────────────────────────────────
    # B2C — Infoproduto / Curso Online / Mentoria
    # Jornada: Ads → VSL/LP → Compra (conversão direta, alta margem)
    # ─────────────────────────────────────────────────────────
    "b2c_infoproduto": {
        "label": "B2C — Infoproduto / Curso Online / Mentoria",
        "jornada": ["impressoes", "cliques", "sessoes", "pedidos"],
        "conversao_direta": True,
        "etapas": {
            "sessao_para_pedido": {
                "otimo": 0.02, "aceitavel": 0.01, "ruim": 0.005,
                "label": "Sessão → Compra (Conversão VSL/LP)"
            }
        },
        "canal_benchmarks": {
            "meta_ads": {
                "ctr_video": {"otimo": 0.025, "aceitavel": 0.015, "ruim": 0.007},
                "ctr_estatico": {"otimo": 0.015, "aceitavel": 0.010, "ruim": 0.005},
                "frequencia_max": 5,
            }
        },
        "cost_structure": {
            "tax_rate": 0.135,
            "shipping_rate": 0.0,
            "marketplace_fee": 0.09,  # Kiwify, Hotmart ~9%
            "avg_frequency_year": 1.5,
            "avg_customer_life_months": 12,
            "target_ebitda_pct": 0.35,
            "healthy_roas": 6.0,
            "healthy_ltv_cac": 4.0,
        }
    },
}


def get_funnel_model(funnel_type: str) -> dict:
    """
    Retorna o modelo de funil pelo tipo.
    Recebe: funnel_type (str)
    Retorna: dict com o modelo completo, ou b2c_ecommerce como fallback
    """
    return FUNNEL_BENCHMARKS.get(funnel_type, FUNNEL_BENCHMARKS["b2c_ecommerce"])


def list_funnel_types() -> list[dict]:
    """
    Lista todos os modelos disponíveis para o frontend exibir no onboarding.
    Recebe: nada
    Retorna: lista de { value, label }
    """
    return [
        {"value": key, "label": model["label"]}
        for key, model in FUNNEL_BENCHMARKS.items()
    ]

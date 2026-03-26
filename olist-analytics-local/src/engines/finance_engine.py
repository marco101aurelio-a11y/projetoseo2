from jax import jit

@jit
def calculate_dre_line_items(investment, roas, variable_costs_pct, fixed_costs):
    """
    Simulação JAX para DRE Pro.
    Returns: (Gross Revenue, Variable Costs, Margin, EBITDA)
    """
    revenue = investment * roas
    v_costs = revenue * variable_costs_pct
    margin = revenue - v_costs - investment  # Adicionado investment como custo
    ebitda = margin - fixed_costs
    return revenue, v_costs, margin, ebitda

class FinanceEngine:
    def __init__(self):
        self.benchmarks = {
            "target_margin": 0.25,
            "target_ltv_cac": 3.0,
            "tax_rate": 0.12,        # 12% (Conforme Excel)
            "shipping_rate": 0.05,   # 5% frete
            "marketplace_fee": 0.15, # 15% comissão marketplace
            "cogs_default": 0.30     # 30% Custo Produto
        }

    def simulate_dre_pro(self, investment, roas, fixed_costs, cogs_pct):
        """
        Gera um DRE completo baseado no modelo 'DRE Projetado.xlsx'.
        
        Args:
            investment: Investimento em Ads (R$)
            roas: ROAS esperado
            fixed_costs: Soma de Aluguel, Pro-labore, Plataforma, etc.
            cogs_pct: % Custo do Produto / Matéria Prima
        """
        # % Total de Custos Variáveis (Imposto + Frete + Marketplace + COGS)
        total_v_pct = self.benchmarks["tax_rate"] + self.benchmarks["shipping_rate"] + self.benchmarks["marketplace_fee"] + cogs_pct
        
        revenue, v_costs, margin, ebitda = calculate_dre_line_items(
            investment, roas, total_v_pct, fixed_costs
        )
        
        ebitda_pct = (ebitda / (revenue + 1e-9)) * 100
        
        # Cálculos de Eficiência (V4 Framework)
        margem_contribuicao_pct = (margin / (revenue + 1e-9))
        breakeven = (fixed_costs / (margem_contribuicao_pct + 1e-9))
        ltv_cac = roas / 1.5 # Simulação simplificada de LTV/CAC
        
        return {
            "summary": {
                "revenue": float(revenue),
                "ebitda": float(ebitda),
                "ebitda_pct": float(ebitda_pct),
                "net_margin": float(ebitda_pct / 100), # Adicionado para compatibilidade com Dashboard
                "ltv_cac_ratio": float(ltv_cac),
                "breakeven": float(breakeven),
                "status": "Healthy" if ebitda_pct > 15 else "Critical" if ebitda_pct < 5 else "Stabilizing"
            },
            "detailed_dre": {
                "receita_bruta": float(revenue),
                "investimento_ads": float(investment),
                "custos_variaveis": {
                    "total": float(v_costs),
                    "impostos": float(revenue * self.benchmarks["tax_rate"]),
                    "frete": float(revenue * self.benchmarks["shipping_rate"]),
                    "comissao_mktp": float(revenue * self.benchmarks["marketplace_fee"]),
                    "cogs_produto": float(revenue * cogs_pct)
                },
                "margem_contribuicao": float(margin),
                "custos_fixos": float(fixed_costs),
                "ebitda_final": float(ebitda)
            }
        }

    def project_multi_month_dre(self, investment_start, growth_rate, roas_start, decay_rate, fixed_costs, cogs_pct, months=12):
        """
        Gera uma projeção de vários meses baseada no comportamento do 'DRE Projetado.xlsx'.
        """
        projection = []
        for m in range(months):
            inv = investment_start * (1 + growth_rate) ** m
            r_val = roas_start * (1 - decay_rate) ** m
            
            # Reutiliza a lógica de simulação pontual para cada mês
            month_data = self.simulate_dre_pro(inv, r_val, fixed_costs, cogs_pct)
            month_data["month"] = m + 1
            projection.append(month_data)
            
        return projection

    def analyze_finance(self, revenue, costs, fixed_costs, cac, ltv):
        """Versão legada para compatibilidade retroativa."""
        net_margin = (revenue - costs - fixed_costs) / (revenue + 1e-9)
        ltv_cac = calculate_unit_economics(ltv, cac)
        return {
            "net_margin": float(net_margin),
            "ltv_cac_ratio": float(ltv_cac),
            "status": "OK" if net_margin > 0.1 else "Refinar"
        }

"""
test_pipeline.py — Teste de integração: Meta Mock → Conector → FinanceEngine
Execute a partir de: olist-analytics-local/src/
"""
import sys
import os

# Garante que src/ está no path
src_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, src_dir)

from engines.funnel_models import FUNNEL_BENCHMARKS, list_funnel_types
from engines.finance_engine import FinanceEngine, TrafficRawData
from connectors.meta_to_finance_connector import MetaToFinanceConnector
from services.meta_ads_service import MetaAdsService

def run_test():
    print("=" * 50)
    print("CAPVI — Teste de Integração: Pipeline Completo")
    print("=" * 50)

    # 1. Funnel models
    modelos = list_funnel_types()
    print(f"\n✅ funnel_models: {len(modelos)} modelos carregados")
    for m in modelos:
        print(f"   - {m['value']}: {m['label']}")

    # 2. Mock Meta Ads
    svc  = MetaAdsService()
    mock = svc.get_mock_data("demo_account")
    resumo = mock["data"]["resumo"]
    print(f"\n✅ MetaAdsService (mock): {resumo['num_campanhas']} campanhas")
    print(f"   Investimento: R$ {resumo['investimento_total']}")
    print(f"   Receita:      R$ {resumo['receita_total']}")
    print(f"   ROAS geral:   {resumo['roas_geral']}x")
    print(f"   CAC geral:    R$ {resumo['cac_geral']}")

    # 3. Conector
    connector = MetaToFinanceConnector()
    traffic   = connector.build_traffic_data(
        meta_insights=mock["data"]["campanhas_raw"],
        cogs_pct=0.35,
        fixed_costs=4500.0,
        funnel_type="b2c_ecommerce"
    )
    print(f"\n✅ MetaToFinanceConnector:")
    print(f"   investment={traffic.investment}, orders={traffic.orders}, revenue={traffic.revenue}")
    print(f"   funnel_type detectado: {traffic.funnel_type}")

    # 4. FinanceEngine
    engine = FinanceEngine(funnel_type=traffic.funnel_type)
    result = engine.analyze_from_raw(traffic)
    d      = result["data"]
    print(f"\n✅ FinanceEngine v2.0:")
    print(f"   ROAS:    {d['metricas_primarias']['roas']}x")
    print(f"   CTR:     {d['metricas_primarias']['ctr']}%")
    print(f"   CAC:     R$ {d['metricas_primarias']['cac']}")
    print(f"   EBITDA:  R$ {d['dre']['ebitda']} ({d['dre']['ebitda_pct']}%)")
    print(f"   LTV/CAC: {d['metricas_secundarias']['ltv_cac_ratio']}x")
    print(f"\n   → Status: {d['diagnostico']['status_geral']} (score: {d['diagnostico']['health_score']})")
    if d['diagnostico']['alertas']:
        print(f"   → {len(d['diagnostico']['alertas'])} alerta(s):")
        for a in d['diagnostico']['alertas']:
            print(f"     [{a['nivel']}] {a['metrica']}: {a['valor']} (bench: {a['benchmark']})")
    print(f"\n   → Engenharia Reversa (meta EBITDA {d['engenharia_reversa']['para_meta_ebitda_pct']}%):")
    print(f"     Investimento necessário: R$ {d['engenharia_reversa']['investimento_necessario']}")
    print(f"     Gap atual:               R$ {d['engenharia_reversa']['gap_atual']}")

    print("\n" + "=" * 50)
    print("TODOS OS TESTES PASSARAM ✅")
    print("=" * 50)

if __name__ == "__main__":
    run_test()

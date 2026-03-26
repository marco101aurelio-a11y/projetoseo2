"""
🚀 REFINARIA JAX V4.0 - CAPVI SEO & MARKETING (ADVANCED)
Especializada em RFM e Projeção DRE (Baseado no Modelo Excel)

INSTRUÇÕES PARA O GOOGLE COLAB:
1. Suba os CSVs: order_items, products, customers e ORDERS.
2. O arquivo 'olist_orders_dataset.csv' é ESSENCIAL para o RFM.
"""

import jax
import jax.numpy as jnp
from jax import jit
import pandas as pd
import numpy as np
import os
from datetime import datetime

# --- 🎯 MOTORES MATEMÁTICOS JAX ---

@jit
def calcular_metricas_base(investimento, roas):
    receita = investimento * roas
    return receita

@jit
def calcular_rfm_score(r_pontos, f_pontos, m_pontos):
    """Score RFM Ponderado (0-100)"""
    return (r_pontos * 0.4) + (f_pontos * 0.3) + (m_pontos * 0.3)

# --- 🧪 REFINAMENTO AVANÇADO (RFM) ---

def processar_rfm(path_orders, path_items, path_customers):
    print("\n📊 Calculando RFM (Recência, Frequência, Valor)...")
    try:
        df_orders = pd.read_csv(path_orders)
        df_items = pd.read_csv(path_items)
        df_customers = pd.read_csv(path_customers)

        # Converter datas
        df_orders['order_purchase_timestamp'] = pd.to_datetime(df_orders['order_purchase_timestamp'])
        
        # Merge orders com items para valor e customers para ID único
        df_merged = pd.merge(df_orders, df_items, on='order_id')
        df_merged = pd.merge(df_merged, df_customers, on='customer_id')

        # Data de referência (simulando hoje como o último pedido + 1 dia)
        ref_date = df_merged['order_purchase_timestamp'].max() + pd.Timedelta(days=1)

        # Agregação por Cliente Único
        rfm = df_merged.groupby('customer_unique_id').agg({
            'order_purchase_timestamp': lambda x: (ref_date - x.max()).days,
            'order_id': 'nunique',
            'price': 'sum'
        }).rename(columns={
            'order_purchase_timestamp': 'recencia',
            'order_id': 'frequencia',
            'price': 'monetario'
        })

        print(f"✅ RFM Calculado para {len(rfm)} clientes únicos.")
        print(f"   -> Recência Média: {rfm['recencia'].mean():.1f} dias")
        print(f"   -> Frequência Média: {rfm['frequencia'].mean():.2f} compras")
        print(f"   -> Valor Médio por Cliente: R$ {rfm['monetario'].mean():.2f}")

        return rfm
    except Exception as e:
        print(f"⚠️ Erro no RFM: {e}")
        return None

# --- 📉 PROJEÇÃO DRE (ESTILO EXCEL) ---

def projetar_dre_expansao(investimento_inicial, roas_inicial, taxa_crescimento=0.1, perda_performance=0.05, meses=12):
    print(f"\n📈 Projetando Expansão para {meses} meses...")
    
    # Parâmetros de Custo (Benchmarks Capvi)
    imposto = 0.12 # 12%
    cogs = 0.30    # 30% Custo Produto
    fixos = 5000   # R$ 5k fixo base
    
    projeção = []
    inv = investimento_inicial
    roas = roas_inicial
    
    print(f"{'Mês':<5} | {'Invest.':<10} | {'ROAS':<6} | {'Receita':<12} | {'EBITDA':<10}")
    print("-" * 55)
    
    for m in range(1, meses + 1):
        receita = inv * roas
        custos_var = receita * (imposto + cogs)
        margem = receita - custos_var - inv
        ebitda = margem - fixos
        
        print(f"{m:<5} | R$ {inv:<7.0f} | {roas:<6.2f} | R$ {receita:<9.0f} | R$ {ebitda:<8.0f}")
        
        projeção.append({"mes": m, "receita": receita, "ebitda": ebitda})
        
        # Evolução para o próximo mês
        inv *= (1 + taxa_crescimento)
        roas *= (1 - perda_performance)
        
    return projeção

if __name__ == "__main__":
    print("🔋 Motor JAX Advanced Refinery V4.0 Online.")
    
    # 1. Simulação DRE Projetado
    projetar_dre_expansao(investimento_inicial=2000, roas_inicial=9.0, meses=6)
    
    print("\n💡 DICA: Para processar SEUS dados reais de RFM, use:")
    print("processar_rfm('olist_orders_dataset.csv', 'olist_order_items_dataset.csv', 'olist_customers_dataset.csv')")

"""
🚀 REFINARIA JAX - CAPVI SEO & MARKETING V3.5 (PT-BR)
Este script permite calibrar o "Cérebro" do projeto usando o Google Colab.

INSTRUÇÕES PARA O GOOGLE COLAB:
1. Abra o Google Colab (colab.research.google.com).
2. Clique em 'Arquivo' > 'Fazer upload de notebook' e escolha este arquivo (ou cole o código).
3. No menu lateral (pasta), suba os arquivos .csv da Olist:
   - olist_order_items_dataset.csv
   - olist_products_dataset.csv
   - olist_customers_dataset.csv
   - (Opcional) olist_orders_dataset.csv -> Para análise de tempo precisa.
"""

import jax
import jax.numpy as jnp
from jax import jit
import pandas as pd
import numpy as np
from datetime import datetime

# --- 🎯 MOTORES MATEMÁTICOS JAX (ALTA PERFORMANCE) ---

@jit
def calcular_ipm(volume, competicao, cpc):
    """Índice de Potencial de Mercado (IPM)"""
    score = (volume * (100 - competicao)) / (cpc + 1.0)
    return score

@jit
def calcular_ponto_equilibrio(custos_fixos, margem_contribuicao_pct):
    """Ponto de Equilíbrio Finaceiro"""
    return custos_fixos / (margem_contribuicao_pct + 1e-9)

@jit
def calcular_saude_ltv_cac(ltv, cac):
    """Proporção LTV/CAC (Ideal > 3.0)"""
    return ltv / (cac + 1e-9)

# --- 🧪 REFINAMENTO E LIMPEZA DE DADOS (PANDAS) ---

def refinar_dados_olist(path_items, path_products, path_customers):
    """
    Carrega, cruza e limpa os dados para gerar os novos Benchmarks do projeto.
    """
    print("\n🔍 Iniciando Refinamento de Dados...")
    
    try:
        # Carregamento
        df_items = pd.read_csv(path_items)xande 
        df_products = pd.read_csv(path_products)
        df_customers = pd.read_csv(path_customers)
        
        # 1. Cruzamento (Merge)
        # Cruzando itens com produtos para saber as categorias
        df_completo = pd.merge(df_items, df_products, on='product_id', how='left')
        
        # 2. Limpeza
        df_completo = df_completo.dropna(subset=['price']) # Remove itens sem preço
        
        # 3. Extração de Métricas de Negócio
        ticket_medio = df_completo['price'].mean()
        faturamento_total = df_completo['price'].sum()
        top_categorias = df_completo['product_category_name'].value_counts().head(5)
        
        print("✅ Dados Refinados com Sucesso!")
        print(f"   -> Ticket Médio: R$ {ticket_medio:.2f}")
        print(f"   -> Itens Processados: {len(df_completo)}")
        print(f"   -> Top 5 Categorias:\n{top_categorias}")
        
        return {
            "ticket_medio": float(ticket_medio),
            "total_processado": len(df_completo)
        }
        
    except FileNotFoundError as e:
        print(f"⚠️ Erro: Arquivo não encontrado. Verifique se você fez o upload dos CSVs no Colab.\nDetalhe: {e}")
        return None

# --- 🚀 SIMULAÇÃO DE CRESCIMENTO ---

def simular_escala(investimento, cac_alvo, ltv_estimado):
    """Simula o retorno sobre investimento baseado nos dados refinados."""
    novos_clientes = investimento / cac_alvo
    receita_projetada = novos_clientes * ltv_estimado
    roi = (receita_projetada - investimento) / investimento
    
    print(f"\n💎 PROJEÇÃO DE ESCALA:")
    print(f"   Investimento: R$ {investimento}")
    print(f"   Novos Clientes Estimados: {int(novos_clientes)}")
    print(f"   Faturamento Projetado: R$ {receita_projetada:.2f}")
    print(f"   ROI Estratégico: {roi:.2f}x")

if __name__ == "__main__":
    print("🔋 Motor JAX Refinery V3.5 Online.")
    
    # Exemplo de uso com dados manuais (Modo de Teste)
    simular_escala(investimento=10000, cac_alvo=50, ltv_estimado=450)
    
    print("\n💡 DICA: Para rodar com SEUS arquivos no Colab, use:")
    print("refinar_dados_olist('olist_order_items_dataset.csv', 'olist_products_dataset.csv', 'olist_customers_dataset.csv')")

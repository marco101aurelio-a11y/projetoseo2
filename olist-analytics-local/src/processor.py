import pandas as pd
import numpy as np
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DADOS_PATH = os.getenv("DADOS_PATH", "./Documentos")

class OlistProcessor:
    def __init__(self):
        self.customers_path = os.path.join(DADOS_PATH, "brazil ecommercer/olist_customers_dataset.csv")
        self.orders_path = os.path.join(DADOS_PATH, "brazil ecommercer/olist_orders_dataset.csv")
        self.items_path = os.path.join(DADOS_PATH, "brazil ecommercer/olist_order_items_dataset.csv")
        self.mql_path = os.path.join(DADOS_PATH, "olist_marketing_qualified_leads_dataset.csv")

    def _load_data(self):
        print("📊 Carregando dados do Olist...")
        customers = pd.read_csv(self.customers_path)
        orders = pd.read_csv(self.orders_path)
        items = pd.read_csv(self.items_path)
        
        # Converter datas
        orders['order_purchase_timestamp'] = pd.to_datetime(orders['order_purchase_timestamp'])
        return customers, orders, items

    def calculate_rfm(self):
        customers, orders, items = self._load_data()
        
        # Merge datasets
        df = pd.merge(orders, customers, on="customer_id")
        df = pd.merge(df, items, on="order_id")
        
        # Filtrar apenas entregues para ser mais preciso
        df = df[df['order_status'] == 'delivered']
        
        # Data de referência para Recência (um dia após a última compra do dataset)
        ref_date = df['order_purchase_timestamp'].max() + pd.Timedelta(days=1)
        
        rfm = df.groupby('customer_unique_id').agg({
            'order_purchase_timestamp': lambda x: (ref_date - x.max()).days,
            'order_id': 'count',
            'price': 'sum'
        }).reset_index()
        
        rfm.columns = ['customer_id', 'recency', 'frequency', 'monetary']
        
        # Scores de 1 a 5 (Quintis)
        try:
            rfm['r_score'] = pd.qcut(rfm['recency'], 5, labels=[5, 4, 3, 2, 1])
            rfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5])
            rfm['m_score'] = pd.qcut(rfm['monetary'], 5, labels=[1, 2, 3, 4, 5])
            
            rfm['rfm_score'] = rfm['r_score'].astype(int) + rfm['f_score'].astype(int) + rfm['m_score'].astype(int)
        except Exception as e:
            print(f"⚠️ Erro ao calcular quintis (dados insuficientes?): {e}")
            # Fallback simples se os dados forem poucos p/ qcut
            rfm['rfm_score'] = 3 

        return rfm

    def calculate_zscore_metrics(self, rfm_df):
        # Normalização Z-Score para identificar outliers (Campeões)
        metrics = ['recency', 'frequency', 'monetary']
        for col in metrics:
            rfm_df[f'{col}_zscore'] = (rfm_df[col] - rfm_df[col].mean()) / rfm_df[col].std()
        
        return rfm_df

    def get_summary_benchmarks(self):
        rfm = self.calculate_rfm()
        rfm = self.calculate_zscore_metrics(rfm)
        
        summary = {
            "total_customers": int(len(rfm)),
            "avg_recency": float(rfm['recency'].mean()),
            "avg_frequency": float(rfm['frequency'].mean()),
            "avg_monetary": float(rfm['monetary'].mean()),
            "segments": {
                "Champions": int(len(rfm[rfm['rfm_score'] >= 12])),
                "Loyal": int(len(rfm[(rfm['rfm_score'] >= 9) & (rfm['rfm_score'] < 12)])),
                "At Risk": int(len(rfm[(rfm['rfm_score'] >= 5) & (rfm['rfm_score'] < 9)])),
                "Lost": int(len(rfm[rfm['rfm_score'] < 5]))
            }
        }
        return summary

if __name__ == "__main__":
    processor = OlistProcessor()
    benchmarks = processor.get_summary_benchmarks()
    print(benchmarks)

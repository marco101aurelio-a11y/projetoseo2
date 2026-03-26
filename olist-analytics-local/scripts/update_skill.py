import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:8001/api/benchmarks"
SKILL_PATH = "/Users/apple/Documents/MY MIND/Documents/4 - Arquivados /Antigravity/projeto automação blog/.agent/skills/.agente-mkt/SKIIL mkt.md"
BENCHMARK_FILE = "/Users/apple/Documents/MY MIND/Documents/4 - Arquivados /Antigravity/projeto automação blog/Documentos/olist_benchmarks_v4.json"

def update_skill():
    print("📡 Buscando benchmarks reais do Olist...")
    try:
        response = requests.get(API_URL)
        if response.status_code != 200:
            print("❌ Erro ao acessar API de Analytics.")
            return

        data = response.json()
        
        # Salvar arquivo JSON persistente
        with open(BENCHMARK_FILE, "w") as f:
            json.dump(data, f, indent=4)
        print(f"✅ Arquivo persistente gerado: {BENCHMARK_FILE}")

        # Injetar no SKIIL mkt.md
        with open(SKILL_PATH, "r") as f:
            content = f.read()

        benchmark_section = f"""
## 📊 Benchmarks Reais (Olist Brasil)
*Dados calculados dinamicamente via olist-analytics*

- **Total de Clientes Analisados:** {data['total_customers']}
- **Recência Média:** {data['avg_recency']:.1f} dias
- **Frequência Média:** {data['avg_frequency']:.2f} pedidos/cliente
- **Ticket Médio (Monetário):** R$ {data['avg_monetary']:.2f}

### Segmentação V4 Atual:
- **Champions (Campeões):** {data['segments']['Champions']}
- **Loyal (Fiéis):** {data['segments']['Loyal']}
- **At Risk (Em Risco):** {data['segments']['At Risk']}
- **Lost (Perdidos):** {data['segments']['Lost']}

---
"""
        
        # Se já existir a seção, substitui. Se não, adiciona no final.
        if "## 📊 Benchmarks Reais (Olist Brasil)" in content:
            parts = content.split("## 📊 Benchmarks Reais (Olist Brasil)")
            # Pega o conteúdo antes e mantém o que vier depois do próximo separador se houver
            after_section = parts[1].split("---", 1)
            suffix = after_section[1] if len(after_section) > 1 else ""
            new_content = parts[0] + benchmark_section + suffix
        else:
            new_content = content + benchmark_section

        with open(SKILL_PATH, "w") as f:
            f.write(new_content)
        
        print(f"✅ SKIIL mkt.md atualizado com sucesso!")

    except Exception as e:
        print(f"❌ Erro na automação: {e}")

if __name__ == "__main__":
    update_skill()

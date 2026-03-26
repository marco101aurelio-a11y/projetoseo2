import jax.numpy as jnp
from jax import jit

@jit
def calculate_ipm(volume, competition, cpc):
    """Fórmula: IPM = (Volume * (1 - Concorrência/100)) / (CPC + 0.01)"""
    return (volume * (1 - competition / 100)) / (cpc + 0.01)

class SEOEngine:
    def __init__(self):
        # Configurações Regionais (V4.4+)
        self.REGIONAL_CONFIG = {
            "BR": {"currency": "R$", "cpc_mult": 1.0, "vol_mult": 1.0, "rate": 1.0},
            "US": {"currency": "$", "cpc_mult": 5.2, "vol_mult": 2.5, "rate": 5.2},
            "ES": {"currency": "€", "cpc_mult": 4.8, "vol_mult": 1.2, "rate": 5.4},
            "PT": {"currency": "€", "cpc_mult": 3.2, "vol_mult": 0.8, "rate": 5.4},
        }
        
        # Configurações de Motor
        self.ENGINE_CONFIG = {
            "google": {"vol_mult": 1.0, "comp_mult": 1.0},
            "youtube": {"vol_mult": 2.2, "comp_mult": 0.7},
            "bing": {"vol_mult": 0.15, "comp_mult": 0.5},
        }

    def analyze_keyword(self, volume, competition, cpc):
        ipm_score = calculate_ipm(volume, competition, cpc)
        if ipm_score > 10000:
            classification, description = "Oceano Azul", "IPM explosivo. Alta eficiência local."
        elif 3000 <= ipm_score <= 10000:
            classification, description = "Zona de Crescimento", "IPM saudável. Espaço para escala."
        else:
            classification, description = "Mercado Maduro", "IPM moderado. Exige diferenciação."

        return {
            "score": float(ipm_score),
            "classification": classification,
            "description": description
        }

    def simulate_keyword_metrics(self, keyword: str, country: str = "BR", engine: str = "google"):
        k = keyword.lower()
        conf = self.REGIONAL_CONFIG.get(country, self.REGIONAL_CONFIG["BR"])
        e_conf = self.ENGINE_CONFIG.get(engine, self.ENGINE_CONFIG["google"])
        
        # 1. Detecção de Intenção
        transactional_terms = ["comprar", "preço", "valor", "oferta", "promoção", "loja", "onde", "buy", "price"]
        informational_terms = ["como", "o que", "porque", "dicas", "guia", "how", "what", "tips"]
        brand_terms = ["nivea", "loreal", "apple", "nike", "pampers"]
        
        is_transactional = any(t in k for t in transactional_terms)
        is_informational = any(i in k for i in informational_terms)
        is_brand = any(b in k for b in brand_terms)
        
        # 2. Base de Volume
        words = k.split()
        base_volume = (8000 / (len(words) + 0.2)) * conf["vol_mult"] * e_conf["vol_mult"]
        
        if is_informational: base_volume *= 1.5
        if is_transactional: base_volume *= 0.7
            
        # 3. Cálculo de CPC
        base_cpc_usd = 0.25 # USD Base
        if is_transactional: base_cpc_usd += 0.80
        if is_brand: base_cpc_usd += 0.30
        if is_informational: base_cpc_usd *= 0.4
        
        final_cpc = base_cpc_usd * conf["cpc_mult"] * e_conf["comp_mult"]
        volume = int(base_volume * (0.9 + (len(k) % 4) / 10))
        cpc = final_cpc + (len(k) % 7) / 10.0
        
        # 4. Competição
        competition_idx = 40 * e_conf["comp_mult"]
        if is_transactional: competition_idx += 35
        if is_brand: competition_idx += 20
        competition_idx = min(99, max(5, competition_idx + (len(k) % 15)))
        
        return {
            "keyword": keyword,
            "search_volume": volume,
            "cpc": float(cpc),
            "currency": conf["currency"],
            "competition": "HIGH" if competition_idx > 70 else "MEDIUM" if competition_idx > 30 else "LOW",
            "competition_index": competition_idx,
            "is_jax_simulated": True,
            "intent": "TRANSACTIONAL" if is_transactional else "INFORMATIONAL" if is_informational else "GENERIC",
            "engine": engine,
            "country": country
        }

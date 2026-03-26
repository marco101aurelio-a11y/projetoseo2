import jax.numpy as jnp
from jax import jit

@jit
def calculate_ice(impact, confidence, ease):
    """Fórmula ICE Score = Impacto * Confiança * Facilidade"""
    return impact * confidence * ease

class GrowthEngine:
    def analyze_growth(self, impact, confidence, ease):
        score = calculate_ice(impact, confidence, ease)
        return {
            "score": float(score),
            "priority": "Alta" if score > 500 else "Média" if score > 200 else "Baixa",
            "action": "Executar Imediatamente" if score > 700 else "Validar MVP"
        }

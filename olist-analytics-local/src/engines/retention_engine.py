import jax.numpy as jnp
from jax import jit
import numpy as np

@jit
def calculate_rfm(z_r, z_f, z_m):
    """Fórmula RFM Ponderada: (-z_R * 0.3) + (z_F * 0.3) + (z_M * 0.4)"""
    return (-z_r * 0.3) + (z_f * 0.3) + (z_m * 0.4)

class RetentionEngine:
    def __init__(self):
        self.benchmarks = {
            "R_mean": 120, "R_std": 87,
            "F_mean": 8.3, "F_std": 6.1,
            "M_mean": 847, "M_std": 1204
        }

    def analyze_retention(self, r, f, m):
        z_r = (r - self.benchmarks["R_mean"]) / (self.benchmarks["R_std"] + 1e-9)
        z_f = (f - self.benchmarks["F_mean"]) / (self.benchmarks["F_std"] + 1e-9)
        z_m = (np.log1p(m) - np.log1p(self.benchmarks["M_mean"])) / 0.5 
        rfm_score = calculate_rfm(z_r, z_f, z_m)
        
        return {
            "rfm_score": float(rfm_score),
            "segmento": "🏆 Campeão" if rfm_score >= 1.8 else "✅ Bom" if rfm_score >= 0.6 else "⚠️ Risco",
            "z_scores": {"R": float(z_r), "F": float(z_f), "M": float(z_m)}
        }

    def calibrate_from_refinery(self, rfm_df):
        """
        Atualiza os benchmarks internos baseados nos dados reais da Refinaria JAX.
        """
        self.benchmarks["R_mean"] = float(rfm_df['recencia'].mean())
        self.benchmarks["R_std"] = float(rfm_df['recencia'].std())
        self.benchmarks["F_mean"] = float(rfm_df['frequencia'].mean())
        self.benchmarks["F_std"] = float(rfm_df['frequencia'].std())
        self.benchmarks["M_mean"] = float(rfm_df['monetario'].mean())
        self.benchmarks["M_std"] = float(rfm_df['monetario'].std())
        print(f"✅ Benchmarks de Retenção Recalibrados: {self.benchmarks}")

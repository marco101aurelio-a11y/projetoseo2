# 📦 financial_service_extended.py
# 
# Adicione essas classes/métodos ao seu financial_service.py existente.
# Ou crie um novo arquivo e importe: from financial_service_extended import RevenueValidator
#
# Instruções:
# 1. Copie os métodos para sua classe FinancialService
# 2. Crie uma rota POST /api/v1/finance/validate-and-save (ver abaixo)
# 3. Teste com: pytest tests/test_revenue_validation.py

from typing import Optional, Dict, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy import desc
from models import FinancialRecord, BusinessProfile
import jax.numpy as jnp
from engines.finance_engine import FinanceEngine, TrafficRawData


class RevenueValidator:
    """
    Valida faturamento reportado pelo usuário contra expectativas do Meta.
    
    Lógica:
    1. Estima receita esperada = spend_meta × roas_esperado
    2. Compara com receita reportada: delta_pct = |reportado - esperado| / esperado
    3. Calcula score de confiança baseado na discrepância
    4. Retorna validação + recomendações
    """
    
    # ROAS esperado por tipo de funil (histórico de benchmarks)
    ROAS_BENCHMARKS = {
        "b2c_ecommerce": {
            "healthy": 2.5,
            "range_min": 1.5,
            "range_max": 4.0,
        },
        "b2b_saas": {
            "healthy": 3.0,
            "range_min": 2.0,
            "range_max": 5.0,
        },
        "b2b_services": {
            "healthy": 2.8,
            "range_min": 1.8,
            "range_max": 4.5,
        },
        "marketplace": {
            "healthy": 2.0,
            "range_min": 1.2,
            "range_max": 3.0,
        },
        "e_services": {
            "healthy": 2.8,
            "range_min": 1.8,
            "range_max": 4.0,
        },
    }
    
    # Tolerância de discrepância por confidence level
    CONFIDENCE_THRESHOLDS = {
        "MUITO_ALINHADO": {"delta_max": 5, "confidence": 1.0},
        "ALINHADO": {"delta_max": 15, "confidence": 0.85},
        "DIVERGENTE": {"delta_max": 25, "confidence": 0.60},
        "MUITO_DIVERGENTE": {"delta_max": float('inf'), "confidence": 0.30},
    }
    
    def __init__(self, db_session):
        self.db = db_session
    
    def validate_reported_revenue(
        self,
        user_id: str,
        revenue_reported: float,
        month: str,
        meta_spend: float,
        meta_conversions: int,
        force_roas: Optional[float] = None,
    ) -> Dict:
        """
        Valida faturamento reportado contra expectativa do Meta.
        
        Args:
            user_id: ID do usuário
            revenue_reported: Receita que o usuário reportou
            month: "2025-04"
            meta_spend: Gasto total em Meta ads
            meta_conversions: Total de conversões rastreadas
            force_roas: Se informado, usa esse ROAS em vez do benchmark
        
        Returns:
            {
                "is_valid": bool,
                "confidence": float (0.0-1.0),
                "status": str (MUITO_ALINHADO | ALINHADO | DIVERGENTE | MUITO_DIVERGENTE),
                "message": str (mensagem legível),
                "details": {
                    "delta_pct": float,
                    "revenue_expected": float,
                    "revenue_reported": float,
                    "applied_roas": float,
                    "meta_spend": float,
                    "meta_conversions": int,
                }
            }
        """
        
        eps = 1e-9
        
        # 1. Buscar profile do usuário
        profile = self.db.query(BusinessProfile).filter_by(user_id=user_id).first()
        if not profile:
            return self._error_validation("Perfil não encontrado")
        
        # 2. Determinar ROAS esperado
        if force_roas:
            roas_esperado = force_roas
            roas_source = "custom"
        else:
            roas_esperado = self.ROAS_BENCHMARKS.get(
                profile.funnel_type,
                self.ROAS_BENCHMARKS["b2c_ecommerce"]
            )["healthy"]
            roas_source = "benchmark"
        
        # 3. Calcular receita esperada
        # Receita esperada = Meta Spend × ROAS esperado
        revenue_expected = meta_spend * roas_esperado
        
        # 4. Calcular delta
        if revenue_expected == 0:
            delta_pct = 0
        else:
            delta_pct = abs(revenue_reported - revenue_expected) / revenue_expected * 100
        
        # 5. Determinar status e confiança
        status = "MUITO_ALINHADO"  # default
        confidence = 1.0
        message = "✅ Faturamento muito alinhado com expectativa"
        
        for status_key, threshold in self.CONFIDENCE_THRESHOLDS.items():
            if delta_pct <= threshold["delta_max"]:
                status = status_key
                confidence = threshold["confidence"]
                break
        
        # Mensagens por status
        message_map = {
            "MUITO_ALINHADO": f"✅ Faturamento alinhado. Delta: {delta_pct:.1f}%",
            "ALINHADO": f"✅ Pequena variação de {delta_pct:.1f}%. Normal.",
            "DIVERGENTE": f"⚠️ Variação de {delta_pct:.1f}%. Sugiro verificar: conversões no pixel, devoluções, ajustes.",
            "MUITO_DIVERGENTE": f"❌ Variação de {delta_pct:.1f}%. Possível erro nos dados ou rastreamento inadequado.",
        }
        message = message_map.get(status, message)
        
        return {
            "is_valid": confidence >= profile.validation_tolerance_pct / 100,  # Se tiver tol padrão
            "confidence": round(confidence, 2),
            "status": status,
            "message": message,
            "details": {
                "delta_pct": round(delta_pct, 1),
                "revenue_expected": round(revenue_expected, 2),
                "revenue_reported": round(revenue_reported, 2),
                "applied_roas": roas_esperado,
                "roas_source": roas_source,
                "meta_spend": round(meta_spend, 2),
                "meta_conversions": meta_conversions,
            }
        }
    
    def validate_with_historical_roas(
        self,
        user_id: str,
        revenue_reported: float,
        month: str,
        meta_spend: float,
        meta_conversions: int,
        months_lookback: int = 3,
    ) -> Dict:
        """
        Valida usando ROAS histórico do usuário em vez de benchmark.
        Mais preciso, mas só funciona se tiver histórico.
        
        Args:
            months_lookback: Quantos meses anterior olhar (default: 3)
        """
        
        eps = 1e-9
        
        # 1. Buscar ROAS histórico
        year_month_prefix = month[:7]
        three_months_ago = (
            datetime.strptime(month, "%Y-%m") - timedelta(days=30*months_lookback)
        ).strftime("%Y-%m")
        
        historical_records = (
            self.db.query(FinancialRecord)
            .filter(
                FinancialRecord.user_id == user_id,
                FinancialRecord.year_month >= three_months_ago,
                FinancialRecord.year_month < month,
                FinancialRecord.roas.isnot(None),
            )
            .order_by(desc(FinancialRecord.year_month))
            .limit(months_lookback)
            .all()
        )
        
        if not historical_records:
            # Fallback para benchmark
            return self.validate_reported_revenue(
                user_id, revenue_reported, month, meta_spend, meta_conversions
            )
        
        # 2. Calcular ROAS médio histórico
        historical_roas_values = [r.roas for r in historical_records if r.roas]
        avg_historical_roas = sum(historical_roas_values) / len(historical_roas_values)
        
        # 3. Validar usando ROAS histórico
        return self.validate_reported_revenue(
            user_id, revenue_reported, month, meta_spend, meta_conversions,
            force_roas=avg_historical_roas
        )
    
    def estimate_revenue_from_meta(
        self,
        user_id: str,
        meta_spend: float,
        meta_conversions: int,
        use_historical: bool = True,
    ) -> Dict:
        """
        Estima qual deveria ser a receita baseada em Meta spend.
        Útil para o usuário validar se seu faturamento reportado faz sentido.
        
        Retorna:
        {
            "estimated_revenue": float,
            "roas_used": float,
            "roas_source": str (benchmark | historical),
            "range": {
                "min": float,
                "max": float,
            },
            "message": str,
        }
        """
        
        profile = self.db.query(BusinessProfile).filter_by(user_id=user_id).first()
        if not profile:
            return {"error": "Perfil não encontrado"}
        
        # Tentar usar ROAS histórico
        if use_historical:
            historical_records = (
                self.db.query(FinancialRecord)
                .filter(
                    FinancialRecord.user_id == user_id,
                    FinancialRecord.roas.isnot(None),
                )
                .order_by(desc(FinancialRecord.year_month))
                .limit(3)
                .all()
            )
            
            if historical_records:
                historical_roas = [r.roas for r in historical_records]
                roas_to_use = sum(historical_roas) / len(historical_roas)
                roas_source = "historical"
            else:
                roas_to_use = self.ROAS_BENCHMARKS.get(
                    profile.funnel_type,
                    self.ROAS_BENCHMARKS["b2c_ecommerce"]
                )["healthy"]
                roas_source = "benchmark"
        else:
            roas_to_use = self.ROAS_BENCHMARKS.get(
                profile.funnel_type,
                self.ROAS_BENCHMARKS["b2c_ecommerce"]
            )["healthy"]
            roas_source = "benchmark"
        
        # Estimar receita
        estimated_revenue = meta_spend * roas_to_use
        
        # Range (usando benchmarks min/max)
        benchmark = self.ROAS_BENCHMARKS.get(
            profile.funnel_type,
            self.ROAS_BENCHMARKS["b2c_ecommerce"]
        )
        range_min = meta_spend * benchmark["range_min"]
        range_max = meta_spend * benchmark["range_max"]
        
        return {
            "estimated_revenue": round(estimated_revenue, 2),
            "roas_used": round(roas_to_use, 2),
            "roas_source": roas_source,
            "range": {
                "min": round(range_min, 2),
                "max": round(range_max, 2),
            },
            "message": (
                f"📊 Baseado em {roas_source}, você deveria ter "
                f"receita entre R${range_min:,.0f} e R${range_max:,.0f}. "
                f"Estimativa central: R${estimated_revenue:,.0f}"
            ),
        }
    
    def calculate_blended_roas(
        self,
        revenue_real: float,
        meta_spend: float,
        meta_roas: Optional[float] = None,
    ) -> Dict:
        """
        Calcula Blended ROAS: comparação entre Meta tracking vs receita real.
        
        Útil para entender:
        - Se o pixel está rastreando tudo
        - Attribution loss
        - Impacto de devoluções/cancelamentos
        """
        
        eps = 1e-9
        
        # ROAS real
        real_roas = revenue_real / (meta_spend + eps)
        
        # Se não tiver meta_roas, usar uma estimativa
        if meta_roas is None:
            meta_roas = real_roas * 0.9  # Assume pixel perde ~10%
        
        # Gap
        gap = real_roas - meta_roas
        gap_pct = (gap / meta_roas * 100) if meta_roas > 0 else 0
        
        # Insight
        if gap_pct > 10:
            insight = (
                f"✅ Receita real está {gap_pct:.1f}% acima do rastreado pelo pixel. "
                f"Possível: conversões não rastreadas, view-through conversions, "
                f"tráfego de sessões antigas."
            )
        elif gap_pct > 0:
            insight = (
                f"✅ Receita real está {gap_pct:.1f}% acima do rastreado. "
                f"Normal: pequena atribuição perdida."
            )
        elif gap_pct > -10:
            insight = (
                f"✅ Alinhado. Diferença de {abs(gap_pct):.1f}%. "
                f"Rastreamento está bom."
            )
        else:
            insight = (
                f"⚠️ Receita real está {abs(gap_pct):.1f}% abaixo do rastreado. "
                f"Possível: devoluções, cancelamentos, ou conversões duplicadas no pixel."
            )
        
        return {
            "real_roas": round(real_roas, 2),
            "meta_roas": round(meta_roas, 2),
            "gap": round(gap, 2),
            "gap_pct": round(gap_pct, 1),
            "insight": insight,
        }
    
    def _error_validation(self, error_msg: str) -> Dict:
        """Helper para retornar erro de validação"""
        return {
            "is_valid": False,
            "confidence": 0.0,
            "status": "ERRO",
            "message": f"❌ Erro: {error_msg}",
            "details": None,
        }


# ────────────────────────────────────────────────────────────
# Extensão para FinancialService
# ────────────────────────────────────────────────────────────

class FinancialService:
    """
    Estenda sua classe FinancialService com esses métodos.
    """
    
    def __init__(self, db_session):
        self.db = db_session
        self.validator = RevenueValidator(db_session)
    
    def save_financial_record_with_validation(
        self,
        user_id: str,
        month: str,
        revenue_reported: float,
        orders: int,
        leads: int = 0,
        meta_performance: Optional[Dict] = None,
    ) -> Dict:
        """
        Salva registro financeiro COM VALIDAÇÃO automática.
        
        Fluxo:
        1. Se meta_performance for informado, valida revenue_reported
        2. Salva em BD com status de validação
        3. Retorna confirmação com insights
        
        Args:
            user_id: ID do usuário
            month: "2025-04"
            revenue_reported: Receita que o usuário reportou
            orders: Número de pedidos
            meta_performance: Dict retornado por MetaAdsEngine.get_performance()
                            Se None, salva sem validação
        
        Returns:
            {
                "success": bool,
                "saved": bool,
                "message": str,
                "validation": Dict (resultado da validação),
                "record": Dict (dados salvos),
            }
        """
        
        from models import FinancialRecord
        
        validation_result = None
        
        # 1. Validar se meta_performance foi passado
        if meta_performance:
            total_conversions = sum(
                c.get("conversions", 0)
                for c in meta_performance.get("campaigns", [])
            )
            meta_spend = meta_performance["summary"]["total_spend"]
            
            validation_result = self.validator.validate_reported_revenue(
                user_id=user_id,
                revenue_reported=revenue_reported,
                month=month,
                meta_spend=meta_spend,
                meta_conversions=total_conversions,
            )
        
        # 2. Salvar registro
        try:
            record = FinancialRecord(
                user_id=user_id,
                year_month=month,
                revenue=revenue_reported,
                orders=orders,
                leads=leads,
                
                # Salvar validação
                validation_status=validation_result["status"] if validation_result else None,
                validation_confidence=validation_result["confidence"] if validation_result else None,
                validation_delta_pct=validation_result["details"]["delta_pct"] if validation_result else None,
                validation_message=validation_result["message"] if validation_result else None,
                validation_expected_revenue=validation_result["details"]["revenue_expected"] if validation_result else None,
                validation_applied_roas=validation_result["details"]["applied_roas"] if validation_result else None,
                
                source="manual"
            )
            
            self.db.add(record)
            self.db.commit()
            
            return {
                "success": True,
                "saved": True,
                "message": validation_result["message"] if validation_result else f"✅ Registrado para {month}",
                "validation": validation_result,
                "record": {
                    "month": month,
                    "revenue": revenue_reported,
                    "orders": orders,
                    "leads": leads,
                }
            }
        
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "saved": False,
                "message": f"❌ Erro ao salvar: {str(e)}",
                "validation": validation_result,
                "record": None,
                "error": str(e),
            }
    
    def get_validation_estimate(
        self,
        user_id: str,
        month: str,
    ) -> Dict:
        """
        Retorna uma estimativa de qual deveria ser a receita.
        Útil para o usuário comparar antes de reportar.
        
        Chamado assim:
        GET /api/v1/finance/estimate?user_id=xxx&month=2025-04
        
        Resposta:
        {
            "estimated_revenue": 125000.00,
            "roas_used": 2.5,
            "range": {"min": 100000, "max": 150000},
            "message": "Você deveria ter..."
        }
        """
        
        # Tentar buscar Meta performance do mês
        # (você precisa implementar essa busca conforme sua arquitetura)
        # Por simplicidade, retornamos None e usamos valor anterior
        
        profile = self.db.query(BusinessProfile).filter_by(user_id=user_id).first()
        if not profile:
            return {"error": "Perfil não encontrado"}
        
        # Buscar último record com dados completos
        last_record = (
            self.db.query(FinancialRecord)
            .filter_by(user_id=user_id)
            .order_by(desc(FinancialRecord.year_month))
            .first()
        )
        
        if not last_record or not last_record.investment:
            return {
                "error": "Sem dados históricos. Registre um mês primeiro.",
                "message": "Não consigo estimar sem histórico."
            }
        
        # Usar estimativa do último mês
        estimate = self.validator.estimate_revenue_from_meta(
            user_id=user_id,
            meta_spend=last_record.investment,
            meta_conversions=last_record.orders or 1,
            use_historical=True,
        )
        
        return estimate


# ────────────────────────────────────────────────────────────
# Testes (pytest)
# ────────────────────────────────────────────────────────────

def test_revenue_validation():
    """
    pytest tests/test_financial_validation.py
    """
    from database import SessionLocal
    
    db = SessionLocal()
    
    # 1. Criar profile
    profile = BusinessProfile(
        user_id="test_user_123",
        funnel_type="b2c_ecommerce",
        cogs_pct=0.35,
        fixed_costs=5000.0,
    )
    db.add(profile)
    db.commit()
    
    # 2. Validar receita alinhada
    validator = RevenueValidator(db)
    
    result = validator.validate_reported_revenue(
        user_id="test_user_123",
        revenue_reported=2500.00,  # Alinhado (2500 spend × 1.0 = esperava 2500)
        month="2025-04",
        meta_spend=1000.00,
        meta_conversions=50,
        force_roas=2.5,  # 1000 × 2.5 = 2500 esperado
    )
    
    assert result["status"] == "MUITO_ALINHADO"
    assert result["confidence"] == 1.0
    
    # 3. Validar receita divergente
    result2 = validator.validate_reported_revenue(
        user_id="test_user_123",
        revenue_reported=2000.00,  # Abaixo do esperado
        month="2025-04",
        meta_spend=1000.00,
        meta_conversions=50,
        force_roas=2.5,
    )
    
    assert result2["status"] in ["ALINHADO", "DIVERGENTE"]
    assert result2["details"]["delta_pct"] == 20.0  # |2000 - 2500| / 2500
    
    print("✅ Testes passaram!")


if __name__ == "__main__":
    # Para rodar diretamente:
    # python financial_service_extended.py
    test_revenue_validation()

# 📦 financial_models_extended.py
# 
# Use isso para estender seu models.py existente.
# As tabelas/campos que já existem, você ignora.
# Os campos com ✨ NOVO são os que adicionar.
#
# Instruções:
# 1. Copie os campos NOVOS para sua classe FinancialRecord
# 2. Rode: alembic revision --autogenerate -m "Add validation and diagnostic fields"
# 3. Rode: alembic upgrade head

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class BusinessProfile(Base):
    """Perfil de negócio do usuário (já deve existir)"""
    __tablename__ = "business_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), unique=True, index=True)
    
    # Configurações básicas (provavelmente já existem)
    funnel_type = Column(String(50), default="b2c_ecommerce")
    cogs_pct = Column(Float, default=0.35)
    fixed_costs = Column(Float, default=5000.0)
    
    # ✨ NOVO: Meta credentials (opcional)
    meta_app_id = Column(String(255), nullable=True)
    meta_access_token = Column(String(1000), nullable=True)  # Criptografar em produção!
    meta_ad_account_id = Column(String(255), nullable=True)
    
    # ✨ NOVO: Validação padrão
    auto_validate_revenue = Column(Boolean, default=True)  # Validar automaticamente?
    validation_tolerance_pct = Column(Float, default=15.0)  # Tolerância % padrão
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relacionamento
    financial_records = relationship("FinancialRecord", backref="profile")


class FinancialRecord(Base):
    """
    Histórico financeiro mensal.
    
    IMPORTANTE: Se você já tem essa tabela, use uma migration do Alembic
    para adicionar os novos campos, não recriar a tabela.
    """
    __tablename__ = "financial_records"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), ForeignKey("business_profiles.user_id"), index=True)
    
    # ─── Período ───
    year_month = Column(String(7), index=True)  # "2025-04"
    
    # ─── Dados Brutos (de Meta ou entrada manual) ───
    investment = Column(Float, nullable=True)
    clicks = Column(Integer, nullable=True)
    impressions = Column(Integer, nullable=True)
    sessions = Column(Integer, nullable=True)
    orders = Column(Integer, nullable=True)
    revenue = Column(Float, nullable=True)
    leads = Column(Integer, default=0)
    mqls = Column(Integer, default=0)
    sqls = Column(Integer, default=0)
    
    # ─── ✨ NOVO: Validação de Faturamento ───
    # Quando você registra receita manualmente, o sistema valida
    validation_status = Column(String(50), nullable=True)
    # Valores possíveis:
    #   "MUITO_ALINHADO"    (delta <= 5%)
    #   "ALINHADO"          (5% < delta <= 15%)
    #   "DIVERGENTE"        (15% < delta <= 25%)
    #   "MUITO_DIVERGENTE"  (delta > 25%)
    #   "SEM_VALIDACAO"     (não havia Meta data para comparar)
    
    validation_confidence = Column(Float, nullable=True)
    # Score de confiança: 0.0 a 1.0
    # Exemplo: 0.85 significa 85% confiança que o dado está correto
    
    validation_delta_pct = Column(Float, nullable=True)
    # Diferença percentual entre receita reportada e expectativa do Meta
    # Positivo = reportado acima do esperado
    # Negativo = reportado abaixo do esperado
    
    validation_message = Column(String(500), nullable=True)
    # Mensagem legível: "✅ Alinhado" ou "⚠️ Verificar discrepância"
    
    validation_expected_revenue = Column(Float, nullable=True)
    # Qual era a receita esperada baseada no Meta spend
    
    validation_applied_roas = Column(Float, nullable=True)
    # ROAS usado no cálculo da validação (ROAS padrão do funil)
    
    # ─── ✨ NOVO: Diagnóstico Persistido ───
    # O finance_engine calcula diagnóstico (alertas, health score)
    # Agora a gente salva isso também
    
    health_score = Column(Integer, nullable=True)
    # Score geral de saúde: 0-100
    # Calculado pelo finance_engine._diagnose()
    
    status_geral = Column(String(50), nullable=True)
    # "SAUDAVEL" / "ESTABILIZANDO" / "CRITICO"
    
    principais_alertas = Column(JSON, nullable=True)
    # Lista de alertas do diagnóstico
    # Exemplo:
    # [
    #   {
    #     "nivel": "CRITICO",
    #     "camada": "criativo_anuncio",
    #     "metrica": "CTR",
    #     "valor": "0.25%",
    #     "benchmark": "1.5%",
    #     "mensagem": "CTR crítico. Revise copy e imagem."
    #   },
    #   ...
    # ]
    
    # ─── ✨ NOVO: Métricas Calculadas (Cache) ───
    # O finance_engine calcula essas métricas. A gente persiste como cache
    # para o dashboard não precisar recalcular sempre.
    
    ebitda = Column(Float, nullable=True)
    ebitda_pct = Column(Float, nullable=True)
    roas = Column(Float, nullable=True)
    ltv_cac = Column(Float, nullable=True)
    roi_pct = Column(Float, nullable=True)
    
    # ─── ✨ NOVO: Blended ROAS ───
    # Comparação entre o que o pixel do Meta rastreia vs receita real
    
    meta_roas = Column(Float, nullable=True)
    # ROAS calculado a partir do "purchase" value do pixel do Meta
    # Isso é: (purchase_value_from_meta) / spend
    
    real_roas = Column(Float, nullable=True)
    # ROAS baseado em receita real reportada
    # Isso é: revenue_reported / investment
    
    blended_gap_pct = Column(Float, nullable=True)
    # Diferença % entre real_roas e meta_roas
    # Positivo = receita real acima do rastreado
    # Negativo = receita real abaixo do rastreado (attribution loss)
    
    blended_insight = Column(String(500), nullable=True)
    # Insight legível: "Pixel está subtraindo..." ou "Dados alinhados"
    
    # ─── ✨ NOVO: Trending ───
    # Comparação com período anterior para mostrar tendências
    
    growth_vs_previous_pct = Column(Float, nullable=True)
    # Crescimento de receita vs mês anterior (em %)
    # Exemplo: 15.5 significa +15.5% vs mês anterior
    
    ebitda_trend = Column(String(20), nullable=True)
    # "UP" (cresceu) / "DOWN" (caiu) / "FLAT" (manteve) vs mês anterior
    
    growth_trend = Column(String(20), nullable=True)
    # "ACCELERATING" / "STEADY" / "DECLINING" (comparando últimos 3 meses)
    
    previous_month_revenue = Column(Float, nullable=True)
    # Armazenar para facilitar cálculo de tendências
    
    previous_month_ebitda = Column(Float, nullable=True)
    # Armazenar para facilitar cálculo de tendências
    
    # ─── Meta ───
    calculated_at = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50), default="api")  # "api", "manual", ou "blended"
    
    # Índices para queries rápidas
    __table_args__ = (
        # Buscar últimos meses de um usuário
        # SELECT * FROM financial_records WHERE user_id = ? ORDER BY year_month DESC
        # Índice duplo para query comum
        # (não precisa de índice separado, ForeignKey já cria índice em user_id)
    )

# ─────────────────────────────────────────────────────────
# Script de Migração (Alembic)
# 
# Se você já tem tabela financialrecord_old, use:
#
# 1. Crie um arquivo: alembic/versions/XXXXX_add_validation_fields.py
#
# 2. Cole o conteúdo abaixo (adapte as operações conforme sua BD atual):
#
# from alembic import op
# import sqlalchemy as sa
#
# def upgrade():
#     # Adicionar coluna a coluna (mais seguro que recriar tabela)
#     op.add_column('financial_records', sa.Column('validation_status', sa.String(50), nullable=True))
#     op.add_column('financial_records', sa.Column('validation_confidence', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('validation_delta_pct', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('validation_message', sa.String(500), nullable=True))
#     op.add_column('financial_records', sa.Column('validation_expected_revenue', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('validation_applied_roas', sa.Float(), nullable=True))
#     
#     op.add_column('financial_records', sa.Column('health_score', sa.Integer(), nullable=True))
#     op.add_column('financial_records', sa.Column('status_geral', sa.String(50), nullable=True))
#     op.add_column('financial_records', sa.Column('principais_alertas', sa.JSON(), nullable=True))
#     
#     op.add_column('financial_records', sa.Column('ebitda', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('ebitda_pct', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('roas', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('ltv_cac', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('roi_pct', sa.Float(), nullable=True))
#     
#     op.add_column('financial_records', sa.Column('meta_roas', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('real_roas', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('blended_gap_pct', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('blended_insight', sa.String(500), nullable=True))
#     
#     op.add_column('financial_records', sa.Column('growth_vs_previous_pct', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('ebitda_trend', sa.String(20), nullable=True))
#     op.add_column('financial_records', sa.Column('growth_trend', sa.String(20), nullable=True))
#     op.add_column('financial_records', sa.Column('previous_month_revenue', sa.Float(), nullable=True))
#     op.add_column('financial_records', sa.Column('previous_month_ebitda', sa.Float(), nullable=True))
#
# def downgrade():
#     op.drop_column('financial_records', 'previous_month_ebitda')
#     op.drop_column('financial_records', 'previous_month_revenue')
#     op.drop_column('financial_records', 'growth_trend')
#     op.drop_column('financial_records', 'ebitda_trend')
#     op.drop_column('financial_records', 'growth_vs_previous_pct')
#     op.drop_column('financial_records', 'blended_insight')
#     op.drop_column('financial_records', 'blended_gap_pct')
#     op.drop_column('financial_records', 'real_roas')
#     op.drop_column('financial_records', 'meta_roas')
#     op.drop_column('financial_records', 'roi_pct')
#     op.drop_column('financial_records', 'ltv_cac')
#     op.drop_column('financial_records', 'roas')
#     op.drop_column('financial_records', 'ebitda_pct')
#     op.drop_column('financial_records', 'ebitda')
#     op.drop_column('financial_records', 'principais_alertas')
#     op.drop_column('financial_records', 'status_geral')
#     op.drop_column('financial_records', 'health_score')
#     op.drop_column('financial_records', 'validation_applied_roas')
#     op.drop_column('financial_records', 'validation_expected_revenue')
#     op.drop_column('financial_records', 'validation_message')
#     op.drop_column('financial_records', 'validation_delta_pct')
#     op.drop_column('financial_records', 'validation_confidence')
#     op.drop_column('financial_records', 'validation_status')
#
# 3. Execute:
#    alembic upgrade head
#
# 4. Pronto! Tabela foi estendida sem perder dados.


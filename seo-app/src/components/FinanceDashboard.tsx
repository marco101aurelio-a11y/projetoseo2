/**
 * FinanceDashboard.tsx — Dashboard de DRE e Saúde Financeira (Capvi OS)
 * 
 * Exibe o DRE completo, KPIs financeiros (EBITDA, ROI, Margem) 
 * e a Engenharia Reversa (metas de EBITDA).
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  Target, 
  Zap, 
  BarChart3, 
  PieChart, 
  Calculator,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { analyzeMetaAds, type EngineResult } from '../services/metaService';
import { loadBusinessData } from '../services/financeService';

interface FinanceDashboardProps {
  projectId: string;
}

export function FinanceDashboard({ projectId }: FinanceDashboardProps) {
  const [data, setData] = useState<EngineResult['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebitdaMode, setEbitdaMode] = useState(false);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bizData = loadBusinessData(projectId);
      
      const res = await analyzeMetaAds({
        ad_account_id: 'demo_account',
        use_mock: true, // Para desenvolvimento
        funnel_type: bizData?.funnelType || 'b2c_ecommerce',
        cogs_pct: bizData?.cogsPct || 0.3,
        fixed_costs: bizData?.fixedCosts || 3000,
        tax_rate: bizData?.taxRate,
        shipping_rate: bizData?.shippingRate,
        marketplace_fee: bizData?.marketplaceFee
      });

      if (!res.success) throw new Error(res.error || 'Erro na análise financeira');
      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem]">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <h3 className="font-display font-black text-xl">Processando Motor Financeiro...</h3>
        <p className="text-white/50 text-sm mt-2">Calculando DRE e Diagnósticos JAX</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="font-display font-black text-xl text-red-400">Erro no Processamento</h3>
        <p className="text-white/50 text-sm mt-2">{error}</p>
        <button onClick={fetchFinancialData} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-colors text-white">
          Recarregar Motor
        </button>
      </div>
    );
  }

  const { dre, metricas_primarias, metricas_secundarias, engenharia_reversa, diagnostico } = data;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0f] border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 z-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display font-black text-2xl text-white">DRE Estratégico</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`}>
                SCORE: {diagnostico.health_score}
              </span>
            </div>
          </div>
          <p className="text-white/50 text-sm">Visão consolidada de Negócio + Tráfego Pago</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setEbitdaMode(!ebitdaMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-xl ${
              ebitdaMode ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <Target className="w-4 h-4" />
            Engenharia Reversa
          </button>
          <button onClick={fetchFinancialData} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-white/70">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 z-10">
        
        {!ebitdaMode ? (
          /* ── MODO DRE ── */
          <div className="animate-in fade-in duration-500">
            {/* Top KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Receita Bruta', value: formatCurrency(dre.receita_bruta), icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'EBITDA (Lucro)', value: formatCurrency(dre.ebitda), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Margem EBITDA', value: `${(dre.ebitda_pct * 100).toFixed(1)}%`, icon: PieChart, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'LTV/CAC', value: `${metricas_secundarias.ltv_cac_ratio.toFixed(2)}x`, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col hover:bg-white/[0.07] transition-colors shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-white/50">{kpi.label}</span>
                  </div>
                  <span className="font-display font-black text-2xl text-white">{kpi.value}</span>
                </div>
              ))}
            </div>

            {/* DRE Detail Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden mb-8">
              <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Demonstrativo de Resultados (Simulado)</h3>
              </div>
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex justify-between items-center py-2 text-lg font-black text-white border-b border-white/10 pb-4">
                  <span>(+) RECEITA TOTAL</span>
                  <span className="text-emerald-400">{formatCurrency(dre.receita_bruta)}</span>
                </div>
                
                <div className="space-y-3 py-4 border-b border-white/5">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>(-) Custo do Produto (COGS)</span>
                    <span className="text-red-400">({formatCurrency(dre.custos_variaveis.cogs_produto)})</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>(-) Impostos</span>
                    <span className="text-red-400">({formatCurrency(dre.custos_variaveis.impostos)})</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>(-) Frete / Logística</span>
                    <span className="text-red-400">({formatCurrency(dre.custos_variaveis.frete)})</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>(-) Comissões Marketplace</span>
                    <span className="text-red-400">({formatCurrency(dre.custos_variaveis.comissao_marketplace)})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 text-md font-bold text-white/90 border-b border-white/10 pb-4">
                  <span>(=) MARGEM DE CONTRIBUIÇÃO BRUTA</span>
                  <span>{formatCurrency(dre.margem_contribuicao + dre.investimento_ads)}</span>
                </div>

                <div className="flex justify-between items-center py-4 border-b border-white/5 text-sm text-indigo-400 font-bold">
                  <span>(-) Investimento Meta Ads (Tráfego)</span>
                  <span>({formatCurrency(dre.investimento_ads)})</span>
                </div>

                <div className="flex justify-between items-center py-2 text-md font-bold text-white/90 border-b border-white/10 pb-4">
                  <span>(=) MARGEM DE CONTRIBUIÇÃO LÍQUIDA (MCL)</span>
                  <span className={dre.margem_contribuicao > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatCurrency(dre.margem_contribuicao)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-4 border-b border-white/5 text-sm text-white/70">
                  <span>(-) Custos Fixos Onerosos</span>
                  <span className="text-red-400">({formatCurrency(dre.custos_fixos)})</span>
                </div>

                <div className="flex justify-between items-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mt-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest font-black text-emerald-400/70 mb-1">Resultado Final</span>
                    <span className="text-2xl font-display font-black text-emerald-400">EBITDA: {formatCurrency(dre.ebitda)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-widest font-black text-emerald-400/70 mb-1">Margem Líquida</span>
                    <span className="text-2xl font-display font-black text-emerald-400">{(dre.ebitda_pct * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── MODO ENGENHARIA REVERSA ── */
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-[2rem] p-8 mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Zap className="w-32 h-32 text-indigo-400" />
               </div>
               <div className="relative z-10">
                 <h3 className="font-display font-black text-3xl text-white mb-4">Engenharia Reversa JAX</h3>
                 <p className="text-white/60 mb-8 max-w-xl text-lg">
                   Calculamos matematicamente quanto você precisa escalar seu tráfego para atingir <span className="text-indigo-400 font-black">15% de Margem EBITDA</span>, mantendo seus benchmarks atuais.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                      <span className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Investimento Necessário</span>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-display font-black text-white">{formatCurrency(engenharia_reversa.investimento_necessario)}</span>
                        <span className="text-xs text-white/40 mb-2 font-bold">(p/ mês)</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/50">
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: '40%' }} />
                        </div>
                        <span>Scale: 2.4x</span>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                      <span className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Faturamento Alvo</span>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-display font-black text-white">{formatCurrency(engenharia_reversa.receita_necessaria)}</span>
                        <span className="text-xs text-white/40 mb-2 font-bold">(Target)</span>
                      </div>
                      <p className="mt-4 text-xs font-medium text-white/40 leading-relaxed">
                        Baseado em um ROAS de <strong>{metricas_primarias.roas}x</strong> e TIcket Médio de <strong>{formatCurrency(metricas_primarias.ticket_medio)}</strong>.
                      </p>
                    </div>
                 </div>

                 <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">Gap de Escala</span>
                        <span className="text-white/40 text-xs">O que falta para o próximo nível</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-display font-black text-rose-400">+{formatCurrency(engenharia_reversa.gap_atual)}</span>
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Aumentar Aporte Ads</span>
                    </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-black text-white/40 uppercase mb-2">Ponto de Equilíbrio</span>
                <span className="text-lg font-black text-white">{formatCurrency(engenharia_reversa.breakeven_revenue)}</span>
                <p className="text-[10px] text-white/30 mt-1">Faturamento mínimo p/ cobrir custos</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <span className="block text-[10px] font-black text-white/40 uppercase mb-2">Ads Breakeven</span>
                <span className="text-lg font-black text-white">{formatCurrency(engenharia_reversa.breakeven_investment)}</span>
                <p className="text-[10px] text-white/30 mt-1">Investimento p/ margem zero</p>
              </div>
              <div className="p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 transition-all">
                <div className="text-center">
                  <span className="block text-[10px] font-black text-indigo-400 uppercase mb-1">Simular Novo Modelo</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

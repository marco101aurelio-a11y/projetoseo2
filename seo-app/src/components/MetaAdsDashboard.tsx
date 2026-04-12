import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  MousePointerClick, 
  ShoppingCart,
  Zap,
  Activity,
  ArrowRight,
  Target,
  Eye
} from 'lucide-react';

interface MetaAdsDashboardProps {
  onOpenFinance: () => void;
  adAccountId: string;
  accessToken: string;
}

const OBJECTIVE_MAP: Record<string, string> = {
  'OUTCOME': 'Vendas/Conversão',
  'OUTCOME_SALES': 'Vendas/Conversão',
  'CONVERSIONS': 'Conversão',
  'ENGAGEMENT': 'Engajamento',
  'OUTCOME_ENGAGEMENT': 'Engajamento',
  'POST_ENGAGEMENT': 'Engajamento Post',
  'MESSAGES': 'WhatsApp/Mensagens',
  'TRAFFIC': 'Tráfego Site',
  'OUTCOME_TRAFFIC': 'Tráfego Site',
  'LINK_CLICKS': 'Tráfego (Cliques)',
  'BRAND_AWARENESS': 'Reconhecimento',
  'OUTCOME_AWARENESS': 'Reconhecimento',
  'REACH': 'Alcance',
  'LEAD_GENERATION': 'Geração de Leads',
  'OUTCOME_LEADS': 'Geração de Leads',
  'VIDEO_VIEWS': 'Video Views',
  'APP_INSTALLS': 'App Installs',
  'OUTCOME_APP_INSTALLS': 'App Installs'
};

export function MetaAdsDashboard({ onOpenFinance, adAccountId, accessToken }: MetaAdsDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isDemo = adAccountId === 'demo_account' || !accessToken;
      
      const res = await fetch('http://localhost:8000/finance/analyze/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_account_id: adAccountId || 'demo_account',
          access_token: accessToken || '',
          use_mock: isDemo,
          funnel_type: 'b2c_ecommerce'
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do Meta Ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [adAccountId, accessToken]);

  // --- HOOKS & DESTRUCTURING (Must be before any conditional returns) ---
  const { 
    metricas_primarias = { roas: 0, cac: 0, ctr: 0 }, 
    resumo_meta = { roas_geral: 0, cac_geral: 0, investimento_total: 0, receita_total: 0, ctr_geral: 0, cpc_geral: 0, cpm_geral: 0 }, 
    campanhas_meta = [], 
    diagnostico = { health_score: 0, status_geral: 'DESCONHECIDO', alertas: [] } 
  } = data || {};
  
  const isHealthy = diagnostico?.status_geral === 'SAUDAVEL';
  const isCritical = diagnostico?.status_geral === 'CRITICO';

  // Engine de Agrupamento Dinâmico (Híbrido)
  const getCampCategory = (camp: any) => {
    if (!camp || !camp.nome) return 'Outros';
    
    // 1. Tenta pegar a Tag entre colchetes [Algo] (Pode estar em qualquer lugar do nome)
    const match = camp.nome.match(/\[(.*?)\]/);
    if (match) return match[1].trim();
    
    // 2. Fallback para o Objetivo Real da API (Com tradução)
    const apiObjective = camp.objetivo_meta || 'OUTROS';
    return OBJECTIVE_MAP[apiObjective] || 'Outros';
  };

  const objectivesCount = useMemo(() => {
    if (!Array.isArray(campanhas_meta)) return [['Todas', 0]];
    const counts: Record<string, number> = { 'Todas': campanhas_meta.length };
    
    campanhas_meta.forEach((camp: any) => {
      const category = getCampCategory(camp);
      counts[category] = (counts[category] || 0) + 1;
    });
    
    return Object.entries(counts).sort((a, b) => a[0] === 'Todas' ? -1 : b[0] === 'Todas' ? 1 : (b[1] as number) - (a[1] as number));
  }, [campanhas_meta]);

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campanhas_meta)) return [];
    if (!selectedObjective || selectedObjective === 'Todas') return campanhas_meta;
    
    return campanhas_meta.filter((camp: any) => getCampCategory(camp) === selectedObjective);
  }, [campanhas_meta, selectedObjective]);
  // -------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem]">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <h3 className="font-display font-black text-xl">Sincronizando Meta Ads...</h3>
        <p className="text-white/50 text-sm mt-2">Aplicando modelos JAX no tráfego bruto</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="font-display font-black text-xl text-red-400">Falha na Sincronização</h3>
        <p className="text-white/50 text-sm mt-2">{error}</p>
        <button onClick={fetchDashboardData} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-colors">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0f] border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Modo Demo Banner */}
      {data?.meta?.is_demo && (
        <div className="bg-blue-600/20 border-b border-blue-500/30 px-6 py-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
              Modo de Simulação Ativo (JAX Engine)
            </span>
          </div>
          <span className="text-[9px] text-blue-300/60 font-medium">As métricas abaixo são geradas a partir de padrões reais de mercado.</span>
        </div>
      )}

      {/* Fallback Banner */}
      {data?.meta?.fallback_active && (
        <div className="bg-red-600/20 border-b border-red-500/30 px-6 py-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-300">
              Erro na Conexão Real — Fallback para Simulação
            </span>
          </div>
          <span className="text-[9px] text-red-300/60 font-medium">Verifique seu Token e ID no arquivo .env</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 z-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display font-black text-2xl text-white">Meta Ads Engine</h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
              isHealthy ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {diagnostico?.health_score || 0} Score • {diagnostico?.status_geral || 'N/A'}
            </span>
          </div>
          <p className="text-white/50 text-sm">
            Conta: <strong>{data?.meta?.is_demo ? 'Modo Demonstração' : `Act_${data?.meta?.ad_account_id || adAccountId}`}</strong> 
            {!data?.meta?.is_demo && <span className="ml-2 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded border border-blue-500/20">Conectada Real</span>}
            • Histórico Completo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenFinance} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold text-sm transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <DollarSign className="w-4 h-4" />
            Ver DRE Financeiro
          </button>
          <button onClick={fetchDashboardData} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-white/70">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 z-10">
        
        {/* KPI Row (Negócios) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'ROAS Global', value: `${resumo_meta?.roas_geral || 0}x`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'CAC Total', value: `R$ ${(resumo_meta?.cac_geral || 0).toFixed(2)}`, icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Gasto Total', value: `R$ ${(resumo_meta?.investimento_total || 0).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Receita', value: `R$ ${(resumo_meta?.receita_total || 0).toLocaleString('pt-BR')}`, icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col hover:bg-white/[0.07] transition-colors shadow-lg">
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

        {/* KPI Row (Tráfego Raiz) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'CTR Médio (Cliques)', value: `${resumo_meta?.ctr_geral || 0}%`, icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'CPC Médio (Custo/Clique)', value: `R$ ${Number(resumo_meta?.cpc_geral || 0).toFixed(2)}`, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'CPM Médio (Custo/Mil)', value: `R$ ${Number(resumo_meta?.cpm_geral || 0).toFixed(2)}`, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white/50">{kpi.label}</span>
              </div>
              <span className="font-display font-black text-xl text-white">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* Diagnóstico Alert */}
        {diagnostico?.alertas && (diagnostico.alertas as any[]).length > 0 ? (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                 <AlertCircle className="w-5 h-5 text-red-500" />
               </div>
               <div>
                 <h4 className="font-bold text-red-400 text-lg mb-1">Gargalo Detectado: {diagnostico.alertas?.[0]?.camada}</h4>
                 <p className="text-white/80 text-sm leading-relaxed mb-3">{diagnostico.alertas?.[0]?.mensagem}</p>
                 <div className="flex gap-4 text-xs font-bold">
                    <span className="bg-black/30 px-3 py-1.5 rounded-md text-white/60">Atual: <span className="text-red-400">{diagnostico.alertas?.[0]?.valor}</span></span>
                    <span className="bg-black/30 px-3 py-1.5 rounded-md text-white/60">Benchmark GT: <span className="text-green-400">{diagnostico.alertas?.[0]?.benchmark}</span></span>
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
               <Zap className="w-5 h-5 text-emerald-400" />
             </div>
             <div>
               <h4 className="font-bold text-emerald-400 text-lg">Funil Otimizado</h4>
               <p className="text-white/80 text-sm">As campanhas estão saudáveis e operando acima dos benchmarks do mercado.</p>
             </div>
          </div>
        )}

        {/* Flashcards Filter Segmentação de Campanhas */}
        <div className="mb-6 flex gap-2 overflow-x-auto custom-scrollbar pb-3 pt-1">
          {objectivesCount.map(([objective, count]) => (
            <button
              key={objective}
              onClick={() => setSelectedObjective(objective)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-[12px] text-sm font-bold transition-all border ${
                (selectedObjective === objective) || (!selectedObjective && objective === 'Todas')
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transform scale-105'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
              }`}
            >
              {objective === 'Outros' ? 'Sem Tag' : objective} <span className="opacity-50 ml-1">({count})</span>
            </button>
          ))}
        </div>

        {/* Campanhas Table */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-lg text-white">Overview de Campanhas do Objetivo</h3>
            <span className="text-xs font-black text-white/40 uppercase tracking-wider">{filteredCampaigns.length} FILTRADAS</span>
          </div>
          <div className="w-full overflow-x-auto border border-white/5 rounded-2xl bg-black/20">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-white/40 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Campanha</th>
                  <th className="px-6 py-4">Gasto (R$)</th>
                  <th className="px-6 py-4">Receita (R$)</th>
                  <th className="px-6 py-4">ROAS</th>
                  <th className="px-6 py-4">CTR</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCampaigns.map((camp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 font-medium text-white/90">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${(camp?.roas || 0) > 3 ? 'bg-emerald-400' : (camp?.roas || 0) > 1.5 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                        <div className="flex flex-col">
                          <span className="text-white/90">{camp?.nome || 'Sem Nome'}</span>
                          <span className="text-[10px] text-white/30 uppercase tracking-tighter font-black">
                            {OBJECTIVE_MAP[camp?.objetivo_meta] || camp?.objetivo_meta || 'Objetivo N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-white/60">{Number(camp?.investimento || 0).toFixed(2)}</td>
                    <td className="px-6 py-5 font-mono text-white/80 font-bold">{Number(camp?.receita || 0).toFixed(2)}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-md font-black text-xs ${camp.roas > 3 ? 'bg-emerald-500/20 text-emerald-400' : camp.roas > 1.5 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {camp.roas}x
                      </span>
                    </td>
                    <td className="px-6 py-5 font-mono text-white/60">{camp.ctr}%</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white/80">{camp.pedidos}</span>
                        <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md transition-all ml-auto">
                           <ArrowRight className="w-3 h-3 text-white/50" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

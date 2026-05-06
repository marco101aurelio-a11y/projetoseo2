import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Target, TrendingUp, Cpu, Activity, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

export interface DiagnosticResult {
  marketing: {
    score: number;
    plan: string[];
    benchmarkData: any[];
  };
  sales: {
    score: number;
    plan: string[];
    comparisonData: any[];
  };
  tech: {
    score: number;
    plan: string[];
  };
  indicators: {
    funnel: any[];
  };
}

// Exemplos de cores para os gráficos
const COLORS = ['#818cf8', '#a78bfa', '#34d399', '#f472b6'];

interface DiagnosticDashboardProps {
  data: DiagnosticResult | null;
  onFinish: () => void;
}

export function DiagnosticDashboard({ data, onFinish }: DiagnosticDashboardProps) {
  // Dados de mock caso nada venha da IA ainda
  const defaultMarketing = data?.marketing || {
    score: 4.2,
    plan: [
      "Formalizar um calendário editorial trimestral alinhado às três personas.",
      "Criar iscas digitais para captação de leads de alta intenção.",
      "Destinar 30% do budget de mídia a campanhas de geração de leads."
    ],
    benchmarkData: [
      { subject: 'CAC', A: 120, B: 110, fullMark: 150 },
      { subject: 'LTV', A: 98, B: 130, fullMark: 150 },
      { subject: 'Conversão', A: 86, B: 130, fullMark: 150 },
      { subject: 'Tráfego', A: 99, B: 100, fullMark: 150 },
      { subject: 'Engajamento', A: 85, B: 90, fullMark: 150 },
    ]
  };

  const defaultSales = data?.sales || {
    score: 3.5,
    plan: [
      "Integrar WhatsApp via Zapier para entrada automática.",
      "Configurar lead scoring (pontuação) simples no CRM.",
      "Criar playbook de vendas para o Closer atual."
    ],
    comparisonData: [
      { name: 'Jan', equipe: 4000, automacao: 2400 },
      { name: 'Fev', equipe: 3000, automacao: 1398 },
      { name: 'Mar', equipe: 2000, automacao: 9800 },
      { name: 'Abr', equipe: 2780, automacao: 3908 },
      { name: 'Mai', equipe: 1890, automacao: 4800 },
      { name: 'Jun', equipe: 2390, automacao: 3800 },
    ]
  };

  const defaultTech = data?.tech || {
    score: 2.8,
    plan: [
      "Mapear fluxo de dados (lead -> CRM) em Miro para encontrar falhas.",
      "Implementar Google Tag Manager e GA4 no site e landpages.",
      "Criar base de tutoriais no Notion para escalar adoção pelo time."
    ]
  };

  const defaultIndicators = data?.indicators || {
    funnel: [
      { name: 'Visitantes', value: 12000 },
      { name: 'Leads', value: 3000 },
      { name: 'Oportunidades', value: 800 },
      { name: 'Vendas', value: 125 },
    ]
  };

  const ScoreBadge = ({ score }: { score: number }) => {
    let color = 'bg-red-500/20 text-red-400 border-red-500/30';
    if (score >= 3) color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (score >= 4) color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

    return (
      <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-display shadow-lg ${color}`}>
        <span className="text-2xl font-black">{score.toFixed(1)}</span>
        <span className="text-[8px] uppercase font-bold opacity-70">Score</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
      
      {/* Header */}
      <div className="flex items-start justify-between">
         <div className="max-w-2xl">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 block">Decisão Estratégica</span>
           <h2 className="text-4xl lg:text-5xl font-display font-black text-white mb-6 leading-tight">
             Seu Raio-X <span className="opacity-50">Corporativo</span>
           </h2>
           <p className="text-white/60 font-medium text-lg">
             O Squad Capvi analisou suas fundações. Abaixo estão os planos de ação desenhados para injetar performance no seu modelo atual, elevando as métricas com Inteligência Artificial.
           </p>
         </div>
         <button 
           onClick={onFinish}
           className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full px-8 py-4 font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105"
         >
           Ir para a Plataforma <ArrowRight className="w-4 h-4" />
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Painel Marketing */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-1000" />
           
           <div className="flex items-center gap-6 mb-8 relative z-10">
              <ScoreBadge score={defaultMarketing.score} />
              <div>
                <h3 className="text-2xl font-display font-black text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-indigo-400" /> Marketing Growth
                </h3>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Diagnóstico e Benchmark</p>
              </div>
           </div>

           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
             <div className="flex flex-col gap-4">
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Plano de Ação Sugerido</h4>
                {defaultMarketing.plan.map((item, i) => (
                   <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                     <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                     <p className="text-sm font-medium text-white/80 leading-relaxed">{item}</p>
                   </div>
                ))}
             </div>
             <div className="h-full min-h-[220px]">
               <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 pb-2 mb-4 text-right">Comparativo de Mercado</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={defaultMarketing.benchmarkData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar name="Seu Negócio" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                    <Radar name="Benchmark" dataKey="B" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </RadarChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* Painel Vendas */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-1000" />
           
           <div className="flex items-center gap-6 mb-8 relative z-10">
              <ScoreBadge score={defaultSales.score} />
              <div>
                <h3 className="text-2xl font-display font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" /> Motor de Vendas
                </h3>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Geração de Receita</p>
              </div>
           </div>

           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
             <div className="flex flex-col gap-4">
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Plano de Ação Sugerido</h4>
                {defaultSales.plan.map((item, i) => (
                   <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                     <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                     <p className="text-sm font-medium text-white/80 leading-relaxed">{item}</p>
                   </div>
                ))}
             </div>
             <div className="h-full min-h-[220px]">
               <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 pb-2 mb-4 text-right">Projeção com Automação</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={defaultSales.comparisonData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEquipe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="equipe" stroke="#34d399" fillOpacity={1} fill="url(#colorEquipe)" strokeWidth={3} />
                    <Area type="monotone" dataKey="automacao" stroke="#818cf8" fillOpacity={1} fill="url(#colorAuto)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* Tiers Inferiores (Tecnologia e Indicadores) */}
        
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-pink-500/20 transition-colors duration-1000" />
           <div className="flex items-center gap-6 mb-8 relative z-10">
              <ScoreBadge score={defaultTech.score} />
              <div>
                <h3 className="text-2xl font-display font-black text-white flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-pink-400" /> Infraestrutura e Tech
                </h3>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Eficiência de Dados</p>
              </div>
           </div>
           <div className="flex flex-col gap-4 relative z-10">
              <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">Plano de Ação Sugerido</h4>
              {defaultTech.plan.map((item, i) => (
                 <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                   <Lightbulb className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium text-white/80 leading-relaxed">{item}</p>
                 </div>
              ))}
           </div>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-1000" />
           <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-display shadow-lg">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-black text-white flex items-center gap-2">
                  Top Indicadores
                </h3>
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Funil projetado</p>
              </div>
           </div>
           <div className="flex-1 w-full min-h-[200px] relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={defaultIndicators.funnel} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                 <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                   {defaultIndicators.funnel.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}

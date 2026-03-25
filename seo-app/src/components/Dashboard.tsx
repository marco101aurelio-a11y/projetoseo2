import { useState, useEffect } from 'react';
import type { SeoResult, AiInsight, AdStats, CampaignData, AudienceBehavior, FinanceResult } from '../types';
import { BarChart3, TrendingUp, Target, Zap, Bot, Lightbulb, Loader2, PenTool, PieChart, Users, DollarSign, Shield } from 'lucide-react';
import { generateCreativeInsights, generateBudgetInsights, generateChurnPredictor, generateFinanceInsights, callJax } from '../services/gemini';
import DRETable from './DRETable';
import FinancialVisuals from './FinancialVisuals';
import { cn } from '../lib/utils';

interface DashboardProps {
  seoData: SeoResult | null;
  aiInsights: AiInsight | null;
}

type AiProfile = 'seo' | 'creatives' | 'budget' | 'retention' | 'finance';

export function Dashboard({ seoData, aiInsights }: DashboardProps) {
  const [activeProfile, setActiveProfile] = useState<AiProfile>('seo');
  const [localInsights, setLocalInsights] = useState<AiInsight | null>(aiInsights);
  const [financeData, setFinanceData] = useState<FinanceResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (activeProfile === 'seo') {
      setLocalInsights(aiInsights);
    }
  }, [aiInsights, activeProfile]);

  const handleProfileSwitch = async (profile: AiProfile) => {
    setActiveProfile(profile);
    if (profile === 'seo') {
      setLocalInsights(aiInsights);
      return;
    }

    setIsGenerating(true);
    setLocalInsights(null);
    setFinanceData(null);

    try {
      if (profile === 'creatives') {
        const mock: AdStats = { adName: 'Video UGC Dores', clicks: 840, conversions: 22, spend: 450.00 };
        setLocalInsights(await generateCreativeInsights(mock));
      } else if (profile === 'budget') {
        const mock: CampaignData = { dailySpend: 2500, roas: 4.2, targetRoas: 2.5, frequency: 1.4 };
        setLocalInsights(await generateBudgetInsights(mock));
      } else if (profile === 'retention') {
        const mock: AudienceBehavior = { daysSinceLastVisit: 55, purchasesInLastSemester: 3, averageTicket: 499.00 };
        setLocalInsights(await generateChurnPredictor(mock));
      } else if (profile === 'finance') {
        const investment = (seoData?.keywordData.search_volume || 1000) * (seoData?.keywordData.cpc || 1) * 0.1;
        const result = await callJax("dre", {
          investment: investment > 0 ? investment : 5000,
          roas: 4.8,
          fixed_costs: 12000,
          cogs_pct: 0.32
        });
        setFinanceData(result);
        setLocalInsights(await generateFinanceInsights(result));
      }
    } catch (error) {
      console.error("Erro ao trocar perfil de IA:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!seoData) return null;

  return (
    <div className="mt-20 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/5">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white opacity-40">Resultados para</span>
          <h2 className="display-lg text-white">
            "{seoData.keywordData.keyword}"
          </h2>
        </div>
        <div className="flex gap-3">
          {seoData.keywordData.country && (
            <span className="px-4 py-2 bg-white/10 text-white text-[10px] font-black rounded-sm uppercase tracking-widest border border-white/10">
              {seoData.keywordData.country}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard icon={BarChart3} label="Volume" value={(seoData.keywordData.search_volume || 0).toLocaleString('pt-BR')} subtitle="Buscas mensais" />
        <MetricCard icon={TrendingUp} label="CPC" value={`${seoData.keywordData.currency || 'R$'}${seoData.keywordData.cpc?.toFixed(2) || '0.00'}`} subtitle="Custo por clique" />
        <MetricCard icon={Target} label="Concorrência" value={seoData.keywordData.competition_index.toString()} subtitle={seoData.keywordData.competition} />
        <MetricCard icon={Zap} label="Lances" value={`${seoData.keywordData.high_top_of_page_bid?.toFixed(2) || '0.00'}`} subtitle="Topo de página" />
      </div>

      <div className="mt-24 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <h3 className="font-display font-bold text-xl tracking-tight text-white">IA Estratégica</h3>
          </div>

          <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-full border border-white/10">
            {[
              { id: 'seo', label: 'SEO', icon: Target },
              { id: 'creatives', label: 'Criativos', icon: PenTool },
              { id: 'finance', label: 'Financeiro', icon: DollarSign },
              { id: 'budget', label: 'Escala', icon: PieChart },
              { id: 'retention', label: 'Retenção', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleProfileSwitch(tab.id as AiProfile)}
                disabled={isGenerating}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  activeProfile === tab.id
                    ? "bg-white text-black shadow-lg"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isGenerating ? (
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-32 flex flex-col items-center justify-center border border-white/10">
            <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Capvi IA está raciocinando...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {activeProfile === 'finance' && financeData && (
              <div className="animate-in fade-in slide-in-from-top-8 duration-700">
                <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/10">
                  <DRETable data={financeData.detailed_dre} />
                </div>
                <div className="mt-12">
                  <FinancialVisuals data={financeData.detailed_dre} ebitda_pct={financeData.summary.ebitda_pct} roas={4.8} />
                </div>
              </div>
            )}

            {localInsights && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/10">
                  <h4 className="flex items-center gap-3 font-display font-extrabold text-2xl mb-12 text-white">
                    <Lightbulb className="w-6 h-6 text-white" />
                    Protocolo de Ação
                  </h4>
                  <ul className="space-y-10">
                    {(localInsights.strategy || []).map((step, idx) => (
                      <li key={idx} className="flex gap-8 items-start group">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-black text-xs transition-colors group-hover:bg-white group-hover:text-black">
                          0{idx + 1}
                        </span>
                        <p className="text-white/80 font-medium text-lg leading-relaxed pt-1">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-8">
                  <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                      <Shield size={14} /> Resumo Executivo
                    </h4>
                    <p className="text-white/80 font-medium leading-relaxed">
                      {localInsights.summary}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
                    <h4 className="font-black text-white/40 mb-6 text-[10px] uppercase tracking-[0.2em]">Veredito Baseado em Dados</h4>
                    <p className="font-display font-extrabold text-2xl leading-snug text-white">
                      {localInsights.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtitle }: { icon: any, label: string, value: string, subtitle: string }) {
  return (
    <div className="glass-card p-10 flex flex-col justify-between hover:scale-[1.02] cursor-default group">
      <div className="flex justify-between items-start mb-8">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-40">{label}</span>
      </div>
      <div>
        <h3 className="text-4xl font-display font-extrabold text-white mb-3 tracking-tight">{value}</h3>
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
}

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
    <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          "{seoData.keywordData.keyword}"
        </h2>
        <div className="flex gap-2">
           {seoData.keywordData.country && (
             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg uppercase tracking-wider">
               📍 {seoData.keywordData.country}
             </span>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={BarChart3} label="Volume" value={(seoData.keywordData.search_volume || 0).toLocaleString('pt-BR')} subtitle="Buscas mensais" />
        <MetricCard icon={TrendingUp} label="CPC" value={`${seoData.keywordData.currency || 'R$'}${seoData.keywordData.cpc?.toFixed(2) || '0.00'}`} subtitle="Custo por clique" />
        <MetricCard icon={Target} label="Concorrência" value={seoData.keywordData.competition_index.toString()} subtitle={seoData.keywordData.competition} />
        <MetricCard icon={Zap} label="Lances" value={`${seoData.keywordData.high_top_of_page_bid?.toFixed(2) || '0.00'}`} subtitle="Topo de página" />
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-slate-900 dark:text-white" />
            <h3 className="text-xl font-bold dark:text-white">IA Estratégica</h3>
          </div>
          
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeProfile === tab.id 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {isGenerating ? (
          <div className="glass-panel p-20 flex flex-col items-center justify-center animate-pulse">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Processando com Capvi IA...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeProfile === 'finance' && financeData && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <DRETable data={financeData.detailed_dre} />
                <div className="mt-8">
                  <FinancialVisuals data={financeData.detailed_dre} ebitda_pct={financeData.summary.ebitda_pct} roas={4.8} />
                </div>
              </div>
            )}

            {localInsights && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-8 md:p-10">
                  <h4 className="flex items-center gap-2 font-bold text-lg mb-8 dark:text-white">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Plano de Ação Sugerido
                  </h4>
                  <ul className="space-y-6">
                    {(localInsights.strategy || []).map((step, idx) => (
                      <li key={idx} className="flex gap-4 items-start">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-6">
                  <div className="glass-panel p-8">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Shield size={16} /> Resumo Executivo
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {localInsights.summary}
                    </p>
                  </div>
                  
                  <div className="glass-panel p-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
                    <h4 className="font-bold opacity-70 mb-4 text-xs uppercase tracking-wider">Recomendação Final</h4>
                    <p className="font-bold text-xl leading-snug">
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
    <div className="glass-panel p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white group-hover:bg-slate-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

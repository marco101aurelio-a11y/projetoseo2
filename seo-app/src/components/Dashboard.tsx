import type { SeoResult, AiInsight } from '../types';
import { BarChart3, TrendingUp, Target, Zap, Bot, Lightbulb } from 'lucide-react';

interface DashboardProps {
  seoData: SeoResult | null;
  aiInsights: AiInsight | null;
}

export function Dashboard({ seoData, aiInsights }: DashboardProps) {
  if (!seoData) return null;

  return (
    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-slate-600 dark:text-slate-400" />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white break-words">
            <span className="text-slate-700 dark:text-slate-300">"{seoData.keywordData.keyword}"</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 p-3 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Volume</span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white mb-1 truncate" title={seoData.keywordData.search_volume.toLocaleString('pt-BR')}>
              {seoData.keywordData.search_volume.toLocaleString('pt-BR')}
            </h3>
            <p className="text-sm text-slate-500">Buscas mensais</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">CPC</span>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white mb-1 truncate">
              ${seoData.keywordData.cpc !== null ? seoData.keywordData.cpc.toFixed(2) : 'N/A'}
            </h3>
            <p className="text-sm text-slate-500">Custo por clique</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between group relative overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-default">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 p-3 rounded-2xl">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lances (Topo)</span>
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
              <h3 className="text-2xl sm:text-2xl lg:text-xl xl:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                ${seoData.keywordData.low_top_of_page_bid !== null ? seoData.keywordData.low_top_of_page_bid.toFixed(2) : '-'}
              </h3>
              <span className="text-slate-500 text-sm">até</span>
              <h3 className="text-2xl sm:text-2xl lg:text-xl xl:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                ${seoData.keywordData.high_top_of_page_bid !== null ? seoData.keywordData.high_top_of_page_bid.toFixed(2) : '-'}
              </h3>
            </div>
            <p className="text-sm text-slate-500">Baixo - Alto</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between group relative overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 p-3 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Concorrência</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white mb-1 flex flex-wrap items-center sm:items-baseline gap-2">
              <span>{seoData.keywordData.competition_index}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {seoData.keywordData.competition}
              </span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">Índice (0-100)</p>
          </div>
        </div>
      </div>

      {aiInsights && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-7 h-7 text-slate-700 dark:text-slate-300" />
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 text-transparent bg-clip-text">
              Capvi AI
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel p-8 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-default">
              <h4 className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Plano de Ação Tático
              </h4>
              <ul className="space-y-4">
                {aiInsights.strategy.map((step, idx) => (
                  <li key={idx} className="flex gap-4 items-start group">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:bg-slate-800 group-hover:text-white dark:group-hover:bg-slate-200 dark:group-hover:text-slate-900 transition-colors">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      {step}
                    </p>
                  </li>
                ))}
              </ul>
              
              {aiInsights.keywordIdeas && aiInsights.keywordIdeas.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-500" />
                    Sugestões de Cauda Longa (Baratear o Clique)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.keywordIdeas.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="glass-panel p-6 bg-slate-100/50 dark:bg-slate-800/40 border border-transparent hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-default">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Análise (Volume x Custos)</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {aiInsights.summary}
                </p>
              </div>
              
              <div className="glass-panel p-6 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 cursor-default">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-2">Veredito Definitivo</h4>
                <p className="text-emerald-800/90 dark:text-emerald-200/90 font-medium">
                  {aiInsights.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

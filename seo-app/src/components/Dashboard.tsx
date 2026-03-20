import type { SeoResult } from '../types';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';

interface DashboardProps {
  seoData: SeoResult | null;
}

export function Dashboard({ seoData }: DashboardProps) {
  if (!seoData) return null;

  return (
    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-8 h-8 text-slate-600 dark:text-slate-400" />
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Resultados para <span className="text-slate-700 dark:text-slate-300">"{seoData.keywordData.keyword}"</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 p-3 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Volume</span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
              {seoData.keywordData.search_volume.toLocaleString('pt-BR')}
            </h3>
            <p className="text-sm text-slate-500">Buscas mensais</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">CPC</span>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
              ${seoData.keywordData.cpc !== null ? seoData.keywordData.cpc.toFixed(2) : 'N/A'}
            </h3>
            <p className="text-sm text-slate-500">Custo por clique</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 p-3 rounded-2xl">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lances (Topo)</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                ${seoData.keywordData.low_top_of_page_bid !== null ? seoData.keywordData.low_top_of_page_bid.toFixed(2) : '-'}
              </h3>
              <span className="text-slate-500">até</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                ${seoData.keywordData.high_top_of_page_bid !== null ? seoData.keywordData.high_top_of_page_bid.toFixed(2) : '-'}
              </h3>
            </div>
            <p className="text-sm text-slate-500">Baixo - Alto</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-slate-200 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 p-3 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Concorrência</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1 flex items-baseline gap-2">
              {seoData.keywordData.competition_index}
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {seoData.keywordData.competition}
              </span>
            </h3>
            <p className="text-sm text-slate-500">Índice (0-100)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

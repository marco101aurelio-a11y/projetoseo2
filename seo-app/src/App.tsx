import { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Dashboard } from './components/Dashboard';
import { fetchSeoData } from './services/dataForSeo';
import type { SeoResult } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [seoData, setSeoData] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSeoData(null);
    setError(null);

    try {
      // Fetch data from DataForSEO
      const data = await fetchSeoData(query);
      setSeoData(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os dados. Verifique a configuração da sua API ou tente novamente mais tarde.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
            Descubra o potencial do seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-500">SEO</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Analise palavras-chave, verifique volumes de busca e dificuldade em tempo real com o motor inteligente.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isSearching} />

        {/* Loading State */}
        {isSearching && (
          <div className="mt-24 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-4 animate-pulse">
            <Loader2 className="w-12 h-12 text-slate-500 animate-spin" />
            <p className="text-lg font-medium">Analisando dados...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isSearching && (
          <div className="mt-12 max-w-2xl mx-auto bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Results Dashboard */}
        {!isSearching && !error && seoData && (
          <Dashboard seoData={seoData} />
        )}

        {/* Empty State / Initial Load area */}
        {!isSearching && !error && !seoData && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'Análise de Palavras-Chave', desc: 'Descubra volume, CPC e dificuldade em um instante' },
              { title: 'Dados Precisos', desc: 'Integração confiável e em tempo real' }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 text-center hover:-translate-y-1 transition-transform duration-300 group cursor-default">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800/50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xl group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

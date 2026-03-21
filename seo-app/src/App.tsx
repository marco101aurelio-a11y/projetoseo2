import { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { RotatingText } from './components/RotatingText';
import { fetchSeoData } from './services/dataForSeo';
import { generateSeoInsights } from './services/gemini';
import type { SeoResult, AiInsight } from './types';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('painel');
  const [isSearching, setIsSearching] = useState(false);
  const [seoData, setSeoData] = useState<SeoResult | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSeoData(null);
    setAiInsights(null);
    setError(null);

    try {
      // Fetch data from DataForSEO
      const data = await fetchSeoData(query);
      setSeoData(data);
      
      // Generate AI Insights with Gemini
      const insights = await generateSeoInsights(data);
      setAiInsights(insights);

      // Add intentional delay to let the user enjoy the capybara animation!
      await new Promise(resolve => setTimeout(resolve, 6500));
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os dados. Verifique a configuração da sua API ou tente novamente mais tarde.");
    } finally {
      setIsSearching(false);
    }
  };

  // Se o usuário não estiver autenticado, a barreira do React mostra APENAS a tela de login
  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        
        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 lg:px-12 pb-24 scrollbar-hide">
          <div className="max-w-[1200px] mx-auto w-full">
            {activeTab === 'painel' ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1]">
                      Inteligência de dados para escalar seu{" "}<RotatingText />
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                      Descubra as palavras-chave mais rentáveis, analise a concorrência e domine o seu mercado com dados precisos.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-12">
                  <SearchBar onSearch={handleSearch} isLoading={isSearching} />
                </div>

                {/* Loading State */}
                {isSearching && (
                  <div className="mt-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-8 overflow-hidden w-full max-w-lg mx-auto relative h-40">
                    <div className="absolute top-0 animate-walk flex justify-center w-[120%] max-w-none left-[-10%] mix-blend-multiply dark:mix-blend-screen mix-blend-mode-layer">
                      <img src="/capivaras-andando.png" alt="Capivaras andando" className="h-24 animate-waddle filter grayscale contrast-200 dark:invert dark:brightness-[300%] dark:contrast-[200%]" />
                    </div>
                    <p className="text-lg font-bold animate-pulse absolute bottom-0 px-4 z-20 pb-2">Capvi IA carregando</p>
                  </div>
                )}

                {/* Error State */}
                {error && !isSearching && (
                  <div className="mt-8 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Results Dashboard */}
                {!isSearching && !error && seoData && (
                  <Dashboard seoData={seoData} aiInsights={aiInsights} />
                )}

                {/* Empty State / Initial Load area */}
                {!isSearching && !error && !seoData && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Auditoria Instantânea', desc: 'Obtenha feedback imediato sobre o desempenho de qualquer página ou termo.' },
                      { title: 'Dados de Alta Precisão', desc: 'Integração em tempo real com a inteligência artificial exclusiva Capvi.' }
                    ].map((feature, i) => (
                      <div key={i} className="bg-slate-100 dark:bg-slate-800/40 p-8 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300 group cursor-default border border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl mb-4 flex items-center justify-center text-slate-900 dark:text-white font-black text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <h3 className="font-black text-xl mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 border border-slate-100 dark:border-slate-800">
                  <img src="/capivara.png" alt="Capvi Logo" className="h-16 w-auto mix-blend-multiply dark:mix-blend-screen filter grayscale contrast-200 dark:invert dark:brightness-[300%] dark:contrast-[200%]" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Módulo em Desenvolvimento</h2>
                <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
                  A ferramenta de <strong className="text-slate-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</strong> está sendo arquitetada pela IA da Capvi. Em breve você terá relatórios profundos aqui.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

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
import { Bot } from 'lucide-react';

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
      const data = await fetchSeoData(query);
      setSeoData(data);
      const insights = await generateSeoInsights(data);
      setAiInsights(insights);
      await new Promise(resolve => setTimeout(resolve, 6500));
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os dados. Verifique a configuração da sua API ou tente novamente mais tarde.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-surface text-on-surface transition-colors duration-500 overflow-hidden font-sans selection:bg-black selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-surface-container-low rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <Header />

        <main className="flex-1 overflow-y-auto px-8 py-16 md:px-16 lg:px-24 pb-32 scrollbar-hide relative z-10">
          <div className="max-w-[1400px] mx-auto w-full">
            {activeTab === 'painel' ? (
              <>
                <div className="flex flex-col gap-10 mb-24">
                  <div className="max-w-4xl">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 mb-6 block">Intelligence Platform</span>
                    <h1 className="display-lg text-black mb-8 leading-[1.05]">
                      Dados para escalar seu <br />
                      <span className="inline-block mt-2"><RotatingText /></span>
                    </h1>
                    <p className="text-xl text-on-surface-variant font-medium max-w-2xl leading-relaxed">
                      Descubra as palavras-chave mais rentáveis e domine o seu mercado através de uma interface de precisão etérea.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-[3rem] p-10 mb-20 shadow-[0_40px_80px_rgba(25,28,29,0.03)] focus-within:bg-surface-container-lowest transition-all duration-500">
                  <SearchBar onSearch={handleSearch} isLoading={isSearching} />
                </div>

                {isSearching && (
                  <div className="mt-24 flex flex-col items-center justify-center space-y-12 overflow-hidden w-full max-w-lg mx-auto relative h-60">
                    <div className="absolute top-0 animate-walk flex justify-center w-[120%] max-w-none left-[-10%] opacity-20">
                      <img src="/capivaras-andando.png" alt="Capvi Loader" className="h-32 filter grayscale" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40 animate-pulse absolute bottom-0 z-20 pb-4">Arquitetando Inteligência</p>
                  </div>
                )}

                {error && !isSearching && (
                  <div className="mt-12 bg-error/5 text-error p-10 rounded-[2rem] text-left border-none shadow-[0_20px_40px_rgba(186,26,26,0.05)]">
                    <p className="font-bold text-lg">{error}</p>
                  </div>
                )}

                {!isSearching && !error && seoData && (
                  <Dashboard seoData={seoData} aiInsights={aiInsights} />
                )}

                {!isSearching && !error && !seoData && (
                  <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { title: 'Auditoria de Precisão', desc: 'Obtenha feedback imediato sobre o desempenho estratégico de qualquer termo.' },
                      { title: 'IA Transversal', desc: 'Integração profunda com a inteligência Capvi para decisões de alta lucratividade.' }
                    ].map((feature, i) => (
                      <div key={i} className="tonal-lift p-12 hover:scale-[1.01] group cursor-default">
                        <div className="w-14 h-14 bg-surface-container-highest rounded-full mb-8 flex items-center justify-center text-black font-black text-xl transition-all group-hover:bg-black group-hover:text-white">
                          0{i + 1}
                        </div>
                        <h3 className="font-display font-extrabold text-2xl mb-4 text-black">{feature.title}</h3>
                        <p className="text-on-surface-variant font-medium text-lg leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-start justify-center h-[60vh] text-left animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="bg-surface-container-highest w-20 h-20 rounded-[2rem] mb-12 flex items-center justify-center">
                  <Bot className="w-10 h-10 text-black opacity-40" />
                </div>
                <h2 className="display-lg text-black mb-8 underline decoration-outline-variant decoration-4 underline-offset-8">Módulo em Desenvolvimento</h2>
                <p className="text-xl text-on-surface-variant font-medium max-w-2xl leading-relaxed">
                  A ferramenta de <strong className="text-black capitalize">{activeTab.replace('-', ' ')}</strong> está sendo arquitetada pela IA da Capvi. Em breve você terá relatórios profundos aqui.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

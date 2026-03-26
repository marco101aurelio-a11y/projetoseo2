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
import { Settings } from './components/Settings';

import loginBg from './assets/galactic-bg.jpg';

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
    <div className="flex h-screen bg-black text-white transition-colors duration-500 overflow-hidden font-sans selection:bg-white selection:text-black relative">
      {/* Unified Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 opacity-50 blur-[8px]"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      
      {/* Heavy Atmospheric Fog/Overlay to reduce grain */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header />

        <main className="flex-1 overflow-y-auto px-8 py-16 md:px-16 lg:px-24 pb-32 scrollbar-hide relative">
          <div className="max-w-[1400px] mx-auto w-full">
            {activeTab === 'painel' ? (
              <>
                <div className="flex flex-col gap-10 mb-24">
                  <div className="max-w-4xl">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6 block">Intelligence Platform</span>
                    <h1 className="display-lg text-white mb-8 leading-[1.05]">
                      Dados para escalar seu <br />
                      <span className="inline-block mt-2"><RotatingText /></span>
                    </h1>
                    <p className="text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
                      Descubra as palavras-chave mais rentáveis e domine o seu mercado através de uma interface de precisão etérea.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 mb-20 shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-white/10 focus-within:bg-white/10 transition-all duration-500">
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
                      <div key={i} className="glass-card p-12 hover:scale-[1.01] group cursor-default">
                        <div className="w-14 h-14 bg-white/10 rounded-full mb-8 flex items-center justify-center text-white font-black text-xl transition-all group-hover:bg-white group-hover:text-black">
                          0{i + 1}
                        </div>
                        <h3 className="font-display font-extrabold text-2xl mb-4 text-white">{feature.title}</h3>
                        <p className="text-white/60 font-medium text-lg leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === 'config' ? (
              <Settings />
            ) : (
              <div className="flex flex-col items-start justify-center h-[60vh] text-left animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="bg-surface-container-highest w-20 h-20 rounded-[2rem] mb-12 flex items-center justify-center border border-white/10">
                  <Bot className="w-10 h-10 text-white opacity-40" />
                </div>
                <h2 className="display-lg text-white mb-8 underline decoration-white/10 decoration-4 underline-offset-8">Módulo em Desenvolvimento</h2>
                <p className="text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
                  A ferramenta de <strong className="text-white capitalize">{activeTab.replace('-', ' ')}</strong> está sendo arquitetada pela IA da Capvi. Em breve você terá relatórios profundos aqui.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

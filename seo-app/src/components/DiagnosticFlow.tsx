import { useState } from 'react';
import { Bot, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import loginBg from '../assets/galactic-bg.jpg';

export interface DiagnosticData {
  sector: string;
  moment: string;
  objective: string;
  offer: string;
  margin: string;
  history: string;
  channels: string[];
  strategies: string;
}

interface DiagnosticFlowProps {
  onComplete: (data: DiagnosticData) => void;
  onClose?: () => void;
}

export function DiagnosticFlow({ onComplete, onClose }: DiagnosticFlowProps) {
  const [step, setStep] = useState(0); // 0 = Introdução, 1, 2, 3 = Perguntas, 4 = Concluindo...
  
  const [data, setData] = useState<DiagnosticData>({
    sector: '',
    moment: '',
    objective: '',
    offer: '',
    margin: '',
    history: '',
    channels: [],
    strategies: '',
  });

  const handleChannelToggle = (channel: string) => {
    setData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleFinish = async () => {
    setStep(4);
    // Simula tempo de raciocínio da IA antes de passar pro callback
    await new Promise(r => setTimeout(r, 2000));
    onComplete(data);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-700">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
      
      {/* Container Principal */}
      <div className="relative z-10 w-full max-w-4xl p-8 min-h-[500px] flex flex-col justify-center items-center">
        
        {/* Passo 0: Introdução */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center text-center gap-8 animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.05)]">
              <Bot className="w-12 h-12 text-white/80" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-display font-black text-white mb-4 tracking-tighter">
                Diagnóstico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Ponto de Partida</span>
              </h1>
              <p className="text-lg text-white/50 max-w-lg mx-auto leading-relaxed">
                Antes de montarmos o seu Dashboard de Performance e cruzarmos os dados em nosso Motor JAX, precisamos entender seu negócio.
              </p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="mt-4 px-10 py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Iniciar Diagnóstico
            </button>
            {onClose && (
               <button onClick={onClose} className="text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white mt-4">Agora não</button>
            )}
          </div>
        )}

        {/* Form Container (Steps 1, 2, 3) */}
        {step >= 1 && step <= 3 && (
          <div className="w-full h-full bg-white/5 border border-white/10 rounded-[3rem] p-10 lg:p-16 shadow-2xl relative overflow-hidden">
            {/* Background Glow Contextual */}
            <div className={cn(
              "absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] mix-blend-screen opacity-20 pointer-events-none transition-colors duration-1000",
              step === 1 ? "bg-blue-500" : step === 2 ? "bg-purple-500" : "bg-emerald-500"
            )} />

            {/* Marcadores de Progresso */}
            <div className="flex gap-2 mb-12 relative z-10 w-full max-w-md mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-700", i <= step ? "bg-white" : "bg-white/10")} />
              ))}
            </div>

            <div className="relative z-10">
              {/* STEP 1: Identificação */}
              {step === 1 && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-right-12 duration-700">
                  <h2 className="text-3xl font-display font-black text-white mb-2">Identificação Base</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">Momento Atual (Faturamento/Equipe)</label>
                      <input 
                        className="bg-black/40 border border-white/10 rounded-3xl p-5 text-white focus:outline-none focus:border-white/30 transition-all font-medium placeholder-white/20"
                        placeholder="Ex: Faturando 100k, time enxuto..."
                        value={data.moment}
                        onChange={e => setData({...data, moment: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">Histórico / Nicho</label>
                      <input 
                        className="bg-black/40 border border-white/10 rounded-3xl p-5 text-white focus:outline-none focus:border-white/30 transition-all font-medium placeholder-white/20"
                        placeholder="Ex: Ecommerce Maternidade, 2 anos..."
                        value={data.history}
                        onChange={e => setData({...data, history: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">Principais Objetivos</label>
                    <textarea 
                      className="bg-black/40 border border-white/10 rounded-3xl p-5 text-white focus:outline-none focus:border-white/30 transition-all font-medium placeholder-white/20 resize-none h-32"
                      placeholder="Quais são os seus maiores gargalos e objetivos hoje?"
                      value={data.objective}
                      onChange={e => setData({...data, objective: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Oferta e Finanças */}
              {step === 2 && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-right-12 duration-700">
                  <h2 className="text-3xl font-display font-black text-white mb-2">Engenharia de Oferta</h2>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">
                      Margem de Contribuição / Curva ABC / LTV
                    </label>
                    <input 
                      className="bg-black/40 border border-white/10 rounded-3xl p-5 text-white focus:outline-none focus:border-white/30 transition-all font-medium placeholder-white/20"
                      placeholder="Quais seus números base?"
                      value={data.margin}
                      onChange={e => setData({...data, margin: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">
                      Produtos e Serviços / Bônus / Escada de Valor
                    </label>
                    <textarea 
                      className="bg-black/40 border border-white/10 rounded-3xl p-5 text-white focus:outline-none focus:border-white/30 transition-all font-medium placeholder-white/20 resize-none h-32"
                      placeholder="Descreva as condições especiais, core offers e cross-sells..."
                      value={data.offer}
                      onChange={e => setData({...data, offer: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Estratégia dos Canais */}
              {step === 3 && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-right-12 duration-700">
                  <h2 className="text-3xl font-display font-black text-white mb-2">Estrutura de Aquisição</h2>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">Canais Já Utilizados</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        "Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads",
                        "SEO / Blog", "Email/WhatsApp", "Influencers", "Nenhum"
                      ].map(channel => (
                        <button 
                          key={channel}
                          onClick={() => handleChannelToggle(channel)}
                          className={cn(
                            "py-4 rounded-2xl border-2 transition-all font-bold text-xs",
                            data.channels.includes(channel) 
                              ? "bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
                              : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {channel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/50 pl-4">
                      Estratégias já validadas
                    </label>
                    <textarea 
                      className="bg-black/40 border border-white/10 rounded-3xl p-5 text-white focus:outline-none focus:border-white/30 transition-all font-medium placeholder-white/20 resize-none h-24"
                      placeholder="O que funcionou e o que deu errado até hoje?"
                      value={data.strategies}
                      onChange={e => setData({...data, strategies: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação do Forms */}
            <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/10 relative z-10 w-full">
               <button 
                 onClick={() => setStep(step - 1)}
                 className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>

               <button 
                 onClick={() => step === 3 ? handleFinish() : setStep(step + 1)}
                 className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
               >
                 {step === 3 ? "Finalizar e Analisar" : "Avançar"}
                 {step !== 3 && <ArrowRight className="w-4 h-4" />}
               </button>
            </div>
          </div>
        )}

        {/* STEP 4: Saving / AI Thinking Load */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center text-center gap-8 animate-in zoom-in-95 duration-700">
             <div className="relative flex items-center justify-center w-32 h-32">
                <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-purple-500/20 border-b-purple-400 rounded-full animate-spin-reverse"></div>
                <Bot className="w-10 h-10 text-white animate-pulse" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Orquestrando a IA</h2>
                <p className="text-white/50 max-w-sm mx-auto">Capvi Squad está estruturando seus relatórios avançados de marketing e tecnologia...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

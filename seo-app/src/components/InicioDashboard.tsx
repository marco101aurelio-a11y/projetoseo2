import { useState, useEffect } from 'react';
import { Play, Bot, Activity, Check, ArrowRight, ClipboardList, PenTool, Layout, Terminal, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ProjectData } from './Projects';
import { getBenchmarks } from '../services/gemini';

interface InicioDashboardProps {
  projects: ProjectData[];
  setActiveTab: (tab: string) => void;
}

const carouselTexts = [
  "Domine o SEO",
  "Plano de Growth",
  "Blog automatico",
  "Conteudo Viral",
  "DRE Automatico",
  "Traqueamento Meta ads",
  "Capvi IA",
  "Relatorios automaticos"
];

export function InicioDashboard({ projects, setActiveTab }: InicioDashboardProps) {
  // 1.2 Diagnosis State
  const [diagnosisStep, setDiagnosisStep] = useState(0); // 0: Start block, 1, 2, 3: Task steps
  const [diagnosisData, setDiagnosisData] = useState({
    sector: '',
    moment: '',
    offer: '',
    margin: '',
    profit: '',
    objective: '',
    history: '',
    channels: [] as string[]
  });

  // 1.4 Project Rotation State
  const [projectIndex, setProjectIndex] = useState(0);

  // 1.7 Capvi Drop State
  const [showCapviDrop, setShowCapviDrop] = useState(false);

  // 1.4.1 Carousel Logic (Rotina frases)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [benchmarks, setBenchmarks] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselTexts.length);
    }, 2000);

    const loadBenchmarks = async () => {
      const data = await getBenchmarks();
      setBenchmarks(data);
    };
    loadBenchmarks();

    return () => clearInterval(interval);
  }, []);

  // Update project index every 3 seconds for rotation
  useEffect(() => {
    if (projects.length > 0) {
      const interval = setInterval(() => {
        setProjectIndex((prev) => (prev + 1) % projects.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [projects]);

  const currentProject = projects[projectIndex] || { title: 'Exemplo Alpha', date: 'Hoje' };
  const mockHealthScore = [92, 85, 98, 77][projectIndex % 4];

  const handleChannelToggle = (channel: string) => {
    setDiagnosisData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-center text-white animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
      {/* Luzes dinâmicas de fundo ... */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="flex flex-col gap-8 relative z-10">
        {/* Bloco Overview removido conforme solicitado */}
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* SERP Overview (Manted Cover) - 2 cols wide, 1 tall */}
          <div className="lg:col-span-2 xl:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden relative min-h-[280px] group shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-transparent z-10 pointer-events-none mix-blend-overlay" />
             <img 
               src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80" 
               alt="SERP Cover" 
               className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent z-10" />
             <div className="absolute bottom-8 left-8 z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2 block">DADOS REAIS</span>
                <h2 className="text-4xl font-display font-black text-white italic">Olist Intelligence</h2>
                <div className="flex gap-6 mt-4">
                   <div className="flex flex-col">
                      <span className="text-2xl font-black text-indigo-400">{benchmarks?.total_customers?.toLocaleString() || "..."}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Clientes</span>
                   </div>
                   <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-2xl font-black text-purple-400">R$ {benchmarks?.avg_monetary?.toFixed(2) || "..."}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Ticket Médio</span>
                   </div>
                   <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-2xl font-black text-green-400">{benchmarks?.avg_frequency?.toFixed(2) || "..."}x</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Frequência</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Automação Carousel - 1 col wide, 1 tall */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-[rgba(255,255,255,0.15)] rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl min-h-[280px]">
            <div className="absolute -inset-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 z-10 transition-transform group-hover:scale-110 duration-500">
               <Bot className="w-8 h-8 text-white" />
            </div>
            {/* Título Inteligência Ativa removido conforme solicitado */}
            <div className="h-10 relative w-full flex items-center justify-center z-10">
              {carouselTexts.map((text, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "absolute transition-all duration-500 font-display font-black text-2xl text-center whitespace-nowrap",
                    idx === carouselIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Notas Adicionadas - 1 col wide, 1 tall+ */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col shadow-2xl group transition-all min-h-[340px]">
             <div className="flex justify-between items-start mb-6">
                <h3 className="font-display font-black text-xl uppercase tracking-tighter">Notas</h3>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <PenTool className="w-5 h-5 text-white/60" />
                </div>
             </div>
             <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 no-scrollbar">
                {[
                  "Revisar backlinks do Projeto SEO",
                  "Ajustar meta tags da Home",
                  "Analisar concorrente Alpha",
                  "Planejar posts de Abril",
                  "Validar conversão do Checkout",
                  "Otimizar cache do JAX"
                ].map((note, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-bold text-white/70 hover:text-white transition-colors cursor-default">
                    {note}
                  </div>
                ))}
             </div>
          </div>

          {/* Diagnóstico Início - 2 cols wide */}
          <div className="lg:col-span-2 xl:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col shadow-2xl min-h-[320px] relative overflow-hidden">
             <div className="flex items-center justify-between mb-6 z-10">
                <h3 className="font-display font-black text-xl">Diagnóstico Início</h3>
                {diagnosisStep > 0 && (
                  <button onClick={() => setDiagnosisStep(0)} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
                    <X className="w-3 h-3" /> Reiniciar
                  </button>
                )}
             </div>

             <div className="flex-1 flex flex-col z-10">
                {diagnosisStep === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <ClipboardList className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Melhore seu contexto estratégico</h4>
                      <p className="text-sm text-white/50 max-w-sm mx-auto">Responda algumas perguntas rápidas para que a Capvi IA possa otimizar sua estratégia.</p>
                    </div>
                    <button 
                      onClick={() => setDiagnosisStep(1)}
                      className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
                    >
                      Começar Diagnóstico
                    </button>
                  </div>
                )}

                {diagnosisStep === 1 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Qual seu setor / nicho?</label>
                        <input 
                          type="text" 
                          placeholder="Ex: E-commerce de Moda" 
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
                          value={diagnosisData.sector}
                          onChange={(e) => setDiagnosisData({...diagnosisData, sector: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-col gap-2 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Qual momento da empresa?</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Escala operacional" 
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
                          value={diagnosisData.moment}
                          onChange={(e) => setDiagnosisData({...diagnosisData, moment: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Qual a sua oferta principal?</label>
                      <textarea 
                        placeholder="Descreva seu produto ou serviço estrela..." 
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-colors resize-none h-24"
                        value={diagnosisData.offer}
                        onChange={(e) => setDiagnosisData({...diagnosisData, offer: e.target.value})}
                      />
                    </div>
                    <div className="mt-auto flex justify-end">
                      <button onClick={() => setDiagnosisStep(2)} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all group">
                        <span className="text-[10px] uppercase font-black">Próximo</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {diagnosisStep === 2 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Margem de contribuição / Lucro líquido?</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 30% / R$ 50k" 
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
                          value={diagnosisData.margin}
                          onChange={(e) => setDiagnosisData({...diagnosisData, margin: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-col gap-2 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Principal objetivo com a plataforma?</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Aumentar tráfego orgânico" 
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
                          value={diagnosisData.objective}
                          onChange={(e) => setDiagnosisData({...diagnosisData, objective: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mt-auto flex justify-between">
                      <button onClick={() => setDiagnosisStep(1)} className="flex items-center gap-2 px-6 py-3 text-white/40 hover:text-white rounded-full transition-all group">
                         <span className="text-[10px] uppercase font-black">Voltar</span>
                      </button>
                      <button onClick={() => setDiagnosisStep(3)} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all group">
                        <span className="text-[10px] uppercase font-black">Próximo</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {diagnosisStep === 3 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500 h-full">
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Histórico de estratégia + processo de venda?</label>
                      <textarea 
                        placeholder="Como você vende hoje?" 
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-colors resize-none h-20"
                        value={diagnosisData.history}
                        onChange={(e) => setDiagnosisData({...diagnosisData, history: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-2">Canais já utilizados:</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          "Facebook Ads", "Instagram", "Google Search", 
                          "Google Display", "Website / SEO", "Landing Pages", 
                          "Mídia Nativa", "Mídia de Nicho", "Nenhum"
                        ].map(channel => (
                          <button 
                            key={channel}
                            onClick={() => handleChannelToggle(channel)}
                            className={cn(
                              "text-[9px] uppercase font-black py-2 px-3 rounded-lg border transition-all text-center",
                              diagnosisData.channels.includes(channel) 
                                ? "bg-white text-black border-white" 
                                : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                            )}
                          >
                            {channel}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto flex justify-between">
                      <button onClick={() => setDiagnosisStep(2)} className="flex items-center gap-2 px-6 py-3 text-white/40 hover:text-white rounded-full transition-all group">
                         <span className="text-[10px] uppercase font-black">Voltar</span>
                      </button>
                      <button 
                        onClick={() => {
                          alert("Diagnóstico salvo com sucesso!");
                          setDiagnosisStep(0);
                        }} 
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full transition-all group shadow-lg shadow-indigo-500/20"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-black">Finalizar</span>
                      </button>
                    </div>
                  </div>
                )}
             </div>
             
             {/* Indicador de Progresso */}
             {diagnosisStep > 0 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-center">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === diagnosisStep ? "w-8 bg-white" : "w-2 bg-white/20")} />
                  ))}
               </div>
             )}
          </div>

          {/* Saúde dos Projetos (Project Health) */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
             <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full px-8 flex justify-between items-center z-10">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-white/50">Saúde dos Projetos</h3>
             </div>
             
             {/* Circular SVG Graph */}
             <div className="relative mt-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="url(#healthGradient)" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="351.85" 
                    strokeDashoffset={351.85 - (351.85 * mockHealthScore) / 100} 
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-1000" 
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-display font-black text-white">{mockHealthScore}</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider -mt-1">%</span>
                </div>
             </div>
             
             <div className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-500" key={projectIndex}>
                <span className="text-xs font-black text-white mb-1 uppercase tracking-tighter">{currentProject.title}</span>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estado Técnico Nominal</p>
             </div>

             {/* Indicador de Rotação */}
             <div className="absolute bottom-6 flex gap-1">
                {projects.length > 0 ? projects.map((_, i) => (
                  <div key={i} className={cn("w-1 h-1 rounded-full transition-all", i === projectIndex ? "bg-white w-4" : "bg-white/20")} />
                )) : <div className="w-4 h-1 rounded-full bg-white/20" />}
             </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col shadow-2xl">
             <h3 className="font-display font-black text-xl mb-6">Ações Rápidas</h3>
             <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Criar novo", icon: Play },
                  { label: "Analisar SEO", icon: Activity },
                  { label: "Auditoria", icon: Check },
                  { label: "Capvi Drop", icon: Layout }
                ].map((action, idx) => (
                   <button 
                    key={idx} 
                    onClick={() => {
                      if (action.label === 'Criar novo') setActiveTab('projetos');
                      if (action.label === 'Capvi Drop') setShowCapviDrop(true);
                    }} 
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group hover:-translate-y-1"
                   >
                     <action.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                     <span className="text-[10px] uppercase tracking-wider font-bold text-white/60 group-hover:text-white/90 transition-colors text-center">{action.label}</span>
                  </button>
                ))}
             </div>
          </div>

        </div>
      </div>

      {/* Interface Capvi Drop - Overlay/Drawer */}
      {showCapviDrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCapviDrop(false)} />
          <div className="w-full max-w-4xl h-[80vh] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-black text-2xl tracking-tight">Capvi Drop</h2>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Interface de Desenvolvimento</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCapviDrop(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all group"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
               <div className="flex flex-col gap-6">
                  <h4 className="font-black text-sm uppercase tracking-widest text-indigo-400">Status do Sistema</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Motor JAX", status: "Online", color: "text-green-400" },
                      { label: "API Bridge", status: "Estável", color: "text-green-400" },
                      { label: "Database", status: "Conectado", color: "text-green-400" },
                      { label: "IA Worker", status: "Ocioso", color: "text-indigo-400" }
                    ].map((s, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <span className="block text-[10px] font-bold text-white/30 uppercase mb-1">{s.label}</span>
                        <span className={cn("font-black text-xs uppercase tracking-tighter", s.color)}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="font-black text-sm uppercase tracking-widest text-indigo-400 mt-4">Console de Eventos</h4>
                  <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] text-white/40 border border-white/5 space-y-2">
                    <p className="text-green-500/60">[SYSTEM] Inicializando Capvi Drop...</p>
                    <p>[DEBUG] Carregando módulos de análise...</p>
                    <p>[INFO] Aguardando entrada do desenvolvedor.</p>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 animate-pulse">{'>'}</span>
                      <span className="w-1 h-3 bg-white/40 animate-pulse" />
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-col gap-6">
                  <h4 className="font-black text-sm uppercase tracking-widest text-indigo-400">Ferramentas de Drop</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: "Scraper Engine", desc: "Coleta de dados brutos" },
                      { name: "Parser JSON", desc: "Estruturação de metadados" },
                      { name: "Validator UI", desc: "Checagem de componentes" }
                    ].map((tool, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-white group-hover:text-indigo-400 transition-colors">{tool.name}</span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                        <p className="text-[10px] text-white/30 font-bold uppercase">{tool.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-auto w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Abrir IDE Completa
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Play, Database, FileText, Settings, Bot, Activity, Check, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ProjectData } from './Projects';

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
  // 1.4.1 Carousel Logic
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full text-white animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
      {/* Luzes dinâmicas de fundo para reforçar o efeito Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="flex flex-col gap-8 relative z-10">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-3xl font-display font-black">Overview</h1>
        </div>

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
          </div>

          {/* Automação Carousel - 1 col wide, 1 tall */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-[rgba(255,255,255,0.15)] rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl min-h-[280px]">
            <div className="absolute -inset-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 z-10 transition-transform group-hover:scale-110 duration-500">
               <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-sm uppercase tracking-widest text-[rgba(255,255,255,0.5)] font-black mb-4 z-10">Inteligência Ativa</h3>
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

          {/* Ative Tarefas / Capvi IA - 1 col wide, 1 tall */}
          <div className="col-span-1 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between shadow-2xl group hover:bg-black/60 transition-colors cursor-pointer min-h-[280px]">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <span className="font-black text-black">C</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                  <Database className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </div>
             </div>
             <div className="mt-8 flex items-end justify-between">
                <div>
                  <h3 className="font-black text-lg text-white mb-1 leading-tight">Ative tarefas /<br/> Capvi IA</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Execute Fast</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:-rotate-45 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
             </div>
          </div>

          {/* Projetos Recentes - 2 cols wide */}
          <div className="lg:col-span-2 xl:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col shadow-2xl">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-black text-xl">Projetos Recentes</h3>
                <button onClick={() => setActiveTab('projetos')} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Ver todos</button>
             </div>
             <div className="flex flex-col gap-3">
                {projects.slice(0, 3).map((project, idx) => (
                  <div key={idx} onClick={() => setActiveTab('projetos')} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors group">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col text-left">
                          <span className="font-bold text-white">{project.title}</span>
                          <span className="text-xs text-white/40">{project.date}</span>
                       </div>
                     </div>
                     <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/80 transition-colors group-hover:translate-x-1" />
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="p-4 text-center text-white/40 font-bold text-sm">
                    Nenhum projeto encontrado.
                  </div>
                )}
             </div>
          </div>

          {/* Saúde do Domínio (Domain Health) */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
             <h3 className="absolute top-6 left-6 font-black text-xs uppercase tracking-widest text-white/50 z-10">Saúde do Domínio</h3>
             
             {/* Circular SVG Graph */}
             <div className="relative mt-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                  {/* Progress Circle (92%) */}
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="url(#greenGradient)" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="351.85" 
                    strokeDashoffset="28" 
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]" 
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-display font-black text-white">92</span>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider -mt-1">%</span>
                </div>
             </div>
             
             <p className="mt-4 text-xs font-bold text-white/60">Excelente estado técnico</p>
          </div>

          {/* Quick Actions */}
          <div className="col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col shadow-2xl">
             <h3 className="font-display font-black text-xl mb-6">Ações Rápidas</h3>
             <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Criar novo", icon: Play },
                  { label: "Analisar SEO", icon: Activity },
                  { label: "Auditoria", icon: Check },
                  { label: "Configurar", icon: Settings }
                ].map((action, idx) => (
                   <button key={idx} onClick={action.label === 'Criar novo' ? () => setActiveTab('projetos') : undefined} className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group hover:-translate-y-1">
                     <action.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                     <span className="text-[10px] uppercase tracking-wider font-bold text-white/60 group-hover:text-white/90 transition-colors">{action.label}</span>
                  </button>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

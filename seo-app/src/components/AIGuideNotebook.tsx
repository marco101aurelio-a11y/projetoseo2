import { Book, PenTool, Bot, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export function AIGuideNotebook() {
  return (
    <div className="min-h-[70vh] p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-1000">
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-black/5 blur-[80px] rounded-full" />
        <div className="relative bg-black p-10 rounded-full shadow-2xl shadow-black/20">
          <Book className="w-16 h-16 text-white" />
          <div className="absolute -top-2 -right-2 bg-white/10 p-3 rounded-full shadow-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <h2 className="display-lg text-white mb-6 tracking-tighter">
        CAPVI <br />Guide Notebook
      </h2>
      <p className="text-xl text-white/60 font-medium max-w-xl leading-relaxed mb-16">
        Sua Central de Inteligência Transversal. <br />
        <span className="opacity-60">Sincronize dados de SEO, Finanças e Growth em um único documento regenerativo.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl">
        {[
          { icon: Bot, title: "IA DE PRECISÃO", desc: "Instância JAX focada exclusivamente na arquitetura do seu projeto." },
          { icon: PenTool, title: "SÍNTESE ATIVA", desc: "Transforme matrizes de dados brutos em planos de ação executáveis." },
          { icon: Sparkles, title: "BREVE", desc: "Treine a sua IA com seus próprios PDFs e documentos contextuais.", opacity: "opacity-40" }
        ].map((item, i) => (
          <div key={i} className={cn("glass-card p-10 group", item.opacity)}>
            <item.icon className="w-10 h-10 text-white/40 mb-8 mx-auto group-hover:scale-110 transition-transform group-hover:text-white" />
            <h4 className="font-black text-white mb-4 text-xs uppercase tracking-[0.3em]">{item.title}</h4>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-20">
        <button className="premium-button opacity-30 cursor-not-allowed h-16 px-16 uppercase tracking-[0.3em] text-[10px] font-black">
          Sincronização em Breve
        </button>
      </div>
    </div>
  );
}

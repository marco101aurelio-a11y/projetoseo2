import { 
  ArrowLeft, 
  Settings, 
  Share2, 
  Plus, 
  Upload, 
  Search, 
  Sidebar,
  TrendingUp, 
  Edit3, 
  DollarSign, 
  BarChart2, 
  Radio 
} from 'lucide-react';

interface ProjectViewProps {
  project: any;
  onBack: () => void;
}

export function ProjectView({ project, onBack }: ProjectViewProps) {
  return (
    <div className="w-full text-white animate-in fade-in slide-in-from-bottom-12 duration-1000 h-full flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex-shrink-0">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
                <img src="/logo-capvi.png" alt="Capvi" className="w-5 h-5 object-contain brightness-0" />
             </div>
             <span className="font-bold text-lg text-white/90">{project?.title || "Untitled notebook"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 shrink-0">
          <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold hover:bg-white/90 transition-colors text-sm shadow-xl">
            <Plus className="w-4 h-4" /> Criar notebook
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full font-bold hover:bg-white/10 transition-colors text-sm text-white/80">
            <TrendingUp className="w-4 h-4" /> Análise de dados
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full font-bold hover:bg-white/10 transition-colors text-sm text-white/80">
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full font-bold hover:bg-white/10 transition-colors text-sm text-white/80">
            <Settings className="w-4 h-4" /> Configurações
          </button>
          <div className="bg-white/10 border border-white/20 text-[10px] px-2 py-1 rounded-md font-black tracking-widest text-white/80 ml-1">PRO</div>
        </div>
      </div>

      {/* 3 Columns Layout */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[70vh] h-[calc(100vh-240px)]">

        {/* Left Column: Fontes */}
        <div className="w-full xl:w-[320px] shrink-0 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 z-10">
            <h3 className="font-display font-black text-xl text-white">Fontes</h3>
            <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
              <Sidebar className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <button className="w-full relative overflow-hidden group flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-white/20 hover:border-white/40 transition-all text-sm font-bold text-white mb-6 z-10 bg-white/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Plus className="w-4 h-4" /> Adicionar fontes
          </button>

          <div className="relative mb-8 z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text"
              placeholder="Pesquise novas fontes na web"
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-white/30 text-white placeholder-white/30 font-medium transition-colors"
            />
          </div>

          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 z-10">
            <div className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
              <BarChart2 className="w-6 h-6 text-white/50" />
            </div>
            <p className="text-sm font-black mb-3 text-white">As fontes salvas vão aparecer aqui</p>
            <p className="text-xs px-2 leading-loose text-white/60 font-medium">Clique em "Adicionar fonte" para incluir arquivos PDF, de sites, de texto, de vídeo ou de áudio.</p>
          </div>
        </div>

        {/* Center Column: Conversa */}
        <div className="flex-1 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 lg:p-10 flex flex-col relative shadow-2xl">
           <div className="flex items-center justify-between mb-10">
            <h3 className="font-display font-black text-xl text-white">Conversa</h3>
            <div className="flex items-center gap-2">
               <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <Settings className="w-4 h-4 text-white/60"/>
               </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
               <Upload className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-display font-black mb-6 text-white tracking-tight">Adicione uma fonte <br/> para começar</h2>
             <button className="px-8 py-3 rounded-full border border-white/20 text-sm font-bold hover:bg-white/10 transition-colors text-white/80">
               Fazer upload de uma fonte
             </button>
          </div>

          {/* Chat Input */}
          <div className="mt-10">
             <div className="relative bg-white/5 border border-white/10 rounded-full p-2 flex items-center group focus-within:bg-white/10 transition-colors focus-within:border-white/20">
               <input
                 type="text"
                 placeholder="Faça upload de uma fonte para começar"
                 className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm pl-6 py-2 font-medium"
                 disabled
               />
               <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 group-focus-within:bg-white group-focus-within:text-black transition-colors">
                 <ArrowLeft className="w-4 h-4 rotate-180" />
               </button>
             </div>
             <p className="text-[10px] text-center text-white/30 mt-4 font-bold tracking-wide uppercase">O modelo pode gerar respostas incorretas. Por isso, cheque o conteúdo.</p>
          </div>
        </div>

        {/* Right Column: Estúdio */}
        <div className="w-full xl:w-[380px] shrink-0 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 lg:p-8 flex flex-col relative shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-display font-black text-xl text-white">Estúdio</h3>
            <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
              <Sidebar className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
             {[
               { icon: Search, label: 'Seo Engine' },
               { icon: TrendingUp, label: 'Growth' },
               { icon: Edit3, label: 'Seo Blog' },
               { icon: DollarSign, label: 'Financeiro' },
               { icon: BarChart2, label: 'Relatórios' },
               { icon: Radio, label: 'Conteúdo viral' }
             ].map((item, idx) => (
               <button key={idx} className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 hover:border-white/10 transition-all group hover:-translate-y-1">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                   <item.icon className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] uppercase tracking-wider font-black text-center text-white/50 group-hover:text-white leading-tight transition-colors">
                   {item.label}
                 </span>
               </button>
             ))}
          </div>

          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 px-2">
             <span className="text-3xl mb-6">✨</span>
             <p className="text-sm font-black mb-3 text-white">O resultado do Studio será salvo aqui.</p>
             <p className="text-xs leading-loose text-white/60 font-medium">Depois de incluir as fontes, clique para gerar análises SEO, relatórios financeiros e ideias de crescimento.</p>
          </div>

          {/* Adicionar Nota */}
          <div className="absolute bottom-8 right-8 left-8 flex justify-center">
            <button className="w-full bg-white text-black px-6 py-4 rounded-full font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <Edit3 className="w-4 h-4" /> Adicionar nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

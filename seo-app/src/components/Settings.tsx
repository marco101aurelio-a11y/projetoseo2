import { User, Mic, ShieldCheck, Key, CreditCard, CheckCircle2, Globe, Mail, Lock } from 'lucide-react';

export function Settings() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="flex flex-col gap-6 mb-16">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-4 block">System Control</span>
          <h1 className="display-lg text-white mb-6 leading-none underline decoration-white/10 decoration-4 underline-offset-8 transition-all hover:decoration-white/20">
            Configurações
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
            Gerencie sua conta, preferências de IA e integrações de sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Profile Card */}
        <div className="glass-card p-10 flex flex-col gap-8 group">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Perfil do Usuário</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden border-2 border-white/20 transition-all group-hover:border-white/40 group-hover:scale-105 duration-500 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Avatar" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-all duration-500 delay-100">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-extrabold text-white tracking-tight">Capvi Designer</h3>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Mail size={14} className="opacity-40" />
                  <span>contato@capvi.ai</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <ShieldCheck size={14} className="opacity-40" />
                  <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">Acesso de Administrador</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-full border border-white/10 transition-all duration-300 transform group-hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)]">
            Editar Perfil
          </button>
        </div>

        {/* AI Preferences */}
        <div className="glass-card p-10 flex flex-col gap-8 group">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Preferências de IA</span>
          </div>

          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 relative overflow-hidden group-hover:bg-white/10 transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex gap-5">
                <div className="w-14 h-14 bg-gradient-to-tr from-white/10 to-white/30 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-all duration-500">
                  <Mic className="text-white opacity-80" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Voz & Mood</h4>
                  <p className="text-sm text-white/50 leading-relaxed max-w-[200px]">JAMES: Enérgico e Confiante. Ideal para insights diretos.</p>
                </div>
              </div>
              <button className="bg-white text-black font-black text-[10px] uppercase px-6 py-3 rounded-full hover:scale-105 transition-all shadow-xl tracking-tighter">
                Alterar Voz
              </button>
            </div>
            
            {/* Subtle Soundwaves */}
            <div className="flex gap-1 h-3 mt-8 opacity-20 items-center justify-center">
              {[1,2,3,4,5,6,7,5,4,2,3,4,6,8,10,6,4,3].map((h, i) => (
                <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* API Integrations */}
        <div className="glass-card p-10 flex flex-col gap-8 group lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Integrações de API</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Google Search Console', status: 'Conectado', icon: Globe },
              { name: 'Google Analytics', status: 'Conectado', icon: ShieldCheck },
              { name: 'DataForSEO', status: 'Conectado', icon: Key },
              { name: 'Gemini AI', status: 'Conectado', icon: Lock },
            ].map((api, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <api.icon className="w-5 h-5 text-white/40" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{api.status}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{api.name}</h4>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 w-full" />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full bg-white/10 hover:bg-white font-black uppercase tracking-widest text-[10px] text-white hover:text-black py-4 rounded-full border border-white/10 transition-all duration-500 transform hover:translate-y-[-2px]">
            Gerenciar Integrações
          </button>
        </div>

        {/* Billing */}
        <div className="glass-card p-10 flex flex-col gap-8 group lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Faturamento & Planos</span>
          </div>

          <div className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/10 font-black text-[10px] uppercase text-white tracking-widest">
                Plano Atual: Professional
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-1">Próxima Cobrança</p>
                  <p className="text-white font-bold">28 de Outubro, 2024</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-1">Método de Pagamento</p>
                  <p className="text-white font-bold">Visa terminando em 4567</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <button className="premium-button text-[10px] uppercase tracking-widest scale-110 shadow-2xl hover:scale-105 transition-all">
                Atualizar Plano
              </button>
              <button className="text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                Histórico de Faturas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

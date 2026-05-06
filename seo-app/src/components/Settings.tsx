import React, { useState, useEffect } from 'react';
import { User, Mic, ShieldCheck, Key, CreditCard, Check, Globe, Mail, Lock, Edit2, Save, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Settings() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('capvi_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Capvi Designer',
      email: 'contato@capvi.ai',
      role: 'Acesso de Administrador',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200'
    };
  });

  const [aiPrefs, setAiPrefs] = useState(() => {
    const saved = localStorage.getItem('capvi_ai_prefs');
    return saved ? JSON.parse(saved) : {
      voice: 'JAMES',
      mood: 'Enérgico e Confiante',
      description: 'Ideal para insights diretos.'
    };
  });

  const [integrations, setIntegrations] = useState([
    { name: 'Google Search Console', status: 'Conectado', icon: Globe, active: true },
    { name: 'Google Analytics', status: 'Conectado', icon: ShieldCheck, active: true },
    { name: 'DataForSEO', status: 'Conectado', icon: Key, active: true },
    { name: 'Gemini AI', status: 'Conectado', icon: Lock, active: true },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
        setProfile((prev: any) => ({ ...prev, email: user.email }));
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('capvi_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('capvi_ai_prefs', JSON.stringify(aiPrefs));
  }, [aiPrefs]);

  const voices = [
    { voice: 'JAMES', mood: 'Enérgico e Confiante', description: 'Ideal para insights diretos.' },
    { voice: 'SARAH', mood: 'Analítica e Calma', description: 'Foco em detalhes técnicos.' },
    { voice: 'MARCUS', mood: 'Motivador e Rápido', description: 'Para ciclos de growth acelerados.' }
  ];

  const handleToggleIntegration = (index: number) => {
    const next = [...integrations];
    next[index].active = !next[index].active;
    next[index].status = next[index].active ? 'Conectado' : 'Desconectado';
    setIntegrations(next);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 p-4 sm:p-0">
      <div className="flex flex-col gap-4 sm:gap-6 mb-10 sm:mb-16">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-2 sm:mb-4 block">System Control</span>
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 sm:mb-6 leading-none underline decoration-white/10 decoration-4 underline-offset-8 transition-all hover:decoration-white/20">
                Configurações
              </h1>
            </div>
            <button 
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
          <p className="text-base sm:text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
            Gerencie sua conta, preferências de IA e integrações de sistema.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="sm:hidden flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} /> Sair da Conta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Profile Card */}
        <div className="glass-card p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 group">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Perfil do Usuário</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 overflow-hidden border-2 border-white/20 transition-all group-hover:border-white/40 group-hover:scale-105 duration-500 shadow-2xl">
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-white text-black rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-all duration-500 delay-100">
                <Check size={14} className="sm:w-4 sm:h-4" />
              </div>
            </div>
            
            <div className="space-y-2 flex-1 w-full text-center sm:text-left">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:border-white/30 transition-all text-sm"
                    placeholder="Nome"
                  />
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:border-white/30 transition-all text-sm"
                    placeholder="Email"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">{profile.name}</h3>
                  <div className="flex flex-col gap-1 items-center sm:items-start">
                    <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
                      <Mail size={14} className="opacity-40" />
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
                      <ShieldCheck size={14} className="opacity-40" />
                      <span className="text-[10px] uppercase font-black text-white/30 tracking-widest">{profile.role}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className={`w-full ${isEditingProfile ? 'bg-white text-black' : 'bg-white/10 text-white'} hover:opacity-90 font-black uppercase tracking-widest text-[10px] py-3 sm:py-4 rounded-full border border-white/10 transition-all duration-300 transform group-hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] flex items-center justify-center gap-2`}
          >
            {isEditingProfile ? <><Save size={14} /> Salvar Alterações</> : <><Edit2 size={14} /> Editar Perfil</>}
          </button>
        </div>

        {/* AI Preferences */}
        <div className="glass-card p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 group">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Preferências de IA</span>
          </div>

          <div className="bg-white/5 rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-white/10 relative overflow-hidden group-hover:bg-white/10 transition-all duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
              <div className="flex items-center sm:items-start gap-4 sm:gap-5 w-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-white/10 to-white/30 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-all duration-500 flex-shrink-0">
                  <Mic className="text-white opacity-80 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-1">Voz & Mood</h4>
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed sm:max-w-[200px]">{aiPrefs.voice}: {aiPrefs.mood}. {aiPrefs.description}</p>
                </div>
              </div>
              <div className="relative group/dropdown w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white text-black font-black text-[10px] uppercase px-6 py-3 rounded-full hover:scale-105 transition-all shadow-xl tracking-tighter">
                  Alterar Voz
                </button>
                <div className="absolute top-full right-0 mt-2 w-full sm:w-48 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all opacity-0 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:pointer-events-auto z-50">
                  {voices.map((v) => (
                    <button 
                      key={v.voice}
                      onClick={() => setAiPrefs(v)}
                      className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all border-b border-white/5 last:border-0"
                    >
                      {v.voice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Subtle Soundwaves */}
            <div className="flex gap-1 h-3 mt-6 sm:mt-8 opacity-20 items-center justify-center">
              {[1,2,3,4,5,6,7,5,4,2,3,4,6,8,10,6,4,3].map((h, i) => (
                <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* API Integrations */}
        <div className="glass-card p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 group lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Integrações de API</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {integrations.map((api, i) => (
              <div 
                key={i} 
                onClick={() => handleToggleIntegration(i)}
                className={`cursor-pointer p-5 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border transition-all duration-300 ${api.active ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 opacity-50 hover:opacity-80'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <api.icon className={`w-5 h-5 ${api.active ? 'text-white' : 'text-white/40'}`} />
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${api.active ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${api.active ? 'text-green-500' : 'text-red-500'}`}>{api.status}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{api.name}</h4>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${api.active ? 'bg-white/40 w-full' : 'bg-white/10 w-0'}`} />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full bg-white/10 hover:bg-white font-black uppercase tracking-widest text-[10px] text-white hover:text-black py-3 sm:py-4 rounded-full border border-white/10 transition-all duration-500 transform hover:translate-y-[-2px]">
            Gerenciar Integrações
          </button>
        </div>

        {/* Billing */}
        <div className="glass-card p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 group lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-white/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Faturamento & Planos</span>
          </div>

          <div className="bg-white/[0.03] p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10">
            <div className="space-y-6 w-full md:w-auto">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/10 font-black text-[10px] uppercase text-white tracking-widest">
                Plano Atual: Professional
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                <div>
                  <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-1">Próxima Cobrança</p>
                  <p className="text-sm sm:text-base text-white font-bold">28 de Outubro, 2024</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-1">Método de Pagamento</p>
                  <p className="text-sm sm:text-base text-white font-bold">Visa terminando em 4567</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0">
              <button className="premium-button text-[10px] uppercase tracking-widest sm:scale-110 shadow-2xl hover:scale-105 transition-all py-3 sm:py-4 w-full md:w-auto px-8">
                Atualizar Plano
              </button>
              <button className="text-white/40 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all py-2">
                Histórico de Faturas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

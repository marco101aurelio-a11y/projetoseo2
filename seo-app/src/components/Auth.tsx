import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Eye } from 'lucide-react';
import loginBg from '../assets/galactic-bg.jpg';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-on-surface font-sans selection:bg-black selection:text-white overflow-hidden relative">
      {/* Unified Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 opacity-80 blur-[2px]"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      
      {/* Gaze Overlay para dar leitura, mantendo a resolução da foto visível */}
      <div className="absolute inset-0 bg-[#060606]/60 backdrop-blur-md pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 pointer-events-none" />

      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl relative transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 z-10">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 sm:p-10 md:p-14 relative shadow-[0_40px_120px_-10px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden">
          {/* Top light highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/10 overflow-hidden">
              <img src="/logo-capvi.png" alt="Capvi Mascot" className="w-16 h-16 object-contain brightness-0" />
            </div>
            
            <h1 className="text-4xl font-display font-black text-white tracking-tight mb-2">
              Capvi OS
            </h1>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              SISTEMA DE GERENCIAMENTO PREMIUM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-lg mx-auto">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50 pl-6 block">E-MAIL</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder:text-white/30 rounded-full h-14 pl-16 pr-6 text-sm outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-6">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50">SENHA</label>
                <button type="button" className="text-[10px] font-black text-white/50 hover:text-white transition-colors">Esqueceu a senha?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder:text-white/30 rounded-full h-14 pl-16 pr-16 text-sm outline-none transition-all shadow-inner"
                />
                <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90 h-[4.2rem] rounded-full text-base font-black transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 mt-6"
            >
              Entrar <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-white/50 font-medium">
              Ainda não tem uma conta? {' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-black text-white hover:underline transition-colors"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

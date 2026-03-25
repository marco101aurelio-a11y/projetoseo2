import React, { useState } from 'react';
import { ArrowRight, Cloud, Mail, Lock, Eye } from 'lucide-react';
import loginBg from '../../../documentos /stitch_projeto_seo/essa imagem.jpeg';

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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      
      {/* Backdrop Fog */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[8px] pointer-events-none" />

      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg relative transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12">
        <div className="bg-white/5 backdrop-blur-[48px] rounded-[3rem] p-8 sm:p-12 md:p-16 relative z-10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden">
          {/* Top light highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <Cloud className="w-7 h-7 text-black" />
            </div>
            
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              Capvi OS
            </h1>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              SISTEMA DE GERENCIAMENTO PREMIUM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40 ml-4">E-MAIL</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="premium-input pl-16 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40">SENHA</label>
                <button type="button" className="text-[10px] font-black text-white/60 hover:text-white hover:underline transition-colors">Esqueceu a senha?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="premium-input pl-16 pr-16 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                />
                <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90 h-[4.5rem] rounded-full text-lg font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98]"
            >
              Entrar <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-16 text-center">
            <p className="text-xs text-white/40 font-medium">
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

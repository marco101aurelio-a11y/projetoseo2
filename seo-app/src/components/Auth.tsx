import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import loginBg from '../assets/galactic-bg.jpg';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onLogin();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage('Conta criada com sucesso! Verifique seu e-mail para confirmar (se habilitado) ou faça login agora.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage('Instruções de recuperação de senha enviadas para o seu e-mail!');
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar redefinição de senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-black text-on-surface font-sans selection:bg-black selection:text-white overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 opacity-80 blur-[2px]"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      
      <div className="absolute inset-0 bg-[#060606]/60 backdrop-blur-md pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 pointer-events-none" />

      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl relative transition-all duration-1000 animate-in fade-in slide-in-from-bottom-12 z-10">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-10 md:p-14 relative shadow-[0_40px_120px_-10px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8 sm:mb-10 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/10 overflow-hidden">
              <img src="/logo-capvi.png" alt="Capvi Mascot" className="w-10 h-10 sm:w-16 sm:h-16 object-contain brightness-0" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mb-2">
              Capvi OS
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              SISTEMA DE GERENCIAMENTO PREMIUM
            </p>
          </div>

          {error && (
            <div className="mb-6 sm:mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200 text-xs font-semibold animate-in fade-in zoom-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 sm:mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl flex items-center gap-3 text-green-200 text-xs font-semibold animate-in fade-in zoom-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {message}
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-6 sm:space-y-8 w-full max-w-lg mx-auto">
               <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50 pl-6 block">E-MAIL CADASTRADO</label>
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

              <div className="flex flex-col gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-white/90 h-[4.2rem] rounded-full text-base font-black transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processando...' : 'Enviar link de recuperação'} <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs font-black text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full max-w-lg mx-auto">
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
                <div className="flex justify-between items-center px-4 sm:px-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50">SENHA</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }}
                      className="text-[10px] font-black text-white/50 hover:text-white transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder:text-white/30 rounded-full h-14 pl-16 pr-16 text-sm outline-none transition-all shadow-inner"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-white/90 h-[4.2rem] rounded-full text-base font-black transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {!isForgotPassword && (
            <div className="mt-8 sm:mt-10 text-center">
              <p className="text-xs text-white/50 font-medium">
                {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} {' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-black text-white hover:underline transition-colors"
                >
                  {isLogin ? 'Criar conta' : 'Fazer login'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


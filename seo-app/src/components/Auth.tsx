import { useState } from 'react';
import { ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { AuthRotatingText } from './AuthRotatingText';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  // Controle para saber se estamos na tela de 'Criar Conta' ou 'Login'
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-200">
      
      {/* Container Principal Dividido (Split-Screen) */}
      <div className="max-w-[70rem] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Coluna Esquerda - Copywriting e Marca */}
        <div className="p-8 lg:p-12 lg:pr-24 flex flex-col justify-center animate-in fade-in slide-in-from-left-8 duration-700">
          
          <div className="flex items-center gap-3 mb-16">
            <img src="/capivara.png" alt="Capvi Logo" className="h-[4.5rem] w-auto object-contain mix-blend-multiply filter grayscale contrast-200 translate-y-1" />
            <span className="text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-none">Capvi Seo</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Domine <br />
            <AuthRotatingText />
          </h1>

          <div className="mb-12 max-w-md">
            <p className="text-xl text-slate-800 font-bold mb-3 leading-snug">
              O poder dos dados com a precisão da Inteligência Artificial.
            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white rounded-[2rem] p-6 flex-1 shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <ShieldCheck className="w-6 h-6 text-slate-800 mb-4" />
              <div className="text-3xl font-extrabold text-slate-900 mb-1">99.9%</div>
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">Data Accuracy</div>
            </div>
            <div className="bg-white rounded-[2rem] p-6 flex-1 shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
              <Zap className="w-6 h-6 text-slate-800 mb-4" />
              <div className="text-3xl font-extrabold text-slate-900 mb-1">&lt; 2s</div>
              <div className="text-xs font-bold tracking-wider text-slate-400 uppercase">Audit Speed</div>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Formulário de Autenticação */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>

          {/* onSubmit bloqueia o recarregamento da página (e.preventDefault) e executa o login */}
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Alex Morgan" 
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  required 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Endereço de E-mail</label>
              <input 
                type="email" 
                placeholder="alex@precision.io" 
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Senha</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                required 
              />
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1 w-5 h-5 accent-slate-900 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-sm text-slate-500 font-medium leading-relaxed">
                  Eu concordo com os <a href="#" className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">Termos de Serviço</a> e a <a href="#" className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">Política de Privacidade</a>.
                </label>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-black hover:bg-slate-800 text-white font-bold rounded-2xl px-6 py-5 mt-8 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
            >
              {isLogin ? 'Entrar no Sistema' : 'Criar Conta'} 
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Divisória para alternar entre "Criar conta" ou "Entrar" */}
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} {' '}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)} 
                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                {isLogin ? 'Criar uma conta' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

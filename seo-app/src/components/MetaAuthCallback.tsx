import { useEffect, useState } from 'react';
import { exchangeMetaCode } from '../services/metaService';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function MetaAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        setStatus('error');
        setError('Nenhum código de autorização encontrado na URL.');
        return;
      }

      try {
        const { access_token } = await exchangeMetaCode(code);
        
        // Salva o token no localStorage
        localStorage.setItem('meta_access_token', access_token);
        localStorage.setItem('meta_connected_at', new Date().toISOString());
        
        setStatus('success');
        
        // Redireciona de volta para projetos após 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (err: any) {
        console.error('Error exchanging meta code:', err);
        setStatus('error');
        setError(err.message || 'Falha ao conectar com o Meta.');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full glass-card p-12 rounded-[3rem] border border-white/10 flex flex-col items-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mb-8" />
            <h2 className="text-3xl font-black mb-4">Conectando ao Meta</h2>
            <p className="text-white/60 font-medium leading-relaxed">
              Estamos estabelecendo uma conexão segura com sua conta de anúncios...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-400 mb-8" />
            <h2 className="text-3xl font-black mb-4">Sucesso!</h2>
            <p className="text-white/60 font-medium leading-relaxed">
              Sua conta foi vinculada com sucesso. Redirecionando...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mb-8" />
            <h2 className="text-3xl font-black mb-4">Erro na Conexão</h2>
            <p className="text-white/60 font-medium leading-relaxed mb-8">
              {error}
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-white text-black font-black rounded-full hover:scale-105 transition-all"
            >
              Voltar ao Início
            </button>
          </>
        )}
      </div>
    </div>
  );
}

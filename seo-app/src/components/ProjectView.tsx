import {
  ArrowLeft,
  Settings,
  Plus,
  Upload,
  Search,
  Sidebar,
  TrendingUp,
  Edit3,
  DollarSign,
  BarChart2,
  Radio,
  Loader2,
  Zap,
  CheckCircle,
  MessageSquare,
  Send,
  Target,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { chatWithAgent } from '../services/gemini';
import { MetaAdsDashboard } from './MetaAdsDashboard';
import { BusinessOnboarding } from './BusinessOnboarding';
import { FinanceDashboard } from './FinanceDashboard';
import { hasBusinessData, type BusinessData } from '../services/financeService';
import { projectService } from '../services/projectService';
import { getMetaAccounts, type MetaAccount } from '../services/metaService';

interface ProjectViewProps {
  project: any;
  onBack: () => void;
}

type EngineStep = 'IDLE' | 'SETUP' | 'LOADING' | 'CHAT' | 'DASHBOARD' | 'ONBOARDING';

export function ProjectView({ project, onBack }: ProjectViewProps) {
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const [engineStep, setEngineStep] = useState<EngineStep>('IDLE');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [projectTitle, setProjectTitle] = useState(project?.title || 'Untitled notebook');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const projectId = project?.id ?? 'default-project';

  // State para Meta Ads Real API
  const [metaAccessToken, setMetaAccessToken] = useState<string | null>(localStorage.getItem('meta_access_token'));
  const [adAccounts, setAdAccounts] = useState<MetaAccount[]>([]);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(localStorage.getItem(`meta_ad_account_${projectId}`));
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Busca contas se tiver token mas no tiver conta selecionada
  useEffect(() => {
    if (metaAccessToken && !selectedAdAccountId && activeEngine === 'Meta Ads Engine') {
      const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          const accounts = await getMetaAccounts(metaAccessToken!);
          setAdAccounts(accounts);
        } catch (err) {
          console.error("Erro ao buscar contas Meta:", err);
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      fetchAccounts();
    }
  }, [metaAccessToken, selectedAdAccountId, activeEngine]);

  // Auto-save title change
  useEffect(() => {
    if (project && projectTitle !== project.title) {
      const timeout = setTimeout(() => {
        projectService.saveProject({ ...project, title: projectTitle });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [projectTitle, project]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, engineStep]);

  const cn = (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' ');

  const handleEngineClick = (label: string) => {
    setActiveEngine(label);
    if (label === 'Meta Ads Engine') {
      // O usuário quer a dashboard imediatamente ao clicar no estúdio.
      if (!metaAccessToken && !selectedAdAccountId) {
        // Se ainda não estiver conectado no local storage, forçamos o uso do .env 
        localStorage.setItem(`meta_ad_account_${projectId}`, 'env_master');
        setSelectedAdAccountId('env_master');
      }
      setEngineStep('DASHBOARD');
      setChatMessages([
        {
          role: 'assistant',
          type: 'aha_moment',
          content:
            'Conectado ao seu Meta Ads Engine. Deseja que eu analise o ROAS das suas campanhas atuais ou prefere focar em um conjunto específico?',
        },
      ]);
    } else if (label === 'Financeiro') {
      // Se não tem dados do negócio configurados → ir para onboarding
      if (!hasBusinessData(projectId)) {
        setEngineStep('ONBOARDING');
      } else {
        setEngineStep('DASHBOARD');
        setChatMessages([
          {
            role: 'assistant',
            type: 'aha_moment',
            content: 'Aqui está o DRE do seu projeto! Posso calcular quanto você precisa investir para atingir uma meta de EBITDA específica, ou analisar cenários de crescimento. O que prefere?',
          },
        ]);
      }
    } else {
      setEngineStep('SETUP');
      setChatMessages([]);
    }
  };

  const handleOnboardingComplete = (data: BusinessData) => {
    void data; // Persisted via financeService
    setEngineStep('DASHBOARD');
    setChatMessages([
      {
        role: 'assistant',
        type: 'aha_moment',
        content: `Perfil salvo! Já consigo calcular seu DRE em tempo real com base nas campanhas de trafego. Quer que eu rode a análise agora?`,
      },
    ]);
  };

  const handleSetupChoice = (choice: string) => {
    void choice;
    setEngineStep('LOADING');
    setTimeout(() => {
      setEngineStep('CHAT');
      setChatMessages([
        {
          role: 'assistant',
          type: 'aha_moment',
          content:
            "Cruzei seus dados financeiros com o mercado. Você está perdendo margem no Google Ads brigando por termos caros, MAS achei um Oceano Azul.\n\nRecomendação tática: Diminuir o lance de 'sapato feminino' e adicionar R$ 50,00 na long-tail 'sapato feminino vegano'.",
        },
      ]);
    }, 2800);
  };

  const handleMetaConnect = async () => {
    // Como os dados reais estão no .env, não forçamos um popup chato de OAuth no Facebook.
    // Simplesmente acionamos as flags no local storage para abrir a dashboard com sua conta real.
    localStorage.setItem('meta_access_token', 'env_master_token');
    localStorage.setItem(`meta_ad_account_${projectId}`, 'env_master');
    setMetaAccessToken('env_master_token');
    setSelectedAdAccountId('env_master');
    setActiveEngine('Meta Ads Engine');
    setEngineStep('DASHBOARD');
  };

  const handleSelectAdAccount = (accId: string) => {
    setSelectedAdAccountId(accId);
    localStorage.setItem(`meta_ad_account_${projectId}`, accId);
  };

  const handleBackToProject = () => {
    setActiveEngine(null);
    setEngineStep('IDLE');
    setChatMessages([]);
  };

  const sendDirectMessage = async (text: string) => {
    if (!text.trim()) return;
    setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    try {
      const aiResponse = await chatWithAgent(activeEngine || 'Capvi IA', chatMessages, text);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Houve um erro na comunicação com a IA primária. Verifique os logs do console.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    const userMessage = inputText;
    setInputText('');
    sendDirectMessage(userMessage);
  };

  /* ─── Engine tiles definition ─── */
  const engineTiles = [
    { icon: Target, label: 'Meta Ads Engine', color: 'from-blue-600 to-indigo-600' },
    { icon: Search, label: 'Google Ads Engine', color: 'from-orange-500 to-rose-600' },
    { icon: TrendingUp, label: 'Growth Engine', color: 'from-emerald-500 to-teal-600' },
    { icon: Edit3, label: 'Seo Blog', color: 'from-violet-500 to-purple-600' },
    { icon: DollarSign, label: 'Financeiro', color: 'from-yellow-500 to-amber-600' },
    { icon: BarChart2, label: 'Retention Engine', color: 'from-pink-500 to-rose-600' },
    { icon: Radio, label: 'Conteúdo viral', color: 'from-cyan-500 to-sky-600' },
  ];

  /* ─── Chat side panel (reused in both views) ─── */
  const renderChatPanel = (minimal = false) => (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col relative shadow-2xl overflow-hidden',
        minimal ? 'w-full xl:w-[400px] shrink-0' : 'flex-1'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-black text-xl text-white">
            {minimal ? 'IA Especialista' : 'Conversa'}
          </h3>
          {activeEngine && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-in fade-in">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                {minimal ? 'Integrado ao Meta' : activeEngine}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {minimal ? (
            <button
              onClick={handleBackToProject}
              className="p-2 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors"
              title="Voltar ao Projeto"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* IDLE state (only standard view) */}
      {!minimal && engineStep === 'IDLE' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Upload className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display font-black mb-6 text-white tracking-tight">
            Adicione uma fonte <br /> ou inicie um Agente
          </h2>
          <p className="text-sm text-white/40 mb-8 max-w-sm">
            Use o Estúdio ao lado para acionar a inteligência direta no seu projeto.
          </p>
        </div>
      )}

      {/* SETUP state */}
      {!minimal && engineStep === 'SETUP' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
          <div className="bg-[#12121a] border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-display font-black mb-2">Iniciando {activeEngine}...</h2>
            <p className="text-xs text-white/50 mb-8 leading-relaxed">
              Para analisarmos sua campanha, qual é a sua North Star Metric hoje?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSetupChoice('leads')}
                className="w-full relative group bg-white/5 border border-white/10 hover:border-indigo-500/50 p-4 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 rounded-2xl transition-all" />
                <span className="font-bold text-sm text-white relative z-10">Gerar Leads (Volume)</span>
                <ArrowLeft className="w-4 h-4 rotate-180 text-white/30 group-hover:text-indigo-400 relative z-10 transition-colors" />
              </button>
              <button
                onClick={() => handleSetupChoice('sales')}
                className="w-full relative group bg-white/5 border border-white/10 hover:border-indigo-500/50 p-4 rounded-2xl flex items-center justify-between transition-all"
              >
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 rounded-2xl transition-all" />
                <span className="font-bold text-sm text-white relative z-10">Venda Direta / Ecommerce (LTV)</span>
                <ArrowLeft className="w-4 h-4 rotate-180 text-white/30 group-hover:text-indigo-400 relative z-10 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING state */}
      {!minimal && engineStep === 'LOADING' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
          <h2 className="text-lg font-display font-black text-white">Orquestrando Agentes...</h2>
          <p className="text-xs text-white/40 mt-2">Cruzando dados com funil de Growth</p>
        </div>
      )}

      {/* CHAT messages (shared by CHAT and DASHBOARD+minimal) */}
      {(engineStep === 'CHAT' || minimal) && (
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-3 pb-4">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex w-full animate-in slide-in-from-bottom-4 duration-300',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.type === 'aha_moment' ? (
                <div className="bg-[#12121a] border border-indigo-500/30 rounded-[2rem] rounded-tl-sm p-6 max-w-[90%] shadow-[0_4px_40px_rgba(99,102,241,0.1)] relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-[#12121a]">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-display font-black text-[10px] text-indigo-400 uppercase tracking-widest mb-4 ml-2">
                    {minimal ? 'Capvi Monitor' : 'AHA! Moment Capvi'}
                  </h4>
                  <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {minimal ? (
                      <button
                        onClick={() => sendDirectMessage('Quero pausar a campanha agora.')}
                        className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white w-full py-2.5 rounded-xl font-bold text-xs transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Executar Ação
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => sendDirectMessage('Quero aplicar a tática do Oceano Azul sugerida via API. Quais são os próximos passos?')}
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-5 py-3 rounded-full font-black text-xs transition-transform active:scale-95 shadow-lg shadow-green-500/20"
                        >
                          <CheckCircle className="w-4 h-4" /> Aplicar Tática Via API
                        </button>
                        <button
                          onClick={() => sendDirectMessage('Gostei do insight. Vamos discutir ideias de Copy para essa tática, focando na dor do cliente.')}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full font-bold text-xs transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" /> Discutir Copy
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'px-5 py-3 rounded-[1.5rem] max-w-[80%] text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-tr-sm'
                      : 'bg-white/10 border border-white/5 text-white/90 rounded-tl-sm'
                  )}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white/5 border border-white/5 rounded-[1.5rem] rounded-tl-sm px-5 py-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Chat Input */}
      <div className="mt-4 shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="relative bg-white/5 border border-white/10 rounded-[1.5rem] p-2 flex items-center group focus-within:bg-white/10 transition-colors focus-within:border-white/20"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!minimal && engineStep !== 'CHAT'}
            placeholder={minimal ? 'Pergunte sobre as campanhas...' : engineStep === 'CHAT' ? 'Converse com o Agente Especialista...' : 'Aguardando inicialização...'}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm pl-4 py-3 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || (!minimal && engineStep !== 'CHAT')}
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white hover:text-black flex items-center justify-center text-white/40 group-focus-within:bg-indigo-500 group-focus-within:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-1"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
        {!minimal && (
          <p className="text-[9px] text-center text-white/30 mt-3 font-bold tracking-wide uppercase">
            As ações via API exigem confirmação explícita do Gestor.
          </p>
        )}
      </div>
    </div>
  );

  /* ─── RENDER ─── */
  return (
    <div className="w-full text-white animate-in fade-in slide-in-from-bottom-12 duration-1000 h-full flex flex-col">

      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex-shrink-0 group focus-within:border-white/30 transition-all">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
              <img src="/logo-capvi.png" alt="Capvi" className="w-5 h-5 object-contain brightness-0" />
            </div>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-lg text-white/90 p-0 w-auto min-w-[150px] focus:ring-0"
              placeholder="Digite o nome do projeto..."
            />
            {activeEngine === 'Meta Ads Engine' && (
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black tracking-widest text-blue-400 uppercase">
                Meta Ads
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 shrink-0">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full font-bold hover:bg-white/10 transition-colors text-sm text-white/80">
            <Settings className="w-4 h-4" /> Configurações
          </button>
          <div className="bg-white/10 border border-white/20 text-[10px] px-2 py-1 rounded-md font-black tracking-widest text-white/80 ml-1">PRO</div>
        </div>
      </div>

      {/* ── VIEW: Engine Dashboard ── */}
      {activeEngine && engineStep === 'DASHBOARD' ? (
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[70vh] h-[calc(100vh-240px)] animate-in fade-in zoom-in-95 duration-500">
          {activeEngine === 'Meta Ads Engine' ? (
            !selectedAdAccountId ? (
              /* Seletor de Conta */
              <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-[2rem] p-12 overflow-y-auto">
                <Target className="w-16 h-16 text-blue-400 mb-8" />
                <h3 className="text-2xl font-black mb-2">Selecione uma conta de anúncios</h3>
                <p className="text-white/40 mb-10 text-center max-w-md">Vincule uma conta do Meta para importar as métricas reais para o dashboard JAX.</p>
                
                {isLoadingAccounts ? (
                  <Loader2 className="w-10 h-10 animate-spin text-white/20" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    {adAccounts.map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => handleSelectAdAccount(acc.id)}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-white/30 transition-all group"
                      >
                        <span className="block font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{acc.name}</span>
                        <span className="text-[10px] text-white/40 font-black tracking-widest uppercase">ID: {acc.id} • {acc.currency}</span>
                      </button>
                    ))}
                    {adAccounts.length === 0 && <p className="col-span-full text-center text-white/20">Nenhuma conta encontrada.</p>}
                  </div>
                )}
              </div>
            ) : (
              <MetaAdsDashboard 
                onOpenFinance={() => handleEngineClick('Financeiro')} 
                adAccountId={selectedAdAccountId}
                accessToken={metaAccessToken!}
              />
            )
          ) : activeEngine === 'Financeiro' ? (
            <FinanceDashboard projectId={projectId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/5 border border-white/10 rounded-[2rem]">
              <p className="text-white/40">Dashboard para {activeEngine} em desenvolvimento...</p>
            </div>
          )}
          {renderChatPanel(true)}
        </div>
      ) : activeEngine === 'Financeiro' && engineStep === 'ONBOARDING' ? (
        /* ── VIEW: Onboarding ── */
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[70vh] h-[calc(100vh-240px)]">
           <BusinessOnboarding 
             projectId={projectId} 
             onComplete={handleOnboardingComplete} 
           />
           {renderChatPanel(true)}
        </div>
      ) : (
        /* ── VIEW: Padrão 3 Colunas ── */
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[70vh] h-[calc(100vh-240px)]">

          {/* Left: Fontes */}
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

            <div className="flex flex-col gap-3 z-10">
              {/* Meta Ads Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">Meta Ads</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">
                      {metaAccessToken ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => !metaAccessToken ? handleMetaConnect() : handleEngineClick('Meta Ads Engine')}
                    className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20"
                  >
                    {metaAccessToken ? (selectedAdAccountId ? 'Ver Engine' : 'Vincular') : 'Conectar Conta Real'}
                  </button>
                  
                  {!metaAccessToken && (
                    <button 
                      onClick={() => {
                        setSelectedAdAccountId('demo_account');
                        setActiveEngine('Meta Ads Engine');
                        setEngineStep('DASHBOARD');
                      }}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/50 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                      Ver Demo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 text-center opacity-40 mt-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                  <BarChart2 className="w-5 h-5 text-white/50" />
                </div>
                <p className="text-xs font-black mb-2 text-white">Nenhuma fonte ativa</p>
                <p className="text-[10px] px-2 leading-relaxed text-white/60 font-medium">
                  Seus dados aparecerão aqui após a conexão.
                </p>
              </div>
            </div>
          </div>

          {/* Center: Conversa */}
          {renderChatPanel(false)}

          {/* Right: Estúdio */}
          <div className="w-full xl:w-[380px] shrink-0 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 lg:p-8 flex flex-col relative shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-black text-xl text-white">Estúdio</h3>
              <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                <Sidebar className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {engineTiles.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEngineClick(item.label)}
                  className={cn(
                    'flex flex-col items-center gap-3 p-4 border rounded-[1.5rem] transition-all group hover:-translate-y-1 relative overflow-hidden',
                    activeEngine === item.label
                      ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  )}
                >
                  {activeEngine === item.label && (
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-50" />
                  )}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all z-10',
                      activeEngine === item.label
                        ? `bg-gradient-to-br ${item.color} text-white scale-110 shadow-lg`
                        : 'bg-white/5 text-white/50 group-hover:text-white'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] uppercase tracking-wider font-black text-center leading-tight transition-colors z-10',
                      activeEngine === item.label ? 'text-indigo-400' : 'text-white/50 group-hover:text-white'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 px-2">
              <span className="text-3xl mb-6 grayscale opacity-80">✨</span>
              <p className="text-sm font-black mb-3 text-white">O Cérebro Capvi salva suas decisões táticas aqui.</p>
              <p className="text-[11px] leading-loose text-white/60 font-medium">
                Os registros de 'Histórico de Testes e Hipóteses' dos agentes aparecem vinculados à pasta do projeto.
              </p>
            </div>

            <div className="absolute bottom-8 right-8 left-8 flex justify-center">
              <button className="w-full bg-white text-black px-6 py-4 rounded-full font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <Edit3 className="w-4 h-4" /> Adicionar nota
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

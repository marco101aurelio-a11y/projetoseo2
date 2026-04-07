/**
 * BusinessOnboarding.tsx — Formulário de configuração do perfil do negócio
 *
 * Aparece quando o empresário clica no tile "Financeiro" sem ter
 * preenchido COGS / custos fixos / funil ainda.
 *
 * Persiste dados no localStorage via financeService.
 * Após salvar → chama onComplete() para o pai renderizar o DRE.
 */

import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  DollarSign,
  Percent,
  Layers,
  Zap,
  Info,
} from 'lucide-react';
import { saveBusinessData, type BusinessData } from '../services/financeService';
import { getFunnelTypes } from '../services/metaService';

interface BusinessOnboardingProps {
  projectId: string;
  onComplete: (data: BusinessData) => void;
}

type Step = 1 | 2 | 3;

const DEFAULT_COSTS = {
  b2c_ecommerce:           { cogs: 30, shipping: 7,  marketplace: 15, tax: 12 },
  b2c_servico_agendamento: { cogs: 20, shipping: 0,  marketplace: 0,  tax: 15 },
  b2b_servico:             { cogs: 15, shipping: 0,  marketplace: 0,  tax: 15 },
  b2c_infoproduto:         { cogs: 5,  shipping: 0,  marketplace: 9,  tax: 13 },
} as const;

export function BusinessOnboarding({ projectId, onComplete }: BusinessOnboardingProps) {
  const [step, setStep] = useState<Step>(1);
  const [funnelTypes, setFunnelTypes] = useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Formulário
  const [funnelType, setFunnelType] = useState('b2c_ecommerce');
  const [cogsPct, setCogsPct] = useState(30);
  const [fixedCosts, setFixedCosts] = useState(3000);
  const [useCustomRates, setUseCustomRates] = useState(false);
  const [taxRate, setTaxRate] = useState(12);
  const [shippingRate, setShippingRate] = useState(7);
  const [marketplaceFee, setMarketplaceFee] = useState(15);

  useEffect(() => {
    getFunnelTypes().then(setFunnelTypes).catch(() => {
      // Fallback se o backend não estiver rodando
      setFunnelTypes([
        { value: 'b2c_ecommerce', label: 'B2C — E-commerce / Venda Direta' },
        { value: 'b2c_servico_agendamento', label: 'B2C — Serviço com Agendamento' },
        { value: 'b2b_servico', label: 'B2B — Serviço / Consultoria / SaaS' },
        { value: 'b2c_infoproduto', label: 'B2C — Infoproduto / Curso Online' },
      ]);
    });
  }, []);

  // Ao trocar o funil → sugerir os defaults do setor
  const handleFunnelChange = (value: string) => {
    setFunnelType(value);
    const d = DEFAULT_COSTS[value as keyof typeof DEFAULT_COSTS];
    if (d) {
      setCogsPct(d.cogs);
      setShippingRate(d.shipping);
      setMarketplaceFee(d.marketplace);
      setTaxRate(d.tax);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data: BusinessData = {
      projectId,
      funnelType,
      cogsPct: cogsPct / 100,
      fixedCosts,
      taxRate:        useCustomRates ? taxRate / 100        : null,
      shippingRate:   useCustomRates ? shippingRate / 100   : null,
      marketplaceFee: useCustomRates ? marketplaceFee / 100 : null,
      updatedAt: new Date().toISOString(),
    };
    saveBusinessData(data);
    await new Promise((r) => setTimeout(r, 600)); // micro-delay para feedback visual
    setSaving(false);
    onComplete(data);
  };

  const cn = (...c: (string | boolean | undefined | null)[]) => c.filter(Boolean).join(' ');

  /* ── Step indicators ── */
  const stepLabels = ['Modelo de negócio', 'Estrutura de custos', 'Confirmar'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0a0a0f] border border-white/10 rounded-[2rem] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[250px] bg-emerald-500/8 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10 z-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <Layers className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="font-display font-black text-2xl text-white mb-2">Configure seu negócio</h2>
        <p className="text-white/50 text-sm max-w-md">
          O Capvi precisa entender a estrutura financeira do seu negócio para gerar um DRE real.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-10 z-10">
        {stepLabels.map((label, idx) => {
          const s = (idx + 1) as Step;
          const isActive = step === s;
          const isDone = step > s;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all',
                  isDone ? 'bg-emerald-500 text-white' :
                  isActive ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' :
                  'bg-white/5 border border-white/10 text-white/30'
                )}>
                  {isDone ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                <span className={cn('text-[9px] uppercase tracking-widest font-black hidden md:block',
                  isActive ? 'text-white' : 'text-white/30'
                )}>{label}</span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={cn('w-12 h-px transition-all', isDone ? 'bg-emerald-500/60' : 'bg-white/10')} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Modelo de funil ── */}
      {step === 1 && (
        <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-white mb-2">Qual o modelo do seu negócio?</h3>
          <p className="text-white/40 text-sm mb-6">
            Isso define os benchmarks de ROAS, LTV/CAC e a estrutura do funil de vendas.
          </p>
          <div className="flex flex-col gap-3">
            {funnelTypes.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFunnelChange(f.value)}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all group',
                  funnelType === f.value
                    ? 'bg-indigo-500/15 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                )}
              >
                <div>
                  <span className="font-bold text-sm text-white">{f.label}</span>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                  funnelType === f.value ? 'border-indigo-400 bg-indigo-500' : 'border-white/20'
                )}>
                  {funnelType === f.value && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Estrutura de custos ── */}
      {step === 2 && (
        <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-white mb-2">Estrutura de custos do negócio</h3>
          <p className="text-white/40 text-sm mb-6">
            Pré-preenchido com benchmarks do setor. Ajuste os valores reais se souber.
          </p>

          <div className="space-y-4">
            {/* COGS */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center">
                  <Percent className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <label className="font-bold text-sm text-white block">Custo do Produto (COGS)</label>
                  <span className="text-xs text-white/40">% sobre a receita bruta</span>
                </div>
                <span className="ml-auto font-black text-xl text-white">{cogsPct}%</span>
              </div>
              <input
                type="range" min="0" max="80" value={cogsPct}
                onChange={(e) => setCogsPct(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/30 mt-1 font-bold">
                <span>0%</span><span>Benchmark: {DEFAULT_COSTS[funnelType as keyof typeof DEFAULT_COSTS]?.cogs ?? 30}%</span><span>80%</span>
              </div>
            </div>

            {/* Custos Fixos */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <label className="font-bold text-sm text-white block">Custos Fixos Mensais</label>
                  <span className="text-xs text-white/40">Aluguel, pró-labore, plataforma, etc.</span>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">R$</span>
                <input
                  type="number" min="0" step="100" value={fixedCosts}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Taxas avançadas */}
            <button
              onClick={() => setUseCustomRates(!useCustomRates)}
              className="w-full flex items-center gap-3 text-white/40 hover:text-white/70 transition-colors text-sm font-bold"
            >
              <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                useCustomRates ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'
              )}>
                {useCustomRates && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              Personalizar taxas (imposto, frete, marketplace)
              <Info className="w-4 h-4 ml-auto" />
            </button>

            {useCustomRates && (
              <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-300">
                {[
                  { label: 'Imposto %', value: taxRate, set: setTaxRate, color: 'text-violet-400' },
                  { label: 'Frete %', value: shippingRate, set: setShippingRate, color: 'text-blue-400' },
                  { label: 'Marketplace %', value: marketplaceFee, set: setMarketplaceFee, color: 'text-cyan-400' },
                ].map((f) => (
                  <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <label className={`text-[10px] font-black uppercase tracking-wider ${f.color} block mb-2`}>{f.label}</label>
                    <div className="relative">
                      <input
                        type="number" min="0" max="50" step="0.5" value={f.value}
                        onChange={(e) => f.set(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-white/30 pr-6"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-xs">%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirmação ── */}
      {step === 3 && (
        <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-white mb-2">Tudo configurado. Confirme:</h3>
          <p className="text-white/40 text-sm mb-6">
            O Capvi vai usar esses dados como base para todos os cálculos de DRE deste projeto.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            {[
              { label: 'Modelo de negócio', value: funnelTypes.find((f) => f.value === funnelType)?.label ?? funnelType },
              { label: 'Custo do Produto (COGS)', value: `${cogsPct}%` },
              { label: 'Custos Fixos Mensais', value: `R$ ${fixedCosts.toLocaleString('pt-BR')}` },
              useCustomRates && { label: 'Imposto', value: `${taxRate}%` },
              useCustomRates && { label: 'Frete', value: `${shippingRate}%` },
              useCustomRates && { label: 'Marketplace', value: `${marketplaceFee}%` },
            ]
              .filter(Boolean)
              .map((row: any, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/50 text-sm font-medium">{row.label}</span>
                  <span className="font-black text-white text-sm">{row.value}</span>
                </div>
              ))}
          </div>

          <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/60 leading-relaxed">
              Estes dados ficam salvos neste projeto. Você pode alterar a qualquer momento
              clicando em "Configurações" no tile Financeiro.
            </p>
          </div>
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex items-center justify-between w-full max-w-lg mt-8 z-10">
        <button
          onClick={() => step > 1 && setStep((step - 1) as Step)}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-full font-black text-sm text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-full font-black text-sm text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-60"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Salvando...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Gerar meu DRE</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

import { TrendingUp, Wallet, Shield } from 'lucide-react';
import type { DreData } from '../types';
import { cn } from '../lib/utils';

interface ChartProps {
  label: string;
  value: number;
  target: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

const SimpleBarChart: React.FC<ChartProps> = ({ label, value, target, prefix = '', suffix = '', color = 'bg-black' }) => {
  const percentage = Math.min((value / target) * 100, 100);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
         <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
         <span className="text-white font-display font-black text-3xl leading-none">
           {prefix}{value.toLocaleString('pt-BR')}{suffix}
         </span>
      </div>
      <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/20 font-black uppercase tracking-widest">
        <span>0</span>
        <span>META: {prefix}{target.toLocaleString('pt-BR')}{suffix}</span>
      </div>
    </div>
  );
};

const UnitEconomicsBar: React.FC<{ data: DreData }> = ({ data }) => {
  const total = data.receita_bruta;
  const parts = [
    { label: 'COGS', val: data.custos_variaveis.cogs_produto, color: '#000000' }, 
    { label: 'Ads', val: data.investimento_ads, color: '#333333' }, 
    { label: 'Taxas', val: data.custos_variaveis.comissao_mktp, color: '#666666' }, 
    { label: 'Fixos', val: data.custos_fixos, color: '#999999' }, 
    { label: 'Lucro', val: Math.max(0, data.ebitda_final), color: '#cccccc' }, 
  ];

  return (
    <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 group transition-all duration-500 hover:scale-[1.01] hover:bg-white/10">
      <div className="flex items-center justify-between mb-10">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
          <Wallet className="w-5 h-5 opacity-40" />
          Unit Economics (R$ 100 VENDIDOS)
        </h4>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] text-white font-black uppercase tracking-widest">JAX CALIBRADO</span>
        </div>
      </div>
      
      <div className="h-10 w-full flex rounded-full overflow-hidden mb-12 shadow-inner bg-white/10">
        {parts.map((p, i) => {
          const pct = (p.val / total) * 100;
          if (pct <= 0) return null;
          return (
            <div 
              key={i}
              style={{ width: `${pct}%`, backgroundColor: p.color }}
              className="h-full hover:opacity-80 transition-all cursor-help relative group/tooltip"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-black text-white text-[10px] font-black rounded-full opacity-0 group-hover/tooltip:opacity-100 transition-all whitespace-nowrap z-50 shadow-2xl">
                {p.label}: {pct.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
        {parts.map((p, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{p.label}</span>
              <span className="text-sm text-white font-black italic">R$ {((p.val / total) * 100).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WaterfallChart: React.FC<{ data: DreData }> = ({ data }) => {
  const total = data.receita_bruta;
  
  const steps = [
    { label: 'Receita', value: data.receita_bruta, type: 'start' },
    { label: 'Variáveis', value: -(data.custos_variaveis.total), type: 'sub' },
    { label: 'Ads', value: -data.investimento_ads, type: 'sub' },
    { label: 'Fixos', value: -data.custos_fixos, type: 'sub' },
    { label: 'EBITDA', value: data.ebitda_final, type: 'end' },
  ];

  let currentTotal = total;
  const bars = steps.map((step) => {
    let start, end;
    if (step.type === 'start') {
      start = 0;
      end = step.value;
    } else if (step.type === 'end') {
      start = 0;
      end = step.value;
    } else {
      start = currentTotal + step.value;
      end = currentTotal;
      currentTotal += step.value;
    }

    const max = total;
    const top = ((max - Math.max(start, end)) / max) * 100;
    const height = (Math.abs(end - start) / max) * 100;

    return { ...step, top, height, start, end };
  });

  return (
    <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 h-96 flex flex-col group transition-all duration-500 hover:scale-[1.01] hover:bg-white/10">
      <div className="flex items-center justify-between mb-10">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
          <TrendingUp className="w-5 h-5 opacity-40" />
          WATERFALL DE LUCRATIVIDADE
        </h4>
        <Shield size={16} className="text-white/20" />
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-6 px-4 pb-10">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center h-full relative group/bar">
            <div className="absolute -top-8 text-[10px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap">
              {bar.value > 0 ? '+' : ''}{((bar.value / total) * 100).toFixed(0)}%
            </div>

            <div 
              className={cn(
                "w-full rounded-sm transition-all duration-700",
                bar.type === 'start' ? 'bg-white/20' :
                bar.type === 'end' ? (bar.value > 0 ? 'bg-white shadow-[0_20px_40px_rgba(255,255,255,0.15)]' : 'bg-error') :
                'bg-white/10'
              )}
              style={{ 
                height: `${bar.height}%`,
                marginBottom: `${(Math.min(bar.start, bar.end) / total) * 100}%`
              }}
            />

            <div className="absolute -bottom-10 w-full text-center">
               <span className="text-[9px] text-white/40 font-black uppercase tracking-widest truncate max-w-full block group-hover/bar:bg-white group-hover/bar:text-black transition-all">
                 {bar.label}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinancialVisuals: React.FC<{ data: DreData, ebitda_pct: number, roas: number }> = ({ data, ebitda_pct, roas }) => {
  return (
    <div className="space-y-12 mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <WaterfallChart data={data} />
        <UnitEconomicsBar data={data} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-12 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors duration-500">
          <SimpleBarChart 
            label="MARGEM EBITDA OPERACIONAL" 
            value={ebitda_pct} 
            target={25} 
            suffix="%" 
            color="bg-white" 
          />
        </div>
        <div className="p-12 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors duration-500">
          <SimpleBarChart 
            label="ROAS ESTRATÉGICO JAX" 
            value={roas} 
            target={8} 
            color="bg-white" 
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialVisuals;

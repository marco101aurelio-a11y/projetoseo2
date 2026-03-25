import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import type { DreData } from '../types';
import { cn } from '../lib/utils';

interface DRETableProps {
  data: DreData;
}

const DRETable: React.FC<DRETableProps> = ({ data }) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="bg-surface-container-low rounded-[2rem] overflow-hidden">
      <div className="p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-black text-2xl text-black">Demonstrativo Financeiro</h3>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-40">Análise de Fluxo JAX</p>
          </div>
        </div>
        <span className={cn(
          "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
          data.ebitda_final > 0 
            ? 'bg-black text-white' 
            : 'bg-error/10 text-error'
        )}>
          {data.ebitda_final > 0 ? 'STATUS: OPTIMAL' : 'ALERTA DE MARGEM'}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
              <th className="px-10 py-6">Categoria de Ativo</th>
              <th className="px-10 py-6 text-right">Montante (R$)</th>
              <th className="px-10 py-6 text-right">% Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-on-surface/5">
            {/* Receita */}
            <tr className="bg-surface-container-lowest">
              <td className="px-10 py-8 text-black font-extrabold text-lg">Receita Bruta</td>
              <td className="px-10 py-8 text-right text-black font-black text-2xl leading-none">{formatCurrency(data.receita_bruta)}</td>
              <td className="px-10 py-8 text-right text-on-surface-variant font-black opacity-30">100%</td>
            </tr>
            
            {/* Custos Variáveis */}
            <tr className="bg-surface-container-low group hover:bg-surface-container-high transition-colors">
              <td className="px-10 py-6 text-on-surface font-black flex items-center gap-4 text-xs uppercase tracking-widest">
                <Package className="w-4 h-4 opacity-40" />
                CUSTOS VARIÁVEIS
              </td>
              <td className="px-10 py-6 text-right text-black font-bold">-{formatCurrency(data.custos_variaveis.total)}</td>
              <td className="px-10 py-6 text-right text-on-surface-variant font-black text-[10px] opacity-40">
                {((data.custos_variaveis.total / data.receita_bruta) * 100).toFixed(1)}%
              </td>
            </tr>
            
            <tr className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
              <td className="px-16 py-4">└ Impostos e Taxas Operacionais</td>
              <td className="px-10 py-4 text-right">-{formatCurrency(data.custos_variaveis.impostos + data.custos_variaveis.comissao_mktp)}</td>
              <td className="px-10 py-4 text-right">{( ((data.custos_variaveis.impostos + data.custos_variaveis.comissao_mktp) / data.receita_bruta) * 100).toFixed(1)}%</td>
            </tr>
            <tr className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
              <td className="px-16 py-4">└ COGS e Processamento Logístico</td>
              <td className="px-10 py-4 text-right">-{formatCurrency(data.custos_variaveis.cogs_produto + data.custos_variaveis.frete)}</td>
              <td className="px-10 py-4 text-right">{( ((data.custos_variaveis.cogs_produto + data.custos_variaveis.frete) / data.receita_bruta) * 100).toFixed(1)}%</td>
            </tr>

            {/* Margem */}
            <tr className="bg-surface-container-high border-y-0">
              <td className="px-10 py-8 text-black font-black uppercase text-xs tracking-[0.2em]">Margem de Contribuição</td>
              <td className="px-10 py-8 text-right text-black font-black text-2xl">{formatCurrency(data.margem_contribuicao)}</td>
              <td className="px-10 py-8 text-right text-black font-black">
                {((data.margem_contribuicao / data.receita_bruta) * 100).toFixed(1)}%
              </td>
            </tr>

            {/* Custos Fixos */}
            <tr className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
              <td className="px-10 py-6">Estrutura Operacional (Custos Fixos)</td>
              <td className="px-10 py-6 text-right">-{formatCurrency(data.custos_fixos)}</td>
              <td className="px-10 py-6 text-right">
                {((data.custos_fixos / data.receita_bruta) * 100).toFixed(1)}%
              </td>
            </tr>

            {/* EBITDA */}
            <tr className="bg-black text-white">
              <td className="px-10 py-10 font-display font-black text-2xl flex items-center gap-6 leading-none">
                {data.ebitda_final > 0 ? <TrendingUp className="w-10 h-10 opacity-50" /> : <TrendingDown className="w-10 h-10 text-error" />}
                EBITDA FINAL
              </td>
              <td className="px-10 py-10 text-right text-4xl font-display font-black leading-none">{formatCurrency(data.ebitda_final)}</td>
              <td className="px-10 py-10 text-right font-black opacity-40 text-xl italic leading-none">
                {((data.ebitda_final / data.receita_bruta) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DRETable;

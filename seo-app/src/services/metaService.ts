import { supabase } from '../lib/supabase';

const API_BASE = '/api';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
}

// ─── Tipos ───────────────────────────────────────────────

export interface MetaCampanha {
  campaign_id: string;
  nome: string;
  investimento: number;
  impressoes: number;
  cliques: number;
  pedidos: number;
  receita: number;
  leads: number;
  roas: number;
  ctr: number;
  cpc: number;
  frequencia: number;
}

export interface MetaResumo {
  investimento_total: number;
  cliques_total: number;
  impressoes_total: number;
  pedidos_total: number;
  leads_total: number;
  receita_total: number;
  roas_geral: number;
  cac_geral: number;
  ctr_geral: number;
  num_campanhas: number;
}

export interface MetaAnalyzeRequest {
  ad_account_id: string;
  period?: string;             // last_7d | last_30d | last_90d
  funnel_type?: string;
  cogs_pct?: number;
  fixed_costs?: number;
  tax_rate?: number | null;
  shipping_rate?: number | null;
  marketplace_fee?: number | null;
  use_mock?: boolean;
  access_token?: string; // Token real do OAuth
}

export interface MetaAccount {
  id: string;
  name: string;
  currency: string;
  status: number;
}

export interface DiagnosticoAlerta {
  nivel: 'CRITICO' | 'ATENCAO';
  camada: string;
  metrica: string;
  valor: string;
  benchmark: string;
  mensagem: string;
}

export interface EngineResult {
  success: boolean;
  data: {
    metricas_primarias: {
      ctr: number;
      cpc: number;
      taxa_conversao: number;
      cac: number;
      ticket_medio: number;
      roas: number;
    };
    metricas_secundarias: {
      roi_pct: number;
      margem_contribuicao: number;
      margem_contribuicao_pct: number;
      ltv: number;
      ltv_cac_ratio: number;
    };
    dre: {
      receita_bruta: number;
      investimento_ads: number;
      custos_variaveis: {
        total: number;
        impostos: number;
        frete: number;
        comissao_marketplace: number;
        cogs_produto: number;
      };
      margem_contribuicao: number;
      custos_fixos: number;
      ebitda: number;
      ebitda_pct: number;
    };
    engenharia_reversa: {
      para_meta_ebitda_pct: number;
      investimento_necessario: number;
      receita_necessaria: number;
      breakeven_investment: number;
      breakeven_revenue: number;
      gap_atual: number;
    };
    diagnostico: {
      status_geral: 'SAUDAVEL' | 'ESTABILIZANDO' | 'CRITICO';
      health_score: number;
      alertas: DiagnosticoAlerta[];
      prioridade_acao: string | null;
    };
    summary: {
      revenue: number;
      ebitda: number;
      ebitda_pct: number;
      net_margin: number;
      roas: number;
      ltv_cac_ratio: number;
      breakeven: number;
      status: string;
    };
    campanhas_meta?: MetaCampanha[];
    resumo_meta?: MetaResumo;
  };
  error: string | null;
  meta: {
    funnel_type: string;
    funnel_label: string;
    calculado_em: string | null;
    versao: string;
    fonte?: string;
    periodo?: string;
  };
}

// ─── Funções de serviço ───────────────────────────────────

/**
 * Análise completa: Meta Ads → Conector → FinanceEngine → DRE + Diagnóstico
 * Recebe: MetaAnalyzeRequest com dados do negócio
 * Retorna: EngineResult com DRE, métricas e diagnóstico
 */
export async function analyzeMetaAds(req: MetaAnalyzeRequest): Promise<EngineResult> {
  const res = await fetch(`${API_BASE}/finance/analyze/meta`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(await getAuthHeader())
    },
    body: JSON.stringify({
      ad_account_id: req.ad_account_id,
      period: req.period ?? 'last_30d',
      funnel_type: req.funnel_type ?? 'b2c_ecommerce',
      cogs_pct: req.cogs_pct ?? 0.30,
      fixed_costs: req.fixed_costs ?? 3000.0,
      tax_rate: req.tax_rate ?? null,
      shipping_rate: req.shipping_rate ?? null,
      marketplace_fee: req.marketplace_fee ?? null,
      use_mock: req.use_mock ?? false,
      access_token: req.access_token,
    }),
  });
  if (!res.ok) throw new Error(`Meta Ads API error: ${res.status}`);
  return res.json();
}

/**
 * Busca a URL de autorização do Meta no backend
 */
export async function getMetaAuthUrl(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/meta/url`, {
    headers: await getAuthHeader()
  });
  if (!res.ok) throw new Error('Erro ao buscar URL de autenticação');
  const data = await res.json();
  return data.url;
}

/**
 * Troca o code do Meta por um token persistente
 */
export async function exchangeMetaCode(code: string): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/meta/callback?code=${code}`, {
    headers: await getAuthHeader()
  });
  if (!res.ok) throw new Error('Erro ao trocar code por token');
  return res.json();
}

/**
 * Lista as contas de anúncios disponíveis para o token informado
 */
export async function getMetaAccounts(accessToken: string): Promise<MetaAccount[]> {
  const res = await fetch(`${API_BASE}/api/meta/accounts?access_token=${accessToken}`, {
    headers: await getAuthHeader()
  });
  if (!res.ok) throw new Error('Erro ao buscar contas de anúncios');
  const json = await res.json();
  return json.data;
}

/**
 * Busca campanhas brutas da conta Meta (sem DRE — apenas métricas de ads)
 * Recebe: ad_account_id, period
 * Retorna: { campanhas, resumo }
 */
export async function getMetaCampaigns(
  adAccountId: string,
  period = 'last_30d'
): Promise<{ campanhas: MetaCampanha[]; resumo: MetaResumo }> {
  const res = await fetch(
    `${API_BASE}/meta/campaigns/${adAccountId}?period=${period}`,
    { headers: await getAuthHeader() }
  );
  if (!res.ok) throw new Error(`Erro ao buscar campanhas: ${res.status}`);
  const json = await res.json();
  return json.data;
}

/**
 * Lista os modelos de funil disponíveis para o onboarding
 * Retorna: [{ value, label }, ...]
 */
export async function getFunnelTypes(): Promise<{ value: string; label: string }[]> {
  const res = await fetch(`${API_BASE}/finance/funnel-types`, {
    headers: await getAuthHeader()
  });
  if (!res.ok) throw new Error('Erro ao buscar modelos de funil');
  const json = await res.json();
  return json.data;
}

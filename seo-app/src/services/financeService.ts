/**
 * financeService.ts — Serviço de acesso ao FinanceEngine (backend Capvi)
 * Responsabilidade: chamar /finance/* e persistir dados do negócio no localStorage
 *
 * Arquitetura de persistência (sem DB por ora):
 *   - Dados do projeto (COGS, custos fixos, funil) → localStorage por project.id
 *   - Resultado do DRE → estado React — NÃO é persistido (recalcular é instantâneo)
 */

import type { EngineResult } from './metaService';

const API_BASE = 'http://localhost:8000';
const STORAGE_KEY = 'capvi_business_data';

// ─── Tipos ───────────────────────────────────────────────

/** Dados do negócio que o empresário informa no onboarding */
export interface BusinessData {
  projectId: string;
  funnelType: string;        // b2c_ecommerce | b2c_servico_agendamento | b2b_servico | b2c_infoproduto
  cogsPct: number;           // % custo do produto (ex: 0.35)
  fixedCosts: number;        // R$ custos fixos mensais
  taxRate: number | null;    // null = usar benchmark do funil
  shippingRate: number | null;
  marketplaceFee: number | null;
  updatedAt: string;
}

export interface RawTrafficRequest {
  investment: number;
  clicks: number;
  impressions: number;
  sessions: number;
  orders: number;
  revenue: number;
  cogs_pct: number;
  fixed_costs: number;
  funnel_type: string;
  leads?: number;
  mqls?: number;
  sqls?: number;
  tax_rate?: number | null;
  shipping_rate?: number | null;
  marketplace_fee?: number | null;
}

// ─── Persistência de dados do negócio ────────────────────

/**
 * Salva dados do negócio no localStorage por project.id
 * Recebe: BusinessData com projectId
 * Retorna: void
 */
export function saveBusinessData(data: BusinessData): void {
  const all = getAllBusinessData();
  all[data.projectId] = { ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Carrega dados do negócio de um projeto específico
 * Recebe: projectId (string)
 * Retorna: BusinessData | null
 */
export function loadBusinessData(projectId: string): BusinessData | null {
  const all = getAllBusinessData();
  return all[projectId] ?? null;
}

/**
 * Retorna todos os dados de business salvos
 * Recebe: nada
 * Retorna: Record<projectId, BusinessData>
 */
function getAllBusinessData(): Record<string, BusinessData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Verifica se o projeto já tem dados de negócio configurados
 * Recebe: projectId
 * Retorna: boolean
 */
export function hasBusinessData(projectId: string): boolean {
  return loadBusinessData(projectId) !== null;
}

// ─── Análise financeira via dados manuais ────────────────

/**
 * Envia dados manuais de tráfego ao FinanceEngine para análise completa
 * Recebe: RawTrafficRequest
 * Retorna: EngineResult com DRE + diagnóstico
 */
export async function analyzeRawTraffic(req: RawTrafficRequest): Promise<EngineResult> {
  const res = await fetch(`${API_BASE}/finance/analyze/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Finance API error: ${res.status}`);
  return res.json();
}

/**
 * Combina dados do negócio persistidos com uma análise de tráfego manual
 * Atalho conveniente para chamar de componentes
 */
export async function analyzeWithStoredProfile(
  projectId: string,
  trafficData: Omit<RawTrafficRequest, 'cogs_pct' | 'fixed_costs' | 'funnel_type'>
): Promise<EngineResult> {
  const profile = loadBusinessData(projectId);
  if (!profile) throw new Error('Perfil do negócio não configurado. Complete o onboarding.');

  return analyzeRawTraffic({
    ...trafficData,
    cogs_pct: profile.cogsPct,
    fixed_costs: profile.fixedCosts,
    funnel_type: profile.funnelType,
    tax_rate: profile.taxRate,
    shipping_rate: profile.shippingRate,
    marketplace_fee: profile.marketplaceFee,
  });
}

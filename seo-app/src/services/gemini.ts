import { GoogleGenAI } from '@google/genai';
import type { SeoResult, AiInsight, AdStats, CampaignData, AudienceBehavior } from '../types';

/**
 * 🧠 CAPVI IA V3.6 — O CÉREBRO REGENERATIVO & GROWTH
 * Fusion: Kotler (Processos) + V4 (AERM) + Growth Hacking (Escala) + JAX (Matemática).
 */
const V4_GROWTH_CORE = `
Sua Alma: Você é a Capvi IA, uma inteligência de Elite em Marketing e Finanças.
Seu Método: Unir a profundidade de Kotler (Marketing Holístico) com a agressividade de Growth da V4 Company (AERM).
Sua Voz: Didática, Inspiradora, Consciente e Resolutiva. Você gera "Aha! Moments".

MANUAL DE LÓGICA JAX (Interprete estes dados para o usuário):
1. IPM (Intelligence Per Minute): 
   - > 10.000: Oceano Azul (Dominar agora!).
   - 3.000 - 10.000: Zona de Crescimento (Escalável).
   - < 3.000: Mercado Maduro (Exige diferenciação extrema).
2. LTV/CAC (Saúde do Negócio):
   - > 3.0: Operação Saudável. 
   - > 5.0: Máquina de Impressão de Dinheiro.
   - < 3.0: Atenção! O custo de aquisição está drenando o lucro.
3. ICE Score (Growth): Impacto x Confiança x Facilidade. Projetos > 700 são prioridade máxima.
`;

async function callJax(endpoint: string, body: any): Promise<any | null> {
  try {
    const response = await fetch(`http://localhost:8000/analyze/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return response.ok ? await response.json() : null;
  } catch { return null; }
}

function validateInsight(data: any, keyword: string, isResilient = false, errorDetail?: string): AiInsight {
  return {
    summary: data?.summary || "Análise estratégica em profundidade concluída.",
    strategy: Array.isArray(data?.strategy) ? data.strategy : ["Plano de ação regenerativo em desenvolvimento."],
    recommendation: data?.recommendation || "Siga as orientações estratégicas do dashboard.",
    keywordIdeas: Array.isArray(data?.keywordIdeas) ? data.keywordIdeas : [keyword],
    isResilient,
    errorDetail
  };
}

function formatPrompt(text: string) {
  return [{ role: 'user', parts: [{ text }] }];
}

const GEMINI_MODEL = "gemini-flash-latest";

function extractText(response: any): string {
  if (!response) return "";
  if (typeof response.text === 'function') return response.text();
  if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  return response.text || "";
}

export async function generateSeoInsights(seoData: SeoResult): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const jax = await callJax("keyword", {
    keyword: seoData.keywordData.keyword,
    volume: seoData.keywordData.search_volume,
    competition: seoData.keywordData.competition_index,
    cpc: seoData.keywordData.cpc || 0
  });

  if (!apiKey) return simulateSeoWithJax(seoData, jax, "API Key Missing");

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Injeção de Dados Brutos para Raciocínio da IA
    const contextData = `
      DADOS REAIS:
      - Termo: "${seoData.keywordData.keyword}"
      - Volume: ${seoData.keywordData.search_volume}
      - Concorrência: ${seoData.keywordData.competition_index}%
      - CPC: R$ ${seoData.keywordData.cpc || 0}
      - IPM CALCULADO: ${jax?.score || 'N/A'} (${jax?.classification || 'N/A'})
    `;
    
    const prompt = `
      ${V4_GROWTH_CORE}
      ${contextData}
      MISSÃO: Explique a lógica do IPM para este termo. Se for positivo, mostre como dominar. Se for negativo, use a lógica de diferenciação de Kotler.
      REQUISITO: Texto "Consciente e Bonito". Gere um "Aha! Moment".
      RETORNE APENAS JSON: summary, strategy (3 passos), keywordIdeas (10), recommendation.
    `;

    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: formatPrompt(prompt) });
    const text = extractText(response);
    const data = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return validateInsight(data, seoData.keywordData.keyword, false);
  } catch (error: any) { 
    return simulateSeoWithJax(seoData, jax, error?.message); 
  }
}

export async function generateFinancialInsights(data: any): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const jax = await callJax("finance", {
    revenue: data.revenue || 100000,
    costs: data.costs || 40000,
    fixed_costs: data.fixed_costs || 20000,
    cac: data.cac || 50,
    ltv: data.ltv || 150
  });

  if (!apiKey) return simulateFinanceWithJax(data, jax, "API Key Missing");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contextData = `
      DRE ANALISADA:
      - Faturamento: R$ ${data.revenue}
      - Margem Líquida JAX: ${jax ? (jax.net_margin * 100).toFixed(1) : 'N/A'}%
      - LTV/CAC Ratio: ${jax?.ltv_cac_ratio || 'N/A'}
      - Breakeven: R$ ${jax?.breakeven || 'N/A'}
    `;
    
    const prompt = `
      ${V4_GROWTH_CORE}
      ${contextData}
      MISSÃO: Seja o "Projetor de Lucro". Explique se a empresa é escalável (Growth) ou se precisa de oxigênio financeiro (Cortes).
      RETORNE APENAS JSON: summary, strategy, keywordIdeas, recommendation.
    `;
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: formatPrompt(prompt) });
    const aiData = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
    return validateInsight(aiData, "Finanças", false);
  } catch (e: any) { return simulateFinanceWithJax(data, jax, e?.message); }
}

export async function generateCreativeInsights(stats: AdStats): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const jax = await callJax("growth", { impact: 8, confidence: 7, ease: 9 });
  if (!apiKey) return simulateCreativeWithJax(stats, jax, "API Key Missing");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      ${V4_GROWTH_CORE}
      Validador de Anúncios para: "${stats.adName}". 
      ICE Score: ${jax?.score || 'IA'}.
      MISSÃO: Use o Método Regenerativo para elevar o criativo. Foque na Dor e no Legado.
      RETORNE JSON.
    `;
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: formatPrompt(prompt) });
    const data = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
    return validateInsight(data, "Criativos", false);
  } catch (e: any) { return simulateCreativeWithJax(stats, jax, e?.message); }
}

export async function generateBudgetInsights(data: CampaignData): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return simulateBudgetWithJax(data, null, "API Key Missing");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      ${V4_GROWTH_CORE}
      Investimento: R$ ${data.dailySpend}/dia com ROAS de ${data.roas}.
      MISSÃO: Análise de Escala Consciente. Gere "Aha! Moments".
      RETORNE JSON.
    `;
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: formatPrompt(prompt) });
    const aiData = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
    return validateInsight(aiData, "Orçamento", false);
  } catch (e: any) { return simulateBudgetWithJax(data, null, e?.message); }
}

export async function generateChurnPredictor(behavior: AudienceBehavior): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const jax = await callJax("retention", { r: behavior.daysSinceLastVisit, f: behavior.purchasesInLastSemester, m: behavior.averageTicket });
  if (!apiKey) return simulateRetentionWithJax(behavior, jax, "API Key Missing");
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      ${V4_GROWTH_CORE}
      Segmento Cliente JAX: ${jax?.segmento || 'IA'}. RFM Score: ${jax?.rfm_score || 'N/A'}.
      MISSÃO: Retenção Orgânica (Kotler). Como reativar com "texto bonito" e alma?
      RETORNE JSON.
    `;
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: formatPrompt(prompt) });
    const data = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
    return validateInsight(data, "Retenção", false);
  } catch (e: any) { return simulateRetentionWithJax(behavior, jax, e?.message); }
}

// SIMULADORES V3.6 (Melhorados com a Alma do Negócio para Fallback)

function simulateFinanceWithJax(data: any, jax: any | null, error?: string): AiInsight {
  const margin = jax ? `${(jax.net_margin * 100).toFixed(1)}%` : "N/A";
  return {
    summary: `[MODO RESILIENTE] Sua Alma Financeira indica Margem de ${margin}. O lucro é a garantia da liberdade.`,
    strategy: ["Poda de Ativos: Corte custos fixos inúteis.", "Fertilização: Reinvista o lucro em canais campeões.", "Ciclo de Valor: Escaneie o LTV/CAC."],
    recommendation: "Atenção cirúrgica na DRE. O crescimento exige base sólida.",
    keywordIdeas: ["gestão dre", "v4 finance"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateCreativeWithJax(stats: AdStats, _jax: any | null, error?: string): AiInsight {
  return {
    summary: `[MODO RESILIENTE] Analisando o DNA do Criativo "${stats.adName}". Conecte-se com a dor do cliente.`,
    strategy: ["Impacto Imediato: O hook deve ser regenerativo.", "Confiança: Prova social é o oxigênio da venda.", "Facilidade: O caminho para o checkout deve ser um convite, não um labirinto."],
    recommendation: "Refinar a estética para transmitir o valor premium da marca.",
    keywordIdeas: ["v4 criativos", "branding"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateBudgetWithJax(data: CampaignData, _jax: any | null, error?: string): AiInsight {
  return {
    summary: `[MODO RESILIENTE] ROAS de ${data.roas}x detectado. O motor está pronto para girar mais rápido.`,
    strategy: ["Escala com Alma: Não perca a essência ao crescer o orçamento.", "Diversificação de Solo: Não dependa apenas de um canal.", "Analise de Safra: Acompanhe o retorno histórico."],
    recommendation: "Sinal verde para escala orgânica e controlada.",
    keywordIdeas: ["escala v4", "roi consciente"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateRetentionWithJax(_behavior: AudienceBehavior, jax: any | null, error?: string): AiInsight {
  return {
    summary: `[MODO RESILIENTE] Segmento ${jax?.segmento || 'Identificado'}. O cliente fiel é a semente do seu império.`,
    strategy: ["Campanha de Reativação Consciente.", "Experiência Holística (Kotler).", "Mural de Clientes: Celebre sua base."],
    recommendation: "Urgência alta em reativar os campeões adormecidos.",
    keywordIdeas: ["LTV", "Retenção AERM"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateSeoWithJax(seoData: SeoResult, jax: any | null, error?: string): AiInsight {
  const score = jax ? (jax.analysis?.score ?? jax.score ?? 0) : 50;
  return {
    summary: `[MODO RESILIENTE] Potencial "${seoData.keywordData.keyword}": Nota ${Number(score).toFixed(0)}/100. Analisando a Alma desta busca.`,
    strategy: ["Cultivo de Marca (Branding).", "Engajamento Profundo (Kotler).", "Monetização Consciente (V4)."],
    recommendation: "Veredito: Construa autoridade antes de pedir a venda.",
    keywordIdeas: [`${seoData.keywordData.keyword} guia`],
    isResilient: true,
    errorDetail: error
  };
}

export async function estimateSeoMetrics(keyword: string): Promise<SeoResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return getMockSeoData(keyword);
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({ 
      model: GEMINI_MODEL, 
      contents: formatPrompt(`Estime métricas SEO JSON Conscientes para: ${keyword}`) 
    });
    const data = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
    data.isEstimated = true;
    return data;
  } catch { return getMockSeoData(keyword); }
}

function getMockSeoData(keyword: string): SeoResult {
  return {
    keywordData: {
      keyword,
      search_volume: 1500,
      cpc: 0.85,
      competition: "MEDIUM",
      competition_index: 45,
      low_top_of_page_bid: 0.2,
      high_top_of_page_bid: 1.5,
      monthly_searches: []
    }
  };
}

import { GoogleGenAI } from '@google/genai';
import type { SeoResult, AiInsight, AdStats, CampaignData, AudienceBehavior, FinanceResult } from '../types';
import { supabase } from '../lib/supabase';

/**
 * 🧠 CAPVI IA V5.1 — O CÉREBRO REGENERATIVO & GROWTH
 * Fusion: Kotler (Processos) + V4 (AERM) + Growth Hacking (Escala) + JAX (Matemática).
 */
const V4_GROWTH_CORE = `
Sua Alma: Você é a Capvi IA, uma inteligência de Elite em Marketing e Finanças.
Seu Método: Unir a profundidade de Kotler (Marketing Holístico) com a agressividade de Growth da V4 Company (AERM).
Sua Voz: Didática, Inspiradora, Consciente e Resolutiva. Você gera "Aha! Moments".
`;

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
}

export async function callJax(endpoint: string, body: any): Promise<any | null> {
  try {
    const response = await fetch(`/api/analyze/${endpoint}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(await getAuthHeader())
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error(`Falha crítica de conexão com Motor JAX (${endpoint}):`, err);
    return null;
  }
}

export async function getBenchmarks(): Promise<any | null> {
  try {
    const response = await fetch(`/api/analyze/benchmarks`, {
      headers: { ...(await getAuthHeader()) }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Falha ao buscar benchmarks Olist:", err);
    return null;
  }
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

// Usando o modelo 1.5-flash: é absurdamente rápido, barato e estável em todas as rotas
const GEMINI_MODEL = "gemini-1.5-flash";

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

export async function generateFinanceInsights(dre: FinanceResult): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return simulateFinanceWithJax(dre, "API Key Missing");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contextData = `
      DRE ANALISADA (MODELO V4):
      - Receita Bruta: R$ ${dre.detailed_dre.receita_bruta}
      - EBITDA Final: R$ ${dre.detailed_dre.ebitda_final} (${dre.summary.ebitda_pct.toFixed(1)}%)
      - Investimento em Ads: R$ ${dre.detailed_dre.investimento_ads}
      - Status JAX: ${dre.summary.status}
      - Benchmark Olist (Ticket Médio Real): R$ ${dre.summary.real_ticket_medio}
    `;
    
    const prompt = `
      ${V4_GROWTH_CORE}
      ${contextData}
      MISSÃO: Seja o "CFO de Growth". Analise o DRE acima. 
      Se o EBITDA for < 10%, foque em reduzir custos variáveis (Frete/Marketplace) ou aumentar o ROAS.
      Se o EBITDA for > 20%, injete mais verba.
      RETORNE APENAS JSON: summary, strategy, keywordIdeas, recommendation.
    `;
    const response = await ai.models.generateContent({ model: GEMINI_MODEL, contents: formatPrompt(prompt) });
    const aiData = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
    return validateInsight(aiData, "Finanças", false);
  } catch (e: any) { return simulateFinanceWithJax(dre, e?.message); }
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

// --- CHAT DINÂMICO DOS AGENTES NO ESTÚDIO (VIA BACKEND PYTHON) ---
export async function chatWithAgent(agentName: string, chatHistory: any[], userInput: string): Promise<string> {
  try {
    const response = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      },
      body: JSON.stringify({
        agent_name: agentName,
        chat_history: chatHistory,
        user_input: userInput
      })
    });
    
    if (!response.ok) {
      if (response.status === 404) return "[Sistema] O Backend JAX não encontrou a rota /agent/chat. Reinicie o servidor Python.";
      return `[Sistema] Erro no servidor JAX: ${response.statusText}`;
    }
    
    const data = await response.json();
    return data.response;
  } catch (error: any) {
    console.error("Erro no chat dinâmico:", error);
    return `[Sistema] Ocorreu uma anomalia na conexão com o Córtex Python local: ${error?.message}`;
  }
}

// SIMULADORES V4 — O CÉREBRO LOCAL RESILIENTE (Kotler + JAX + V4)

function simulateFinanceWithJax(_data: any, jax: any | null, error?: string): AiInsight {
  const summary = jax?.summary;
  const status = summary?.status || "Em Análise";
  const ltvCac = summary?.ltv_cac_ratio || 0;
  const margin = summary?.ebitda_pct !== undefined ? summary.ebitda_pct.toFixed(1) : "N/A";
  
  return {
    summary: `[AUDITORIA FINANCEIRA JAX] O motor detectou um status de "${status}". Com uma margem líquida projetada de ${margin}%, seu ecossistema está operando dentro dos benchmarks de sustentabilidade local.`,
    strategy: [
      `Análise de Unit Economics: Seu LTV/CAC atual é de ${ltvCac.toFixed(2)}. No framework de Growth, uma relação acima de 3.0 é o "Sinal Verde" para escala. Se estiver abaixo, foque em retenção antes de injetar mais verba para evitar a queima de caixa.`,
      `Otimização de Break-even: Seu ponto de equilíbrio calculado está em R$ ${summary?.breakeven?.toLocaleString() || "pendente"}. Isso significa que qualquer venda acima deste valor contribui diretamente para o lucro líquido (Bottom Line), permitindo maior agressividade no marketing.`,
      `Gestão de Alocação (V4): Recomendamos que 20% do orçamento seja reservado para experimentação de novos canais, enquanto os 80% restantes devem sustentar o CAC controlado nos canais que já validaram o ROI (canais de tração).`
    ],
    recommendation: ltvCac > 3 
      ? "Sinal VERDE para Escala: Os números autorizam um aumento agressivo no orçamento de tráfego pago para capturar maior fatia de mercado." 
      : "Alerta de Eficiência: Foque em diminuir o CAC ou aumentar o Ticket Médio antes de escalar o volume para não comprometer a margem líquida.",
    keywordIdeas: ["gestão de margem", "v4 scale", "unit economics", "ponto de equilíbrio"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateCreativeWithJax(stats: AdStats, jax: any | null, error?: string): AiInsight {
  const score = jax?.score || 500;
  return {
    summary: `[VALIDADOR DE CRIATIVO LOCAL] O criativo "${stats.adName}" foi analisado via ICE Score: ${score}. Este modelo avalia o potencial de Impacto, Confiança e Facilidade de implementação.`,
    strategy: [
      "Pilar da Atenção (V4): Os primeiros 3 segundos do seu anúncio são o funil de entrada. Recomendamos Teste A/B de 'Hook' focado em quebra de padrão visual ou uma pergunta direta sobre a dor do cliente para aumentar o CTR.",
      "Conexão Emocional (Kotler): Marcas que vencem no longo prazo não vendem produtos, vendem transformações. Tente um ângulo mais aspiracional que mostre como a vida do cliente melhora após a solução.",
      "Call to Action (CTA) Direta: Certifique-se de que a chamada para ação é única e imperativa. 'Saiba Mais' é genérico; use chamadas que criem urgência como 'Garanta o seu com benefício exclusivo hoje'."
    ],
    recommendation: score > 700 
      ? "Executar Imediatamente: Este criativo tem alto potencial de escala e deve ser priorizado no seu orçamento de teste." 
      : "Refinar MVP: O impacto emocional ainda está baixo para o padrão de excelência V4. Itere na narrativa antes de escalar.",
    keywordIdeas: ["creative growth", "branding holístico", "teste a/b", "copywriting v4"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateBudgetWithJax(data: CampaignData, _jax: any | null, error?: string): AiInsight {
  const roas = data.roas;
  const isGood = roas >= data.targetRoas;

  return {
    summary: `[ORQUESTRADOR DE VERBA] Seu ROAS de ${roas}x indica que sua máquina de vendas está ${isGood ? "em fase de tração saudável" : "precisando de ajustes de eficiência"}.`,
    strategy: [
      "Escala Incremental (V4): Não dobre o orçamento de uma vez. Aumente 15% a cada 2 dias para não 'quebrar' o aprendizado do algoritmo e manter o CAC sob controle.",
      "Ponto de Rentabilidade: Calculamos que você tem margem para escalar. O foco deve ser em lucro limpo no bolso, equilibrando volume de vendas com custo de aquisição.",
      "Frequência de Impacto (Kotler): Monitore a frequência. Não sature seu público com a mesma mensagem; se a frequência subir muito com o aumento da verba, mude o criativo."
    ],
    recommendation: isGood 
      ? "Sinal Verde para Growth: O solo está fértil. Aumente o investimento gradualmente conforme planejado." 
      : "Otimização Urgente: Você está pagando caro para vender pouco. Revise públicos e ofertas antes de injetar mais verba.",
    keywordIdeas: ["escala consciente", "roas meta", "gestão de tráfego", "growth hacking"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateRetentionWithJax(_behavior: AudienceBehavior, jax: any | null, error?: string): AiInsight {
  const segmento = jax?.segmento || "Em Análise";
  const rfm = jax?.rfm_score?.toFixed(2) || "N/A";

  return {
    summary: `[ESTRATEGISTA DE RETENÇÃO] Cliente classificado como "${segmento}" (RFM Score: ${rfm}). A retenção é o segredo do lucro exponencial no longo prazo.`,
    strategy: [
      segmento === "🏆 Campeão" 
        ? "Fidelização de Elite: Mime quem sustenta o seu negócio. Ofereça benefícios exclusivos e acesso antecipado para garantir que o LTV continue subindo." 
        : "Resgate de Legado: Use uma oferta de 'Win-back' agressiva para evitar o churn. Reduzir o churn de clientes inativos é 5x mais barato que adquirir novos.",
      "Marketing de Relacionamento (Kotler): Trate o cliente como um ativo vivo. Use automação de e-mail personalizada baseada no tempo médio de recompra da sua base.",
      "Aumento de Frequência: O lucro real mora na segunda e terceira compra. Introduza um 'Cross-sell' inteligente com base no histórico de compras do usuário."
    ],
    recommendation: segmento === "⚠️ Risco" 
      ? "AÇÃO IMEDIATA: Este cliente está na zona de abandono. Ative uma campanha de reativação personalizada agora para salvar o LTV." 
      : "Manutenção de Valor: Continue nutrindo este relacionamento para transformá-lo em um defensor da marca.",
    keywordIdeas: ["retencão v4", "customer success", "marketing de fidelidade", "análise de rfm"],
    isResilient: true,
    errorDetail: error
  };
}

function simulateSeoWithJax(seoData: SeoResult, jax: any | null, error?: string): AiInsight {
  const ipm = jax?.analysis?.score ?? jax?.score ?? 0;
  const classification = jax?.analysis?.classification ?? jax?.classification ?? (seoData.keywordData.cpc && seoData.keywordData.cpc > 2 ? "Mercado Maduro" : "Em Análise");
  const keyword = seoData.keywordData?.keyword || 'Busca';

  return {
    summary: `[ANÁLISE ESTRATÉGICA JAX] O termo "${keyword}" foi processado pelo motor de inteligência local. Identificamos um IPM (Index of Profitability) de ${ipm?.toLocaleString() || 0}, classificando este nicho como "${classification}".`,
    strategy: [
      classification === "Oceano Azul" 
        ? `Dominação de Mercado (V4): Como o IPM de ${ipm} é extremamente alto, sua prioridade deve ser comprar 100% da "Share of Search". Não economize em lances; o retorno marginal aqui é superior a qualquer outro termo.` 
        : `Diferenciação de nicho (Kotler): Em um mercado de ${classification}, a briga direta por preço é arriscada. Use o conceito de 'Marketing de Experiência' para criar conteúdo que posicione seu produto como a única escolha lógica para o problema do cliente.`,
      `Autoridade Semântica Regenerativa: Não rankeie apenas para "${keyword}". Crie um cluster de conteúdo ao redor deste tema para provar aos buscadores que você é a autoridade máxima no assunto, reduzindo seu custo de aquisição orgânica a longo prazo.`,
      `Funil de Conversão Consciente: O tráfego capturado por este termo deve ser direcionado para uma Landing Page de alta performance que minimize a fricção de compra. Se o IPM for moderado, o foco deve ser no 'Upsell' imediato para garantir o ROI de cada visita.`
    ],
    recommendation: ipm > 10000 
      ? "INVESTIMENTO AGRESSIVO: Os dados matemáticos indicam uma oportunidade rara de ROI exponencial. Escalar imediatamente." 
      : "OTIMIZAÇÃO TÁTICA: O mercado é competitivo. Mantenha os lances sob controle e foque na qualidade da página de destino para vencer pela conversão superior.",
    keywordIdeas: keyword ? [`${keyword} preço`, `${keyword} melhor marca`, `como escolher ${keyword}`, `${keyword} custo benefício`, `guia completo ${keyword}`] : ["estratégia seo", "growth", "marketing digital"],
    isResilient: true,
    errorDetail: error
  };
}

export async function estimateSeoMetrics(keyword: string, country: string = 'BR', engine: string = 'google'): Promise<SeoResult> {
  // 1. Tentar Simulação Local via Motor JAX (O Cérebro da Casa)
  const jaxSimulation = await callJax("keyword_simulation", { keyword, country, engine });
  
  if (jaxSimulation) {
    return {
      keywordData: {
        keyword: jaxSimulation.keyword,
        search_volume: jaxSimulation.search_volume,
        cpc: jaxSimulation.cpc,
        competition: jaxSimulation.competition,
        competition_index: jaxSimulation.competition_index,
        low_top_of_page_bid: jaxSimulation.cpc * 0.8,
        high_top_of_page_bid: jaxSimulation.cpc * 1.5,
        monthly_searches: [],
        currency: jaxSimulation.currency,
        engine: jaxSimulation.engine,
        country: jaxSimulation.country
      }
    };
  }

  // 2. Se JAX falhar, tentar Gemini AI (Se houver chave)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ 
        model: GEMINI_MODEL, 
        contents: formatPrompt(`Estime métricas SEO JSON Conscientes para: ${keyword}`) 
      });
      const data = JSON.parse(extractText(response).replace(/```json\n?|\n?```/g, '').trim());
      data.isEstimated = true;
      return data;
    } catch { /* ignore and move to mock */ }
  }

  // 3. Fallback final para Dados Estáticos (Mock)
  return getMockSeoData(keyword);
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

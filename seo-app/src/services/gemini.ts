import type { SeoResult, AiInsight } from '../types';

// import { GoogleGenAI } from '@google/genai'; 
// A IMPORTAÇÃO FOI COMENTADA PARA EVITAR GASTO DE TOKENS DURANTE OS TESTES

// Essa função simula uma Inteligência Artificial local fazendo cruzamento lógico dos números
export async function generateSeoInsights(seoData: SeoResult): Promise<AiInsight> {
  // Simulando o tempo de resposta do servidor para manter a animação bonita no Dashboard
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { keyword, search_volume, cpc, competition_index, high_top_of_page_bid } = seoData.keywordData;
  
  // Parâmetros de Decisão "Generativa" Local
  const isHighVolume = search_volume >= 5000;
  const isHighCPC = cpc !== null && cpc >= 1.5;
  const isHighComp = competition_index >= 60;

  // 1. Resumo Analítico Dinâmico
  let summary = `Análise Local da Capvi para o termo "${keyword}": `;
  if (isHighVolume && isHighComp) {
    summary += `Apresenta excelente volume mensal (${search_volume.toLocaleString('pt-BR')} buscas), mas prepare o bolso: o leilão é extremamente disputado (Índice de Concorrência: ${competition_index}/100). `;
  } else if (isHighVolume && !isHighComp) {
    summary += `Oportunidade de Ouro! Volume massivo de ${search_volume.toLocaleString('pt-BR')} buscas com baixa concorrência. Ideal para dominar o topo das pesquisas. `;
  } else if (!isHighVolume && isHighCPC) {
    summary += `Nicho altamente qualificado e restrito. Mesmo com volume menor, o CPC de $${cpc.toFixed(2)} e a disputa comprovam que esses clientes têm forte poder financeiro. `;
  } else {
    summary += `Demanda equilibrada na faixa de ${search_volume.toLocaleString('pt-BR')} cliques. Perfeito para construção estratégica de autoridade. `;
  }
  
  summary += isHighCPC 
    ? `Cuidado: O custo inflacionado exige uma Landing Page de altíssimo padrão para não desperdiçar nenhum visitante.` 
    : `O CPC totalmente acessível viabiliza testes muito agressivos nas campanhas da Meta/Google sem queimar caixa tão rápido.`;

  // 2. Estratégia Tática Dinâmica ("Plano de Ação")
  const strategy = [
    isHighCPC 
      ? `Lances de contenção: Utilize estratégia de 'CPA Desejado' e restrinja a exibição para os horários comerciais onde sua equipe atende, limitando o lance de proteção em $${high_top_of_page_bid?.toFixed(2) || '2.00'} para escapar do topo inflacionado.` 
      : `Lances agressivos: O custo abaixo da média viabiliza que você mire a parcela de impressão de Topo Absoluto (primeiro lugar) para devorar as impressões soltas.`,
    `Refinamento de Copy: Os concorrentes estão usando títulos muito padrões no Google. Crie um Anúncio onde os primeiros 30 caracteres ataquem com exclusividade a dor principal de quem digita "${keyword}".`,
    `Barreira de Confiança: Instale gatilhos de prova social inquestionáveis (depoimentos em vídeo ou logos fortes) na exata entrada da Landing Page para prender o usuário que clicou devido à autoridade.`
  ];

  // 3. Ideias Dinâmicas de Palavras-Chave (Interpolando a Variável)
  const keywordIdeas = [
    `comprar ${keyword}`,
    `melhor ${keyword} 2024`,
    `curso de ${keyword}`,
    `${keyword} vale a pena`,
    `fornecedor de ${keyword}`,
    `${keyword} preço justo`,
    `como funciona ${keyword}?`,
    `alternativa premium para ${keyword}`,
    `${keyword} especialista autorizado`,
    `${keyword} online seguro`
  ];

  // 4. Veredito Definitivo
  let recommendation = "";
  if (isHighComp && isHighCPC) {
    recommendation = "Nicho Tubarões: Valide e otimize conversões em pequenos testes de R$50/dia antes de colocar dinheiro grosso no leilão.";
  } else if (!isHighComp && search_volume > 1000) {
    recommendation = "Oceano Azul: Acelere seu orçamento imediatamente para capturar leads incrivelmente baratos antes que o mercado descubra esse buraco negro cego.";
  } else {
    recommendation = "Estratégia Híbrida: Combine tráfego pago para coleta rápida de dados e jogue forte nos artigos do Blog a longo prazo.";
  }

  return {
    summary,
    strategy,
    keywordIdeas,
    recommendation
  };
}

/* =========================================================================================
   CÓDIGO ORIGINAL DO GEMINI API (SALVO COM SEGURANÇA PARA REATIVAÇÃO EM PRODUÇÃO)
   Quando quiser ligar de novo o custo de tokens, basta apagar a função acima e descomentar a importação.
   =========================================================================================

export async function generateSeoInsights(seoData: SeoResult): Promise<AiInsight> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API key not found in .env. Returning mock insights.");
    return getMockInsights(); // Assumindo que tem a função getMockInsights
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = \`
      Atue como um especialista Sênior em Tráfego Pago e SEO. Analise os seguintes dados Google Ads da palavra-chave pesquisada:
      Palavra-chave alvo: "\${seoData.keywordData.keyword}"
      Volume de busca mensal: \${seoData.keywordData.search_volume.toLocaleString('pt-BR')}
      Custo por clique (CPC): $\${seoData.keywordData.cpc !== null ? seoData.keywordData.cpc.toFixed(2) : 'N/A'}
      Concorrência: Categoria \${seoData.keywordData.competition} (Índice de 0 a 100: \${seoData.keywordData.competition_index})
      Lances para o Topo da Página (Mínimo - Máximo): $\${seoData.keywordData.low_top_of_page_bid !== null ? seoData.keywordData.low_top_of_page_bid.toFixed(2) : 'N/A'} a $\${seoData.keywordData.high_top_of_page_bid !== null ? seoData.keywordData.high_top_of_page_bid.toFixed(2) : 'N/A'}
      
      Analisando APENAS esses números, crie insights estratégicos em formato JSON puramente com os seguintes campos (em português brasileiro):
      1. "summary": Um resumo de 2 frases avaliando o potencial de lucro vs. investimento necessário (baseado na inflação do clique e volume).
      2. "strategy": Um array de strings com exatos 3 passos práticos, técnicos e muito objetivos:
         - Passo 1: Definir o tipo ideal de estrutura de segmentação de campanha ou lance (ex: CPA, correspondência exata, horários).
         - Passo 2: Definir o foco de copy no anúncio, qual dor imediata o título deve atacar.
         - Passo 3: Definir um gatilho essencial para a Landing Page não desperdiçar o clique caso seja caro.
      3. "keywordIdeas": Um array com 10 sugestões de palavras-chave de cauda longa (long tail) ou alta intenção de compra derivadas da raiz "\${seoData.keywordData.keyword}" para baratear o custo por aquisição.
      4. "recommendation": Seu veredito direto e financeiro em 1 frase.
      
      RETORNE APENAS JSON VÁLIDO. Sem código Markdown ou blocos de formatação (\`\`\`).
    \`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = response.text || "";
    const jsonStr = text.replace(/\`\`\`json\n?|\n?\`\`\`/g, '').trim();
    const insights: AiInsight = JSON.parse(jsonStr);

    return insights;
  } catch (error) {
    console.error("Error generating Gemini insights:", error);
    return getMockInsights();
  }
}
*/

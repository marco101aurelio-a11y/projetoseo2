# 🤖 Antigravity — Rules & Workflows
# Capvi SEO | Marco Aurelio
# Versão 1.0 — Gerado como base para configuração no Antigravity

---

# ══════════════════════════════════════════
# PARTE 1 — REGRAS GLOBAIS (nível de conta)
# Cole em: + Global
# Essas regras valem para TODOS os projetos
# ══════════════════════════════════════════

## GLOBAL RULE 1 — Princípios de Arquitetura Limpa
```
Você é um agente de código sênior. Em todos os projetos, siga estes princípios imutáveis:

1. SEPARAÇÃO DE RESPONSABILIDADES: Nunca misture lógica de negócio com interface visual.
   - UI renderiza dados, não os calcula.
   - Serviços buscam dados, não os exibem.
   - Modelos definem estrutura, não comportamento visual.

2. NOMENCLATURA CONSISTENTE:
   - Arquivos de serviço: nomeService.ts ou nome_service.py
   - Componentes React: NomeComponente.tsx (PascalCase)
   - Funções Python: nome_da_funcao() (snake_case)
   - Constantes: NOME_DA_CONSTANTE (SCREAMING_SNAKE_CASE)

3. NUNCA INVENTE DADOS: Se um dado não existe na fonte, retorne null ou erro claro.
   Nunca assuma valores padrão sem documentar explicitamente.

4. DOCUMENTE O QUE CRIA: Toda função nova recebe um comentário explicando
   o que ela faz, o que recebe e o que retorna.

5. ANTES DE CRIAR, VERIFIQUE SE JÁ EXISTE:
   Sempre pergunte ou procure no projeto se já existe algo parecido antes de criar.
```

---

## GLOBAL RULE 2 — Padrão de Comunicação entre Camadas
```
Quando um projeto tiver múltiplas camadas (Frontend + Backend + Motor),
siga sempre este fluxo de dados:

ENTRADA (usuário) → FRONTEND → BACKEND/API → PROCESSAMENTO → RESPOSTA → FRONTEND → EXIBIÇÃO

Regras de fronteira:
- Frontend NUNCA acessa banco de dados ou arquivos diretamente.
- Backend NUNCA toma decisões de UI.
- Motor de cálculo NUNCA formata texto para o usuário final.
- IA generativa NUNCA recebe dados brutos — sempre recebe metadados já processados.

Formato de resposta padrão de APIs:
{
  "success": boolean,
  "data": objeto_ou_null,
  "error": string_ou_null,
  "meta": { "calculado_em": timestamp, "versao": string }
}
```

---

## GLOBAL RULE 3 — Gestão de Erros e Fallbacks
```
Todo projeto deve ter estratégia explícita para falhas externas.

Hierarquia de fallback:
1. Tenta fonte primária (API externa, banco real)
2. Se falhar (4xx, 5xx, timeout): ativa fonte secundária (cache, estimativa)
3. Se ambas falharem: retorna erro claro com mensagem útil para o usuário

Nunca deixe o sistema travar silenciosamente.
Nunca mostre stack trace técnico para o usuário final.
Sempre logue o erro completo internamente.
```

---

## GLOBAL RULE 4 — Documentação Viva (BPMN 2.0)
```
Sempre que uma nova funcionalidade, serviço ou fluxo de dados for criado ou modificado,
gere automaticamente um bloco Mermaid descrevendo o fluxo atualizado.

Formato obrigatório:
- Use graph TD para fluxos verticais
- Use subgraph para agrupar camadas (Frontend, Backend, IA, Motor)
- Nomeie cada nó com o arquivo real onde aquela lógica vive
- Ao final, liste quais arquivos foram afetados

Exemplo de saída esperada após qualquer mudança arquitetural:
"Arquivos modificados: gemini.ts, main_api.py
 Diagrama BPMN atualizado: [bloco mermaid aqui]
 Para visualizar: copie o bloco em draw.io > Extras > Edit Diagram"
```

---

# ══════════════════════════════════════════════════════
# PARTE 2 — REGRAS DE WORKSPACE (nível de projeto)
# Cole em: + Workspace (dentro do projeto Capvi SEO)
# Essas regras valem APENAS para este projeto
# ══════════════════════════════════════════════════════

## WORKSPACE RULE 1 — Identidade do Projeto
```
Este projeto se chama Capvi SEO. É um Acelerador de Lucratividade movido pela Capvi IA.

Estrutura de pastas:
- /seo-app              → Frontend React + Vite + Tailwind (porta 5173)
- /olist-analytics      → Motor JAX em Python + FastAPI (porta 8000)
- /.agent/skills/       → Skills e regras dos agentes de IA
- /Documentos/          → Documentação estratégica e técnica

Arquivos-chave que você deve conhecer:
- seo-app/src/services/gemini.ts         → Integração com Gemini (voz da IA)
- olist-analytics/src/math_jax.py        → Motor matemático JAX (córtex lógico)
- olist-analytics/src/main_api.py        → FastAPI Bridge (sistema nervoso)
- .agent/skills/.agente-mkt/SKIIL mkt.md → Expertise de marketing do agente
```

---

## WORKSPACE RULE 2 — Área de IA (gemini.ts)
```
RESPONSABILIDADE: Definir COMO a IA se comporta tecnicamente.

Regras obrigatórias para esta área:
- O Gemini NUNCA recebe dados brutos do usuário diretamente.
- O fluxo correto é: dados brutos → Motor JAX processa → metadados → Gemini interpreta.
- O systemInstruction deve sempre referenciar o skill.md correspondente.
- Temperatura recomendada: 0.3 para análise, 0.7 para redação criativa.
- Sempre trate o erro 429 (quota) ativando o Modo Estimativa Inteligente.

Quando modificar gemini.ts, atualize também:
1. O diagrama BPMN em arquitetura_cerebro.md
2. O skill correspondente em .agent/skills/ se a instrução mudou
3. Gere o bloco Mermaid atualizado para importar no draw.io
```

---

## WORKSPACE RULE 3 — Área de Skills (.agent/skills/)
```
RESPONSABILIDADE: Definir o CONHECIMENTO e as REGRAS DE NEGÓCIO dos agentes.

Estrutura obrigatória de cada skill:
- Seção de identidade (quem é o agente)
- Seção de frameworks (V4, ROPRE, GUT, etc.)
- Seção de benchmarks (dados calibrados com Olist BR)
- Seção de memória (como o agente mantém estado)
- Seção de protocolos (como o agente age em cada situação)

Regras de manutenção:
- Benchmarks numéricos devem ter fonte declarada (ex: "Olist BR, 8k sellers")
- Nunca hardcode valores sem comentar de onde vieram
- Quando benchmarks do Colab forem atualizados, atualizar o skill correspondente
- Cada skill deve ser independente — não referenciar outros skills diretamente
```

---

## WORKSPACE RULE 4 — Área de UX/Interface (src/components/)
```
RESPONSABILIDADE: Como o usuário VÊ e INTERAGE com o sistema.

Regras obrigatórias:
- Componentes recebem dados prontos via props — nunca fazem cálculos.
- Todo estado de loading deve ter feedback visual (spinner, skeleton, mensagem).
- Todo erro deve ser exibido de forma legível, nunca como objeto técnico.
- Paleta de cores e tipografia: seguir o padrão já definido em index.css.
- Novos componentes seguem o padrão dos existentes em src/components/.

Hierarquia de componentes:
Dashboard.tsx     → container principal, orquestra os outros
├── Sidebar.tsx   → navegação
├── Auth.tsx      → autenticação
└── [novo].tsx    → sempre filho de Dashboard, nunca independente
```

---

## WORKSPACE RULE 5 — Área de Backend/Serviços (src/services/)
```
RESPONSABILIDADE: Buscar dados externos e persistir estado.

Arquivos existentes e suas funções:
- dataForSeo.ts      → busca palavras-chave reais (com fallback para estimativa)
- projectService.ts  → gerencia projetos e salvamento local
- gemini.ts          → EXCLUSIVO para IA (não misture com outros serviços)

Regras obrigatórias:
- Todo serviço que chama API externa DEVE ter timeout definido (máx 10s)
- Todo serviço DEVE ter fallback documentado para quando a API falhar
- Nunca exponha API keys no código — sempre use variáveis de ambiente
- Formato de retorno: sempre use o padrão { success, data, error, meta }
```

---

## WORKSPACE RULE 6 — Área de Analytics Engine (olist-analytics/)
```
RESPONSABILIDADE: Cálculos matemáticos que JavaScript não resolve com precisão.

Regras obrigatórias:
- Toda lógica matemática (RFM, Z-Score, IPM, V4 Score) FICA em Python, nunca em TS.
- Use JAX (jnp) ao invés de numpy sempre que possível para aproveitar JIT compilation.
- O servidor FastAPI roda SEMPRE na porta 8000.
- Todo endpoint novo deve seguir o padrão REST: GET para leitura, POST para cálculo.
- Benchmarks do Olist ficam em /olist-analytics/dados/benchmarks_v4.json

Pipeline obrigatório para novos cálculos:
1. Cria função em math_jax.py com @jax.jit
2. Expõe endpoint em main_api.py
3. Adiciona tipo TypeScript em seo-app/src/types/
4. Consome no serviço correto em seo-app/src/services/
5. Atualiza arquitetura_cerebro.md com novo fluxo
```

---

# ══════════════════════════════════════════════════════
# PARTE 3 — WORKFLOWS
# Cole em: aba Workflows no Antigravity
# ══════════════════════════════════════════════════════

## WORKFLOW 1 — start-dev
```
Nome: start-dev
Descrição: Liga todos os motores do Capvi SEO

Passos:
1. Abre terminal 1:
   cd olist-analytics
   ../.venv/bin/python src/main_api.py

2. Abre terminal 2:
   cd seo-app
   npm run dev

3. Verifica se as portas estão ativas:
   - Motor JAX: http://localhost:8000/docs
   - Frontend:  http://localhost:5173

4. Confirma: "✅ Capvi SEO iniciado. Motor JAX na 8000, Frontend na 5173."
```

---

## WORKFLOW 2 — add-metric
```
Nome: add-metric
Descrição: Adiciona nova métrica ao Motor JAX de forma completa e consistente
Trigger: "adicionar métrica [nome]" ou "nova métrica [nome]"

Passos:
1. Pergunta: "Qual o nome da métrica e o que ela calcula?"
2. Cria função em olist-analytics/src/math_jax.py com @jax.jit
3. Expõe endpoint POST em olist-analytics/src/main_api.py
4. Cria interface TypeScript em seo-app/src/types/metrics.ts
5. Adiciona chamada em seo-app/src/services/analyticsService.ts
6. Gera bloco Mermaid com o novo fluxo e instrui a importar no draw.io
7. Atualiza arquitetura_cerebro.md com o novo componente
8. Confirma: "✅ Métrica [nome] criada em 5 arquivos. Diagrama atualizado."
```

---

## WORKFLOW 3 — update-skill
```
Nome: update-skill
Descrição: Atualiza um skill com novos benchmarks ou regras
Trigger: "atualizar skill [nome]" ou "novo benchmark [dado]"

Passos:
1. Pergunta: "Qual skill atualizar? (mkt / explica / designer)"
2. Pergunta: "O que muda? (novo benchmark / nova regra / novo framework)"
3. Localiza o arquivo em .agent/skills/[nome]/SKIIL [nome].md
4. Aplica a atualização na seção correta (benchmarks / regras / memória)
5. Adiciona comentário com data e fonte do dado atualizado
6. Confirma: "✅ Skill [nome] atualizado. Seção [x] modificada."
```

---

## WORKFLOW 4 — update-architecture
```
Nome: update-architecture
Descrição: Qualquer mudança arquitetural gera documentação atualizada automaticamente
Trigger: Sempre que gemini.ts, main_api.py ou math_jax.py forem modificados

Passos:
1. Detecta qual camada foi modificada (IA / Motor / Bridge / Frontend)
2. Gera bloco Mermaid atualizado refletindo o novo fluxo
3. Atualiza a seção correspondente em arquitetura_cerebro.md
4. Atualiza a tabela de componentes em business_soul_and_processes.md
5. Exibe mensagem:
   "📐 Arquitetura atualizada.
    Arquivos modificados: [lista]
    Para visualizar no draw.io:
    1. Acesse draw.io
    2. Extras > Edit Diagram
    3. Cole o bloco abaixo:
    [bloco mermaid gerado]"
```

---

## WORKFLOW 5 — debug-flow
```
Nome: debug-flow
Descrição: Diagnóstico rápido quando algo não funciona
Trigger: "não está funcionando", "erro em", "debug [componente]"

Passos:
1. Pergunta: "Qual área tem problema? (Frontend / Motor JAX / Gemini / Conexão)"
2. Verifica se os serviços estão rodando (portas 8000 e 5173)
3. Testa o endpoint específico com curl ou fetch
4. Identifica se o erro é: conexão / dados / lógica / API externa
5. Propõe correção cirúrgica apenas no arquivo correto
6. Confirma qual arquivo foi modificado e por quê
```

---

# ══════════════════════════════════════════════════════
# GUIA DE IMPLEMENTAÇÃO — Como configurar no Antigravity
# ══════════════════════════════════════════════════════

## Ordem de implementação sugerida

Primeiro implemente as Regras Globais (1 a 4) clicando em "+ Global".
Elas estabelecem a base que vai funcionar em qualquer projeto seu no futuro.

Depois implemente as Regras de Workspace (1 a 6) clicando em "+ Workspace"
dentro do projeto "projeto Seo". Elas dão ao agente o mapa completo do Capvi.

Por último configure os Workflows. Comece pelo start-dev (vai usar todo dia)
e pelo update-architecture (vai economizar mais tempo).

## Uma ideia para o futuro

Cada área do project_structure_guide pode virar um Workspace separado:
- Workspace "Capvi IA"       → Rules 1 e 2 de Workspace + Workflow update-skill
- Workspace "Capvi Analytics"→ Rule 6 de Workspace + Workflow add-metric
- Workspace "Capvi UX"       → Rule 4 de Workspace

Por enquanto, um único Workspace com todas as regras é suficiente
e mais fácil de manter para um projeto de 5 dias.
```

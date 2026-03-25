---
trigger: glob
globs: seo-app/src/services/gemini.ts
---

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
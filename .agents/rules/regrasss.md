---
trigger: glob
globs: seo-app/src/services/*.ts
---

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
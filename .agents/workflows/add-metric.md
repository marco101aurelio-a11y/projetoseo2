---
description: Adiciona nova métrica ao Motor JAX de forma completa e consistente
---

Trigger: "adicionar métrica [nome]" ou "nova métrica [nome]"

Passos:
1. Pergunta: "Qual o nome da métrica e o que ela calcula?"
2. Cria função em olist-analytics/src/math_jax.py com @jax.jit
3. Expõe endpoint POST em olist-analytics/src/main_api.py
4. Cria interface TypeScript em seo-app/src/types/metrics.ts
5. Adiciona chamada em seo-app/src/services/analyticsService.ts
6. Gera bloco Mermaid com o novo fluxo e instrui a importar no draw.io
7. Atualiza `capvi_master_docs.md` com o novo componente
8. **Atualiza SKIIL mkt 2 .md**: Documenta a lógica da nova métrica para os Agentes de IA.
9. Validação Cruzada: Verifica se a métrica afeta outros motores (ex: Nova métrica SEO afeta o Finance?).
10. Confirma: "✅ Métrica [nome] criada em 6 arquivos. IA e Documentação atualizadas."
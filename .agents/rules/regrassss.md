---
trigger: glob
globs: olist-analytics/src/**/*.py
---

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
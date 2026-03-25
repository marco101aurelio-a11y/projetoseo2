---
description: Qualquer mudança arquitetural gera documentação atualizada automaticamente 
---

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
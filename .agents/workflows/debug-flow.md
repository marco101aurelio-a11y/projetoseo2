---
description: Diagnóstico rápido quando algo não funciona
---

Trigger: "não está funcionando", "erro em", "debug [componente]"

Passos:
1. Pergunta: "Qual área tem problema? (Frontend / Motor JAX / Gemini / Conexão)"
2. Verifica se os serviços estão rodando (portas 8000 e 5173)
3. Testa o endpoint específico com curl ou fetch
4. Identifica se o erro é: conexão / dados / lógica / API externa
5. Propõe correção cirúrgica apenas no arquivo correto
6. Confirma qual arquivo foi modificado e por quê
---
description: Validação 100% — Checagem de Saúde do Frontend e Motor JAX
---
Este comando garante que o projeto está livre de erros antes do build ou de encerrar o dia.

### 1. Validar Frontend (Types & Lint)
// turbo
No terminal `seo-app`, execute:
```bash
npm run validate
```
*Se retornar 0 erros, o front está saudável.*

### 2. Validar Comunicação JAX
// turbo
Verifique se a Ponte JAX está respondendo:
```bash
curl -I http://localhost:8000/
```
*Se retornar 200 OK, o motor matemático está online.*

---
**Resultado Esperado:** Se ambos passarem, o projeto está 100% pronto para subir.

# 💻 Capvi SEO — Frontend

Este é o frontend do acelerador de lucratividade Capvi SEO, construído com **React**, **Vite**, **TypeScript** e **Tailwind CSS**.

## 🚀 Como Iniciar (Desenvolvimento Local)

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O app estará disponível em `http://localhost:5173`.

---

## 🔗 Conexão com o Backend (Motor JAX)

O frontend se comunica com o Motor JAX (Python/FastAPI) que, por padrão, roda na porta **8000**.

A configuração da URL da API fica no arquivo:
`src/services/gemini.ts`

```typescript
// Exemplo de chamada
const response = await fetch(`http://127.0.0.1:8000/analyze/${endpoint}`, { ... });
```

---

## 🌐 Acesso em Outros Dispositivos (Rede Local)

Se você quiser abrir o Capvi SEO em outro computador, tablet ou celular na mesma rede:

### 1. Descubra seu IP Local
No terminal do seu computador principal (Mac):
```bash
ipconfig getifaddr en0
```
*(Exemplo de retorno: 192.168.1.15)*

### 2. Prepare o Backend (Motor JAX)
O backend já está configurado para aceitar conexões externas (`host="0.0.0.0"`). Apenas garanta que ele esteja rodando.

### 3. Exponha o Frontend
Rode o frontend com a flag `--host`:
```bash
npm run dev -- --host
```
Isso permitirá que outros dispositivos acessem o Vite via seu IP.

### 4. Atualize a URL da API no Frontend
No arquivo `src/services/gemini.ts`, troque `127.0.0.1` pelo seu **IP Local**:
```typescript
// Mude de:
// http://127.0.0.1:8000/analyze/
// Para:
const response = await fetch(`http://192.168.1.15:8000/analyze/${endpoint}`, { ... });
```

### 5. Acesse no outro dispositivo
Abra o navegador no celular/outro PC e digite:
`http://192.168.1.15:5173`

> [!TIP]
> **Dica de Produção:** Futuramente, você pode usar um arquivo `.env` com a variável `VITE_JAX_API_URL` para facilitar essa troca sem mexer no código core.

# Capvi IA: Marketing & Financial Intelligence 🧠💎

Este projeto é uma plataforma de inteligência regenerativa que une **Kotler**, **V4 Company (AERM)** e **Growth Hacking**. O sistema utiliza um motor matemático em **JAX** (Python) e um cérebro de IA baseado no **Gemini 2.5/Flash-Latest**.

## 🚀 Guia de Configuração (Novo Computador)

Siga estes passos para deixar o app funcional em qualquer máquina:

### 1. Clonar o Repositório
No terminal do novo computador:
```bash
git clone <url-do-seu-repositorio>
cd "projeto Seo"
```

### 2. Configurar o Frontend (React)
Navegue até a pasta do app e instale as dependências:
```bash
cd seo-app
npm install
```

**⚠️ Importante: Chaves de API**
Como o arquivo `.env` está no `.gitignore` por segurança, você deve criá-lo manualmente na pasta `seo-app/`:
1. Crie um arquivo chamado `.env`.
2. Adicione suas chaves:
```env
VITE_GEMINI_API_KEY=Sua_Chave_Gemini_Aqui
VITE_DATAFORSEO_LOGIN=seu_login
VITE_DATAFORSEO_PASSWORD=sua_senha
```

### 3. Configurar o Motor Matemático (JAX Backend)
O "coração" dos cálculos roda em Python 3.10+. Para ligar manualmente em uma nova máquina:

1. **Vá para a pasta do motor:**
   ```bash
   cd olist-analytics-local
   ```

2. **Crie um ambiente virtual (Recomendado):**
   ```bash
   python3 -m venv .venv
   ```

3. **Ative o ambiente:**
   - No Mac/Linux: `source .venv/bin/activate`
   - No Windows: `.venv\Scripts\activate`

4. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```
   *Se o `pip` não for encontrado, tente `python3 -m pip install -r requirements.txt`.*

5. **Inicie o servidor de API:**
   ```bash
   python3 src/main_api.py
   ```
   *O backend estará rodando em `http://0.0.0.0:8000`. Ele já está configurado para aceitar conexões de outros dispositivos na mesma rede.*

---

### 🌐 Acesso em Outros Dispositivos (Rede Local)
Para abrir o app em outro celular/PC na mesma rede:
1. **Frontend:** Rode `npm run dev -- --host` na pasta `seo-app`.
2. **API:** No arquivo `seo-app/src/services/gemini.ts`, troque `127.0.0.1` pelo **IP Local** da sua máquina principal.
3. **Acesse:** Use o IP mostrado no terminal (ex: `http://192.168.1.15:5173`).

### 4. Rodar o Aplicativo
Com o backend Python rodando na porta **8000**, inicie o frontend:
```bash
# Na pasta seo-app
npm run dev
```
Abra o link exibido no terminal (ex: http://localhost:5173).

---
## 🛠️ Tecnologias Utilizadas
- **Frontend**: Vite + React + Tailwind + Lucide Icons.
- **AI Core**: Google Gemini AI (@google/genai).
- **Engine Matemática**: Google JAX (High-performance numerical computing).
- **Metodologia**: V4 AERM, Kotler e Growth Hacking.

## 📦 O que subir para o Git?
Apenas os arquivos de código e configuração. O "lixo" (datasets pesados, vídeos e node_modules) já está sendo ignorado pelo nosso `.gitignore` atualizado na V3.6.

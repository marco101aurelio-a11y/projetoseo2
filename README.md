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
O "coração" dos cálculos roda em Python. Certifique-se de ter o Python 3.10+ instalado.
1. Vá para a pasta do analytics (fora do seo-app).
2. Instale as dependências:
```bash
pip install jax jaxlib fastapi uvicorn
```
3. Inicie o servidor local:
```bash
python main_api.py
```

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

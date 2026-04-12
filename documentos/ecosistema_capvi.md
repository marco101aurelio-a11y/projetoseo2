# Ecossistema Capvi SEO — BPMN 2.0 (Mermaid)
Este documento descreve o fluxo completo do ecossistema Capvi SEO, incluindo as atualizações recentes de integração financeira e Meta Ads.

## Diagrama de Fluxo (BPMN)

```mermaid
graph TD
    subgraph Frontend ["Camada de Interface (React + Vite)"]
        UI_Dash["Dashboard (Overview)"]
        UI_Studio["Estúdio de SEO/Finanças"]
        UI_Wizard["Wizard de Onboarding (3 Passos)"]
        UI_Chat["Capvi IA Chat (Voz do Gemini)"]
    end

    subgraph API_Bridge ["Camada Nervosa (FastAPI Bridge)"]
        R_Meta["/finance/analyze/meta"]
        R_Raw["/finance/analyze/raw"]
        R_Profile["/api/v1/finance/profile"]
        R_Chat["/agent/chat"]
    end

    subgraph Persistence ["Camada de Persistência (SQLAlchemy)"]
        DB_Profile["BusinessProfile (COGS, Fixed Costs, Tax)"]
        DB_Records["FinancialRecords (Faturamento Real)"]
    end

    subgraph External ["Serviços Externos"]
        Meta_API["Meta Marketing API (Facebook/Instagram)"]
        GA4["Google Analytics 4 (Em breve)"]
    end

    subgraph Processing ["Motor Inteligente (JAX + Python)"]
        direction TB
        Meta_Service["MetaAdsService (Coleta metrics)"]
        Connector["MetaToFinanceConnector (Normalização)"]
        
        subgraph JAX_Core ["Córtex Matemático (JAX @jit)"]
            J_Raw["TrafficRawData (Objeto de entrada)"]
            J_Engine["FinanceEngine v2.0"]
            J_Primary["_calc_primary_metrics (CTR, CPC, ROAS)"]
            J_Secondary["_calc_secondary_metrics (EBITDA, LTV, MC)"]
            J_Reverse["_reverse_engineer_targets (Target ROI)"]
            J_Models["Funnel Models (Benchmarks B2B/B2C)"]
        end
        
        S_Agent["AgentSquadOrchestrator (IA Manager)"]
        S_Gemma["GemmaHandler (Contexto IA)"]
    end

    %% Fluxo de Dados Meta
    UI_Dash --> R_Meta
    R_Meta --> Meta_Service
    Meta_Service --> Meta_API
    Meta_API -- "Insights Brutos" --> Meta_Service
    Meta_Service --> Connector
    
    %% Fluxo de Persistência e Blended Revenue
    R_Meta --> DB_Profile
    R_Meta --> DB_Records
    DB_Profile -- "Configurações" --> Connector
    DB_Records -- "Verdade Financeira (Opcional)" --> Connector
    
    %% Fluxo JAX
    Connector -- "Cria TrafficRawData" --> J_Raw
    J_Raw --> J_Engine
    J_Engine --> J_Models
    J_Engine --> J_Primary
    J_Primary --> J_Secondary
    J_Secondary --> J_Reverse
    
    %% Retorno do Processamento
    J_Reverse -- "DRE + Diagnóstico" --> R_Meta
    R_Meta -- "Response (DRE Table + Health Score)" --> UI_Dash

    %% Fluxo IA Chat
    UI_Chat --> R_Chat
    R_Chat --> S_Agent
    S_Agent --> S_Gemma
    S_Gemma -- "Insight Contextualizado" --> UI_Chat

    %% Estilo
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef processing fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef jax fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;
    classDef external fill:#eceff1,stroke:#263238,stroke-width:2px;

    class UI_Dash,UI_Studio,UI_Wizard,UI_Chat frontend;
    class R_Meta,R_Raw,R_Profile,R_Chat api;
    class Meta_Service,Connector,S_Agent,S_Gemma processing;
    class J_Raw,J_Engine,J_Primary,J_Secondary,J_Reverse,J_Models jax;
    class Meta_API,GA4 external;
```

### Arquivos Afetados e Responsabilidades
1.  **`seo-app/`**: Interface visual e consumo de API.
2.  **`olist-analytics-local/src/main_api.py`**: Orquestrador central e roteamento.
3.  **`olist-analytics-local/src/engines/finance_engine.py`**: Lógica matemática de alta performance (JAX).
4.  **`olist-analytics-local/src/engines/funnel_models.py`**: Definição de benchmarks por tipo de negócio.
5.  **`olist-analytics-local/src/services/meta_ads_service.py`**: Integração com a API da Meta.
6.  **`olist-analytics-local/src/connectors/meta_to_finance_connector.py`**: Ponte entre marketing e financeiro.
7.  **`olist-analytics-local/src/database/`**: Persistência de configurações e histórico.

---
*Gerado automaticamente pelo Agente Capvi conforme GLOBAL RULE 4.*

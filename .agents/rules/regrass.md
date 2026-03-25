---
trigger: glob
globs: seo-app/src/components/**/*.tsx
---

RESPONSABILIDADE: Como o usuário VÊ e INTERAGE com o sistema.

Regras obrigatórias:
- Componentes recebem dados prontos via props — nunca fazem cálculos.
- Todo estado de loading deve ter feedback visual (spinner, skeleton, mensagem).
- Todo erro deve ser exibido de forma legível, nunca como objeto técnico.
- Paleta de cores e tipografia: seguir o padrão já definido em index.css.
- Novos componentes seguem o padrão dos existentes em src/components/.

Hierarquia de componentes:
Dashboard.tsx     → container principal, orquestra os outros
├── Sidebar.tsx   → navegação
├── Auth.tsx      → autenticação
└── [novo].tsx    → sempre filho de Dashboard, nunca independente
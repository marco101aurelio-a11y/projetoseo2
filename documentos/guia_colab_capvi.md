# 📘 Guia: Refinando Dados no Google Colab (Capvi SEO)

Este guia ensina como usar o poder do Python e do motor JAX para transformar suas planilhas brutas em inteligência de negócio.

---

## 1. Preparação do Ambiente
1. Acesse o [Google Colab](https://colab.research.google.com/).
2. Clique em **Novo Notebook** (Botão azul ou no menu lateral).
3. **IMPORTANTE:** Não use "Fazer upload de notebook" com o arquivo `.py`, pois isso gera erro de sintaxe no Colab.
4. **Copie todo o código** do arquivo `colab_jax_refinery.py` e **cole** na primeira célula do seu novo notebook.

## 2. Fazendo o Upload das Planilhas
No menu lateral esquerdo do Colab, clique no ícone de **Pasta** 📁 e arraste os seguintes arquivos:
- `olist_order_items_dataset.csv`
- `olist_products_dataset.csv`
- `olist_customers_dataset.csv`

> [!IMPORTANT]
> Aguarde a barra circular de progresso completar antes de rodar o código. Se o Colab reiniciar, você precisará subir os arquivos novamente.

## 3. Rodando o Refinamento
Para processar os dados e ver as métricas reais, execute o seguinte comando em uma nova célula:

```python
# Importa as funções se necessário
from colab_jax_refinery import refinar_dados_olist, simular_escala

# Executa o refinamento nos seus arquivos
resultados = refinar_dados_olist(
    'olist_order_items_dataset.csv', 
    'olist_products_dataset.csv', 
    'olist_customers_dataset.csv'
)

# Se os dados foram carregados, simule uma escala com o ticket médio real
if resultados:
    simular_escala(
        investimento=5000, 
        cac_alvo=45, 
        ltv_estimado=resultados['ticket_medio'] * 3 # Exemplo: LTV como 3x o Ticket Médio
    )
```

## 4. O que o script faz por você?
- **Limpeza:** Remove linhas com preços nulos ou dados corrompidos.
- **Cruzamento (Merge):** Une a tabela de itens com a de produtos para identificar quais categorias performam melhor.
- **Cálculo de Performance:** Usa o JAX para calcular instantaneamente o Ticket Médio e o Faturamento Total.

## 5. Próximos Passos: Alimentando a Capvi IA
Após validar os dados no Colab, o seu "Cérebro" de dados estará calibrado. 
- **O que acontece agora:** Estes novos valores de Ticket Médio e RFM não são apenas para um painel; eles servem como a **Base de Conhecimento** para os agentes de IA.
- **Inteligência Cruzada:** Quando um usuário pesquisar algo, a IA vai cruzar esses seus dados reais com métricas externas (Volume de buscas, CPL, etc.) para gerar estratégias de lucro precisas.

---
*Gerado por Capvi IA - Acelerador de Lucratividade.*

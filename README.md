# NuCel Pro Tracker v3.0

Portal de gestão de projetos operacionais do time NuCel — Nubank.

## Estrutura

```
nucel-pro-tracker/
├── public/
│   ├── index.html      ← Portal completo
│   ├── style.css       ← Identidade visual Nubank 2025
│   └── app.js          ← Toda a lógica (JS puro, sem frameworks)
├── api/
│   ├── projetos.js     ← GET/POST/PUT Google Sheets
│   ├── notify.js       ← Slack (4 tipos de notificação)
│   └── databricks/
│       └── query.js    ← Queries nas 6 tabelas cx_golden_layer
└── vercel.json
```

## Deploy no Vercel

1. Faça push deste projeto para o repositório `marilenaynu/nucel-pro-tracker`
2. O Vercel detecta automaticamente o `vercel.json` e faz o deploy
3. Configure as variáveis de ambiente no painel Vercel:

| Variável | Valor |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT` | JSON da service account GCP |
| `SHEET_ID` | `1MEYI1-B_mEzWEyHiDmbaTdG_nfyPgO1uxuXWwc4baf4` |
| `SHEET_AUDIT_ID` | `19BCJyrIp_0pQjIVy4CA2U4PIn5xROdj9tkHq1E-K3Zo` |
| `SLACK_WEBHOOK_URL` | Webhook do canal #nucel-pro-tracker-app |
| `DATABRICKS_HOST` | Host do Databricks Nubank |
| `DATABRICKS_TOKEN` | Token de acesso Databricks |

## Google Sheets — Estrutura da aba "Projetos"

Crie a aba `Projetos` no BD com estas colunas (linha 1 = cabeçalho):

```
A: id | B: titulo | C: lider | D: nivel | E: status | F: saude
G: semana | H: cluster | I: metrica | J: baseline | K: target | L: real
M: impacto | N: volume | O: integrantes (separados por |)
P: tabela | Q: queues | R: drive | S: tarefas | T: evolucao (separados por ,)
```

## Audit Log — Estrutura da aba "Log"

```
A: timestamp | B: ação | C: id | D: titulo | E: lider | F: ip
```

## Sem variáveis configuradas

O portal funciona com **mock data** embutido no `app.js`. As APIs retornam arrays vazios/mock. Ideal para testar localmente ou na primeira subida.

## Desenvolvimento local

```bash
npm install -g vercel
vercel dev
```

Acesse em http://localhost:3000

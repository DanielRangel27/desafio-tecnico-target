# Desafio Técnico · Target Sistemas

API em **C# (.NET 8)** + frontend **Angular 21**.

| Desafio | Endpoint | Tela |
|---|---|---|
| 1 · Comissões | `GET /api/desafios/comissoes/padrao`, `POST /api/desafios/comissoes/calcular` | `/desafio-1` |
| 2 · Estoque | `GET /api/desafios/estoque`, `POST .../movimentar`, `GET .../historico`, `POST .../resetar` | `/desafio-2` |
| 3 · Juros | `POST /api/desafios/juros/calcular` | `/desafio-3` |

Swagger: `http://localhost:5080/swagger` · Health: `/api/health`

## Rodar localmente

```powershell
# Backend (requer .NET 8 SDK)
cd backend
dotnet test
dotnet run --project TargetDesafio.Api --launch-profile http   # http://localhost:5080

# Frontend (outro terminal)
cd frontend
npm install
npm start                                                       # http://localhost:4200
```

## Deploy

### Backend → Render (ou Railway)
1. New **Web Service** apontando para este repositório, **Root Directory** `backend`, runtime **Docker**.
2. (Opcional) variável `ALLOWED_ORIGINS` = `https://seu-site.vercel.app` para restringir o CORS.
3. A porta é lida da variável `PORT` automaticamente.

### Frontend → Vercel
1. Importe o repositório, **Root Directory** `frontend` (o `vercel.json` já define build e rewrite SPA).
2. Antes do deploy, ajuste `PRODUCTION_API_URL` em [environment.ts](frontend/src/environments/environment.ts) com a URL do Render.

## Aba "Código" do site
Os arquivos exibidos ficam em `frontend/public/source`. Após alterar o código, rode `npm run sync-sources` (dentro de `frontend`) e faça commit.

## Personalização
Seus dados (nome, links, bio, stack) ficam em [perfil.ts](frontend/src/app/core/perfil.ts).

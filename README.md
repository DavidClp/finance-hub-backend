# FinanceHub API

API REST do gerenciador financeiro pessoal com Node.js, Express, TypeScript, PostgreSQL, Prisma e arquitetura limpa (controllers → use cases → repositories).

## Requisitos

- Node.js 20+
- Docker (para o PostgreSQL local)

## Setup

```bash
# 1. Subir o banco
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env

# 4. Rodar migrations
npx prisma migrate dev --name init

# 5. (Opcional) Popular dados de demonstração
npm run seed

# 6. Subir a API
npm run dev
```

A API sobe em `http://localhost:3333`.

## Autenticação

```bash
# Registrar
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"David","email":"david@email.com","password":"senha123"}'

# Login
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@financehub.local","password":"demo1234"}'
```

Use o token retornado:

```bash
Authorization: Bearer <token>
```

## Endpoints principais

| Método | Rota |
|--------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| GET | `/api/v1/auth/me` |
| CRUD | `/api/v1/categories` |
| CRUD | `/api/v1/credit-cards` |
| CRUD | `/api/v1/transactions` |
| CRUD | `/api/v1/plannings` |
| PATCH | `/api/v1/plannings/:planningId/items/:itemId` |
| GET | `/api/v1/dashboard/summary?month=9&year=2026` |
| GET | `/api/v1/reports/expenses?from=2026-01-01&to=2026-12-31&groupBy=category` |

## Convenções

- Prefixo: `/api/v1`
- Valores monetários no JSON em reais; no banco em centavos
- Datas em ISO 8601
- Erros: `{ "error": { "code": "...", "message": "...", "fields": {} } }`
- `month` nas queries: 1–12

## Scripts

- `npm run dev` — desenvolvimento com hot reload
- `npm run build` / `npm start` — produção
- `npm run prisma:migrate` — migrations
- `npm run seed` — dados demo

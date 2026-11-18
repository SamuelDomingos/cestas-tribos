# Cestas Tribos

Aplicação Next.js para acompanhar a campanha de doações de três tribos
(**hope**, **hazak**, **sent**) e seus **GCs** (Grupos de Crescimento).
Registre entregas de **cestas básicas** e **roupas** com comprovante
fotográfico, acompanhe metas por GC e por tribo e gere relatórios com as fotos.

## Funcionalidades

| Área | O que faz |
| - | - |
| Feed (`/`) | Entregas recentes; usuário comum vê só a própria tribo, admin vê todas |
| Registro de entrega | Tipo (cesta/roupa), valor, GC, **foto obrigatória** e observação |
| Minhas entregas (`/minhas-entregas`) | Dono edita as próprias entregas; admin exclui qualquer uma |
| Metas (`/metas`) | Totais por tribo e progresso por GC; admin edita nome, tribo, avatar e metas |
| Relatórios (`/relatorios`) | Período, filtro por tribo, resumo e **ZIP com as fotos** |
| Painel da campanha (`/dashboard`) | Abas Metas, Tribos e GCs com atualização em tempo real |
| Usuários (`/usuarios`) | Cadastro, edição e exclusão (admin) com papel e tribo |

**Papéis**: `admin` e `user`. O usuário comum só enxerga a própria tribo;
o admin enxerga tudo.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19) — o `proxy.ts` na raiz é o
  middleware do Next 16 (substituiu `middleware.ts`)
- **Supabase** — autenticação, banco Postgres, Storage (bucket `deliveries`)
  e Realtime
- **TanStack Query v5** — cache e invalidação no cliente
- **Tailwind CSS 4** + componentes `components/ui` (shadcn/ui)
- **zod** + **react-hook-form** — validação dos formulários
- **Jest** + Testing Library — testes unitários e de rota
- **Prisma** — apenas como espelho do schema (`prisma/schema.prisma`);
  não é usado em runtime

## Como executar

### Pré-requisitos

- Node.js 20+
- Um projeto Supabase com as tabelas `gcs`, `goals`, `deliveries` (o schema
  está em `prisma/schema.prisma`) e um bucket público `deliveries`

### Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...        # só servidor (rotas da API)
```

> `DATABASE_URL`/`DIRECT_URL` do `.env.example` são para comandos do Prisma
> (schema/espelho); o app em si não abre conexão direta com o banco.

### Instalar e rodar

```bash
npm install
npm run dev        # http://localhost:3000
```

## Comandos

| Comando | O que faz |
| - | - |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção (exige as variáveis do Supabase) |
| `npm start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (formata o repo) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:watch` | Jest (57 testes) |

## Estrutura

```
app/
├── (public)/          # /auth e /dashboard
├── (private)/         # layout com menu lateral
│   ├── (pages)/       # / (feed), /metas, /relatorios, /minhas-entregas, /usuarios
│   └── _components/   # add-delivery-dialog (compartilhado entre telas)
├── api/               # routes handlers (entregas, gc, goals, users)
├── providers.tsx      # QueryClient global + tema + toaster
└── layout.tsx
proxy.ts               # middleware Next 16: sessão + redireciona para /auth
hooks/                 # use-session-user, use-invalidate-campaign
lib/
├── api/               # funções fetch do cliente + tipos (GCOutput, DeliveryOutput…)
├── auth.ts            # getSessionUser / getUserRole (rotas)
├── cache/campaign.ts  # unstable_cache do servidor + invalidação (ADR-0008)
├── deliveries/        # autorização, schemas e constantes das entregas
├── supabase/          # client (browser), server (service role), proxy (sessão)
└── utils.ts           # TRIBE_ORDER, moeda/formatos
components/ui/         # componentes shadcn/ui
test-utils/            # mock do Supabase para os testes
prisma/schema.prisma   # espelho do schema (sem migrations versionadas)
AGENTS.md              # regras para agentes de código
```

## Como funciona

### Autenticação e autorização

1. `proxy.ts` (middleware) roda em toda requisição: lê a sessão do Supabase e
   redireciona visitantes para `/auth` (única rota pública).
2. No **servidor**, cada route handler chama `getSessionUser()` e valida papel
   e tribo (`lib/deliveries/authorization.ts`): criação/editação de entrega é
   do dono, exclusão é de admin, mutações de GC/usuário exigem admin.
3. No **cliente**, `useSessionUser()` (chave `session-user`) fornece papel e
   tribo; o menu esconde opções de admin — isso é só UX, a regra real é no
   servidor.

### Dados e cache (menos RAM/rede)

- **Servidor**: `lib/cache/campaign.ts` guarda o agregado de metas (30 s) e a
  lista de GCs (60 s) com `unstable_cache` na tag `campaign-data`; os selects
  pedem só `deliveries(type, quantity)`. Toda mutação chama
  `invalidateCampaignCache()` para a leitura seguinte ser fresca.
- **Cliente**: o QueryClient usa `staleTime: 30_000` e `gcTime: 5 min`;
  as listas usam a chave única `["gcs"]`; após qualquer mutação,
  `useInvalidateCampaign()` (`hooks/use-invalidate-campaign.ts`) invalida
  entregas, relatório, agregado e GCs de uma vez.
- **Tempo real**: o painel assina `postgres_changes` (entregas/gcs) e só
  *invalida* a chave — o React Query deduplica o refetch — com polling de
  30 s como fallback (pausado com a aba oculta).

### Unidades de negócio

- `BASKET` (cesta) é valor em **centavos** (ex.: 3500 = R$ 35,00).
- `CLOTHES` (roupa) é **quantidade** de peças.
- A foto do comprovante é obrigatória no formulário e vai para o bucket
  público `deliveries`.

## Testes

```bash
npm test
```

- `app/api/**/route.test.ts` — autorização e respostas das rotas
  (401/403, escopo por tribo, sucesso)
- `lib/**/*.test.ts` — schemas zod e utilitários
- Componentes: card de entrega e de GC
- `test-utils/supabase-mock.ts` simula o cliente Supabase; os testes de rota
  usam `jest.mock("next/cache")` (passthrough do `unstable_cache`)

## Banco de dados

O schema vive em `prisma/schema.prisma` (espelho) — **não há migrations
versionadas**; as tabelas são criadas/alteradas direto no Supabase.
`lib/generated/` (Prisma Client) está no `.gitignore` e não é gerado em
runtime. Ver `prisma/schema.prisma` para `gcs`, `goals` e `deliveries`.

## Documentação do projeto

- `AGENTS.md` — regras de trabalho para agentes de código
- Memória do projeto no Obsidian (contexto, progresso, ADRs) — configurada em
  `.opencode/obsidian-memory.json`
- Decisões de arquitetura ficam como ADRs na pasta `04 - Decisões` do vault

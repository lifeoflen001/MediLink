# MediLink

MediLink is a healthcare application workspace with an Expo mobile client, an Express API, and shared TypeScript packages. The code also uses the product name **MediConnect**.

## Project scope

- Mobile screens for medicine and pharmacy discovery, reminders, profiles, emergency information, and AI chat.
- Authentication and administrator API routes, with separate mobile layouts for administrators and providers.
- PostgreSQL profile schemas for customers, hospitals, pharmacies, suppliers, doctors, and institutions.
- Streaming AI chat through the server-side OpenAI integration.

Screen availability does not imply that every workflow is connected to live provider data. Review the relevant screen and API implementation before enabling a feature for users.

## Technology

Node.js 24, pnpm workspaces, TypeScript 5.9, Expo 54, React Native 0.81, Express 5, PostgreSQL, Drizzle ORM, Zod, and OpenAPI/Orval code generation.

## Repository map

| Path | Purpose |
| --- | --- |
| `artifacts/mobile` | Expo application and file-based routes |
| `artifacts/api-server` | Express API, authentication, administration, AI chat |
| `artifacts/mockup-sandbox` | UI sandbox |
| `lib/db` | Database connection, Drizzle schema, schema tools |
| `lib/api-spec` | OpenAPI contract and code generation |
| `lib/api-client-react` | Shared generated React API client |
| `lib/api-zod` | Shared validation package |

## Local development

Install Node.js 24, pnpm, and PostgreSQL. Use pnpm: the root preinstall script rejects other package managers.

```bash
git clone https://github.com/lifeoflen001/MediLink.git
cd MediLink
pnpm install --frozen-lockfile
```

Provide these environment variables to the API process:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API listening port; for example, `5000` |
| `SESSION_SECRET` | Private authentication signing secret |
| `OPENAI_API_KEY` | Server-side AI integration credential |

The server imports the AI integration during startup. Configure its credential before starting the API. Do not place server secrets in Expo public environment variables.

For a disposable development database, inspect the schema changes before accepting the Drizzle prompt:

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run dev
```

The API is mounted under `/api`. Startup calls an administrator seed routine; review `artifacts/api-server/src/seed.ts` before running against any shared database.

In a second terminal, start Expo directly for local development:

```bash
cd artifacts/mobile
pnpm exec expo start
```

Configure the mobile API origin for the device or emulator you use. The package's `dev` script contains Replit-specific proxy/domain variables; outside Replit, adapt those settings to your environment. A physical device must be able to reach the API host.

## Checks and generated code

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen
```

Regenerate API clients after changing the OpenAPI contract. The root manifest does not define a test command; typechecking and building alone do not verify application behavior.

## Deployment notes

Use a managed PostgreSQL database, private server environment variables, and deployment-specific mobile networking settings. Review authentication, administrator bootstrap, data access, and healthcare data handling before a public release. AI output is general information and is not a substitute for professional medical care.

# Chat interno do escritório (MVP)

Web app estilo ChatGPT com 3 modos:
- Atendimento
- Jurídico (sempre via Claude)
- Análise de Petições

## Stack
- Next.js App Router + TypeScript
- Prisma + SQLite
- Upload local em `/data/uploads`
- Gemini para extração multimodal
- Claude para respostas (obrigatório no modo Jurídico)

## 1) Configuração
```bash
cp .env.example .env
```
Preencha:
- `DATABASE_URL="file:./dev.db"`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `ADMIN_PASSWORD`

## 2) Instalação e banco
```bash
npm install
npx prisma migrate dev
npx prisma generate
```

## 3) Rodar
```bash
npm run dev
```

## Endpoints
- `POST /api/upload` (`FormData`: `file` + `kind=chat|kb`)
- `POST /api/chat` (`mode`, `chatId?`, `message`, `attachedFileIds[]`)

## Admin
- `/admin/login` (senha em `ADMIN_PASSWORD`)
- `/admin/prompts` (editar prompts por modo)
- `/admin/knowledge` (upload docs KB, tags, ativar/desativar e visualizar `extractedText`)

## Busca na KB
Busca clássica por keyword scoring no `extractedText` (sem embeddings/sem 3ª IA).

## Fluxo de aceite
1. Faça login em `/admin/login`.
2. Edite prompt do modo Jurídico em `/admin/prompts`.
3. Suba PDF na KB em `/admin/knowledge`.
4. No chat, anexe PDF do caso e envie: “reescreva o tópico X”.
5. O app monta contexto com anexos extraídos + snippets da KB e responde pronto para copiar/colar.

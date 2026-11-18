<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Memória do projeto (Obsidian)

No início da sessão, antes de responder sobre o projeto, leia:

1. `.opencode/obsidian-memory.json` (vault, `projectFolder`, `mainNote`, `activeContext`).
2. `<vault>/<projectFolder>/<mainNote>` — MOC / porta de entrada.
3. `<vault>/<projectFolder>/<activeContext>`.
4. `progressNote` e `risksNote`, se configurados.
5. A sessão mais recente em `sessionsFolder`.
6. A nota do domínio/operação envolvida e os ADRs relacionados em `decisionsFolder`.

Use isso como contexto padrão. Se a memória divergir do código, **o código vence**: atualize a memória. Atualize `Contexto ativo`, `Progresso e roadmap`, `Bloqueios e riscos` e registre a sessão em `06 - Sessões/AAAA-MM-DD.md` ao final de mudanças relevantes. Nunca grave tokens, senhas, chaves ou credenciais no vault; referencie apenas onde estão configurados.

# TestClaudeCodeLearning

A learning project for exploring [Claude Code](https://claude.com/claude-code): notes on commands and workflows, plus a small app built along the way.

## Contents

| Path | Description |
|------|-------------|
| `tier-ranker/` | Next.js app for ranking software/infrastructure concepts into S–D tiers via drag and drop |
| `CodesLearnedCC.txt` | Personal cheat sheet of Claude Code commands and tips |

## tier-ranker

Drag concept chips (GraphQL, Kafka, Kubernetes, Redis, and more) into tiers S, A, B, C and D. Each concept has an info panel explaining what it is, when to use it, and common tools. The finished tier list can be exported as a PNG.

**Stack:** Next.js, React, TypeScript, [dnd-kit](https://dndkit.com/), Playwright (e2e and visual tests).

### Getting started

Requires Node.js 26 or newer (see `.nvmrc`).

```bash
cd tier-ranker
npm install
npm run dev
```

Then open http://localhost:3000, which redirects to `/tier-list`.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Run the TypeScript compiler without emitting |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Claude Code notes

Highlights from `CodesLearnedCC.txt`:

- `/compact`: summarize the conversation when `/context` usage goes above 50%
- `/clear`: start fresh
- `/resume`: return to an older conversation
- `/rewind`: roll back both the conversation and the code to an earlier point
- `/model`, `/effort`, `/memory`, `/doctor`, `/plugins`: configuration and diagnostics
- `/frontend-design`: skill for redesigning UI
- Installed skills live in the `.agent` folder; delete a skill's file to uninstall it

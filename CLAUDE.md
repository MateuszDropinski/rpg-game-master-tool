# RPG Game Master Tool

Angular application built with [ngDiagram](https://www.ngdiagram.dev/) as the primary UI library.

## Stack

- Angular 21 (standalone components, signals)
- pnpm — always use `pnpm` for installs and scripts. Do not use `npm` or `yarn`.
- ngDiagram (to be added)

## Common commands

- `pnpm start` — run dev server
- `pnpm build` — production build

## Testing

This project does not have automated tests. Do not add `*.spec.ts` files, test runners, or test scripts.

## MCP

`.mcp.json` configures two MCP servers:

- `ng-diagram-docs` — look up ngDiagram APIs and docs when working on diagram features.
- `figma` — Figma's remote MCP at `https://mcp.figma.com/mcp`. Use it to read designs (frames, components, variables, styles) when implementing UI from the designer's Figma file. First use prompts an OAuth flow; sign in with `/mcp` in Claude Code if not already connected.

## Skills

- `figma-implement-design` (`.claude/skills/figma-implement-design/`) — workflow for turning a Figma frame into an Angular component. Auto-triggers when the user asks to implement/match/port a design.

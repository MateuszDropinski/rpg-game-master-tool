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

## Designs

The canonical Figma file for this project:

- **Game Master Tool** — https://www.figma.com/design/rRQr0eB6Tm5GdvBfBWbjyc/Game-Master-Tool
- File key: `rRQr0eB6Tm5GdvBfBWbjyc`

When the user references "the design", "the Figma", a frame, or a component without specifying a URL, default to this file. Use the `figma` MCP server's `get_metadata` to discover frames, then `get_design_context` on the specific node id once chosen.

Specific frames can be referenced by node id — when the user says e.g. *"implement the NPC card"*, search the file structure for a matching frame and confirm the node id with the user before generating code.

**Per-teammate prerequisite:** each developer must have this file shared with their own Figma account (View access is enough). Without that, the figma MCP returns "not found" — ask the file owner to share via Figma's Share dialog.

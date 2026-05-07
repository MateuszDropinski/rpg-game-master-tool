---
name: figma-implement-design
description: Use when the user asks to implement, build, port, or translate a Figma design into Angular code — typically with a Figma file/frame/node link, "from this design", "match the Figma", or selecting a frame in the Figma desktop app. Drives the design → Angular component workflow using the figma MCP server.
---

# Figma → Angular implementation workflow

This project consumes designs from a Figma file the designer maintains. Use the `figma` MCP server (configured in `.mcp.json`) to read design data — never guess properties, never invent values.

## When this skill applies

Trigger on requests like:
- "Implement this Figma design: <url>"
- "Build the <component> from Figma"
- "Match the design at <figma link>"
- "Port the selected frame to Angular"

If the user does not provide a Figma URL or describe a selected frame, ask for one before continuing. Do not fabricate.

## Step 1 — Read the design

Use the figma MCP tools to fetch the design. Prefer pulling the smallest unit needed (a frame or component, not the whole page).

Pull, in this priority order:
1. **Layout & structure** — auto-layout direction, gap, padding, sizing modes (fill/hug/fixed).
2. **Variables / design tokens** — colors, typography, spacing, radius. These are the source of truth; do not hardcode hex values if a variable exists.
3. **Component instances** — note which Figma component each instance points to so repeated UI maps to a single Angular component.
4. **Text styles** — font family, weight, size, line-height, letter-spacing.
5. **Assets** — icons/images that must be exported (SVG preferred for icons).

If a property looks ambiguous (e.g. a stroke that is hidden, a frame named "ignore"), ask the user rather than assume.

## Step 2 — Plan the Angular shape

Before writing code, decide:
- **Component boundaries.** A Figma component → one Angular standalone component. Avoid one giant template.
- **Inputs / outputs.** Variants in Figma (e.g. `state=hover|active`) map to component inputs (signals). Click targets map to outputs.
- **Reusable tokens.** If multiple components share colors/spacing, lift them into `src/styles.css` as CSS custom properties named after the Figma variable (kebab-case).
- **Where it lives.** New feature → `src/app/<feature>/`. New shared primitive → `src/app/shared/`.

Sketch this in 2–4 lines back to the user before generating files, especially for non-trivial designs.

## Step 3 — Implement

Conventions for this codebase:
- **Angular 21**, standalone components, signals (`input()`, `output()`, `signal()`, `computed()`). No NgModules.
- **pnpm only** for any install (`pnpm add ...`). Never `npm`/`yarn`.
- **No tests.** Do not generate `*.spec.ts` files, even if the schematic offers one. See CLAUDE.md.
- **Styles**: component-scoped CSS files. Map Figma variables to CSS custom properties. Use logical properties (`padding-inline`, `margin-block`) when the design implies them.
- **ngDiagram**: if the Figma design depicts a graph/canvas (nodes + edges, connectors, ports), implement it via ngDiagram primitives — consult `ng-diagram-docs` MCP for the API. Don't hand-roll SVG.
- **Icons**: inline SVG or imported assets in `public/`. Don't pull in icon-font libraries.
- **No throwaway abstractions.** Three similar lines beat a premature wrapper component.

## Step 4 — Verify

After implementation:
1. Run `pnpm build` and confirm it passes.
2. Run `pnpm start`, open the page in a browser, and visually compare against the Figma frame. Note any divergences (intentional or not) back to the user.
3. Type/lint errors are blockers — fix them, don't suppress.

If you can't run a browser in this environment, say so explicitly rather than claim parity.

## Anti-patterns

- ❌ Eyeballing hex values from screenshots when the Figma file is accessible.
- ❌ Inlining `style="..."` on elements; put styles in the component CSS.
- ❌ Hardcoding spacing in pixels when the Figma variable system uses a token (e.g. `--space-4`).
- ❌ Creating spec files "just in case." This project has no tests.
- ❌ Adding Tailwind, Material, or any UI library without the user's explicit go-ahead — ngDiagram is the only design-system dependency assumed.
- ❌ Assuming OAuth is set up. If a figma MCP tool returns an auth error, tell the user to run `/mcp` and authenticate.

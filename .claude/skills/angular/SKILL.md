---
name: angular
description: Project-specific Angular conventions for this codebase. Apply these rules when writing or reviewing any Angular code in this project.
---

# Angular conventions

## Interfaces and types

### Where to define them

- **Component-specific interfaces** (used only by that one component): extract to a sibling file named `<component-name>.interface.ts` in the same directory.
- **Global/shared interfaces** (used by two or more files across different features): place in `src/app/core/interfaces/` named `<name>.interface.ts`.

Never define interfaces or types inline inside a component file — always extract them to a dedicated interface file.

Do not create separate `models/` or `interfaces/` directories anywhere in the project. Both models and interfaces are the same thing — use `src/app/core/interfaces/` as the single location for all global shared types.

### File naming

| Scope | Location |
|---|---|
| Component-specific | `<name>.interface.ts` next to the component |
| Global / shared | `src/app/core/interfaces/<name>.interface.ts` |

### Rules

- All interfaces and types live in dedicated `*.interface.ts` files, never inside component class files.
- Global interfaces always go to `src/app/core/interfaces/`, never co-located with a feature component.
- Use `interface` for object shapes, `type` for unions, intersections, and mapped types.
- Import types with `import { type Foo }` (type-only import) when the symbol is only used as a type.

## Diagram encapsulation

`<ng-diagram>` must never appear directly in `app.html`, and diagram-related logic (model, node/edge template maps, viewport, drag events, etc.) must never live in `app.ts`.

Create a dedicated diagram component at `src/app/components/diagram/diagram.component.ts` that owns:
- `providers: [provideNgDiagram()]` — this is the only place `provideNgDiagram()` is called
- the `<ng-diagram>` template
- `initializeModel` and the model adapter
- `NgDiagramNodeTemplateMap` / `NgDiagramEdgeTemplateMap`
- all diagram event handlers (`nodeDragStarted`, `selectionMoved`, etc.)

`AppComponent` should only compose top-level layout pieces (sidebar, map switcher, diagram component, dialogs) and hold no diagram-specific state.

## Component placement

All Angular components must live under `src/app/components/`, each in its own subdirectory named after the component (e.g. `src/app/components/node-character/`).

Never place a component directly in `src/app/` or any other directory outside `src/app/components/`.

## State

All state files must live under `src/app/core/state/`, named `<name>.store.ts` (e.g. `src/app/core/state/notes.store.ts`).

Never place store files directly in `src/app/state/`.

## Services

All Angular services must live under `src/app/core/services/`, named `<name>.service.ts` (e.g. `src/app/core/services/notes.service.ts`).

Never place service files directly in `src/app/services`.

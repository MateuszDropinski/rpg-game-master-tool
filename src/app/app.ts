import { Component, computed, inject, signal } from '@angular/core';
import {
  initializeModel,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  NgDiagramEdgeTemplateMap,
  NgDiagramNodeTemplateMap,
  provideNgDiagram,
  type NgDiagramConfig,
  type Node,
  type NodeDragStartedEvent,
  type SelectionMovedEvent,
} from 'ng-diagram';

import { CircleAreaComponent } from './circle/circle-area.component';
import { Cube } from './cube/cube';
import {
  AddCharacterDialogComponent,
  type CharacterType,
} from './components/add-character-dialog/add-character-dialog.component';
import { LibrarySidebarComponent } from './components/library-sidebar/library-sidebar.component';
import { MapSwitcherComponent } from './components/map-switcher/map-switcher.component';
import {
  NodeCharacterComponent,
  type CharacterNodeData,
} from './components/node-character/node-character.component';
import { mapBackgroundFromFile, MapEntry } from './models/map.model';
import { DragRulerController } from './ruler/drag-ruler.controller';
import { RulerEdgeComponent } from './ruler/ruler-edge.component';
import { RulerEndpointComponent } from './ruler/ruler-endpoint.component';
import { ToolbarComponent } from './tools/toolbar.component';

@Component({
  selector: 'app-root',
  imports: [
    NgDiagramComponent,
    NgDiagramBackgroundComponent,
    Cube,
    AddCharacterDialogComponent,
    LibrarySidebarComponent,
    MapSwitcherComponent,
    ToolbarComponent,
    NodeCharacterComponent,
  ],
  providers: [provideNgDiagram(), DragRulerController],
  templateUrl: './app.html',
  styles: `
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .canvas {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
    }

    ng-diagram {
      flex: 1 1 auto;
      min-width: 0;
    }
  `,
})
export class App {
  private readonly dragRuler = inject(DragRulerController);

  readonly nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['character', NodeCharacterComponent],
    ['ruler-endpoint', RulerEndpointComponent],
    ['spell-area', CircleAreaComponent],
  ]);

  model = initializeModel({
    nodes: [
      {
        id: 'char-1',
        type: 'character',
        position: { x: 80, y: 100 },
        size: { width: 220, height: 110 },
        data: { name: 'Aelindra', characterClass: 'Wizard', hp: 45, maxHp: 80 },
      },
      {
        id: 'char-2',
        type: 'character',
        position: { x: 380, y: 100 },
        size: { width: 220, height: 110 },
        data: { name: 'Thorin', characterClass: 'Knight', hp: 90, maxHp: 100 },
      },
      {
        id: 'char-3',
        type: 'character',
        position: { x: 80, y: 280 },
        size: { width: 220, height: 110 },
        data: { name: 'Sylara', characterClass: 'Rogue', hp: 65, maxHp: 85 },
      },
      {
        id: 'char-4',
        type: 'character',
        position: { x: 380, y: 280 },
        size: { width: 220, height: 110 },
        data: { name: 'Brother Aldric', characterClass: 'Cleric', hp: 30, maxHp: 70 },
      },
    ],
    edges: [],
  });

  config = {
    background: { cellSize: { width: 20, height: 20 } },
  } satisfies NgDiagramConfig;

  edgeTemplateMap = new NgDiagramEdgeTemplateMap([['ruler', RulerEdgeComponent]]);

  readonly sidebarCollapsed = signal(false);
  readonly addCharacterDialogOpen = signal(false);

  readonly maps = signal<MapEntry[]>([
    { id: 'map-1', name: 'Map 1', background: '#2f4f4f' },
    { id: 'map-2', name: 'Map 2', background: '#5d3a1a' },
  ]);

  readonly activeMapId = signal('map-1');

  readonly activeBackground = computed(
    () => this.maps().find((m) => m.id === this.activeMapId())?.background ?? '#222',
  );

  onNodeDragStarted(event: NodeDragStartedEvent) {
    const node = event.nodes[0];
    if (!node) return;
    const center = {
      x: node.position.x + (node.size?.width ?? 0) / 2,
      y: node.position.y + (node.size?.height ?? 0) / 2,
    };
    this.dragRuler.start(center);
  }

  onSelectionMoved(event: SelectionMovedEvent) {
    const node = event.nodes[0];
    if (!node) return;
    this.dragRuler.move({
      x: node.position.x + (node.size?.width ?? 0) / 2,
      y: node.position.y + (node.size?.height ?? 0) / 2,
    });
  }

  onNodeDragEnded() {
    this.dragRuler.cleanup();
  }

  setActiveMap(id: string) {
    this.activeMapId.set(id);
  }

  addMap({ name, file }: { name: string; file: File }) {
    const { background, objectUrl } = mapBackgroundFromFile(file);
    const id = `map-${crypto.randomUUID()}`;
    this.maps.update((list) => [...list, { id, name, background, objectUrl }]);
    this.activeMapId.set(id);
  }

  openAddCharacterDialog() {
    this.addCharacterDialogOpen.set(true);
  }

  onAddCharacterSubmit(type: CharacterType) {
    this.addCharacterDialogOpen.set(false);
    const existing = this.model
      .getNodes()
      .filter((n) => (n.data as CharacterNodeData)?.characterClass === type.label);
    const index = existing.length + 1;
    const name = index === 1 ? type.label : `${type.label} ${index}`;
    const x = 80 + Math.floor(Math.random() * 500);
    const y = 100 + Math.floor(Math.random() * 400);
    this.model.updateNodes((nodes) => [
      ...nodes,
      {
        id: `char-${crypto.randomUUID()}`,
        type: 'character',
        position: { x, y },
        size: { width: 220, height: 110 },
        data: { name, characterClass: type.label, hp: type.hp, maxHp: type.hp },
      } as Node,
    ]);
  }
}

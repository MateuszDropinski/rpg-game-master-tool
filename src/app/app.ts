import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorLock, phosphorLockOpen } from '@ng-icons/phosphor-icons/regular';
import {
  initializeModel,
  NgDiagramComponent,
  NgDiagramEdgeTemplateMap,
  NgDiagramModelService,
  NgDiagramNodeTemplateMap,
  NgDiagramSelectionService,
  NgDiagramService,
  NgDiagramViewportService,
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
import { GridOverlayComponent } from './components/grid-overlay/grid-overlay.component';
import { LibrarySidebarComponent } from './components/library-sidebar/library-sidebar.component';
import {
  MapImageNodeComponent,
  type MapImageNodeData,
} from './components/map-image-node/map-image-node.component';
import { MapSwitcherComponent } from './components/map-switcher/map-switcher.component';
import {
  NodeCharacterComponent,
  type CharacterNodeData,
} from './components/node-character/node-character.component';
import { ScaleLegendComponent } from './components/scale-legend/scale-legend.component';
import {
  DEFAULT_CELL_VALUE,
  DEFAULT_UNIT,
  loadMapImage,
  MapEntry,
} from './models/map.model';
import { DragRulerController } from './ruler/drag-ruler.controller';
import { RulerEdgeComponent } from './ruler/ruler-edge.component';
import { RulerEndpointComponent } from './ruler/ruler-endpoint.component';
import { MapScaleService } from './services/map-scale.service';
import { ToolbarComponent } from './tools/toolbar.component';

const MAP_IMAGE_NODE_ID = 'map-bg';

@Component({
  selector: 'app-root',
  imports: [
    NgDiagramComponent,
    NgIcon,
    Cube,
    AddCharacterDialogComponent,
    GridOverlayComponent,
    LibrarySidebarComponent,
    MapSwitcherComponent,
    NodeCharacterComponent,
    ScaleLegendComponent,
    ToolbarComponent,
  ],
  providers: [
    provideNgDiagram(),
    provideIcons({ phosphorLock, phosphorLockOpen }),
    DragRulerController,
  ],
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

    .diagram-wrap {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
    }

    ng-diagram {
      flex: 1 1 auto;
      min-width: 0;
    }

    .lock-btn {
      position: absolute;
      bottom: 80px;
      left: 24px;
      z-index: 10;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(20, 20, 24, 0.78);
      color: #f0f0f5;
      font: 13px/1.2 system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(6px);
    }

    .lock-btn:hover {
      border-color: rgba(255, 255, 255, 0.4);
    }

    .lock-btn--locked {
      color: #ffd76a;
    }
  `,
})
export class App {
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly modelService = inject(NgDiagramModelService);
  private readonly diagramService = inject(NgDiagramService);
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly scaleService = inject(MapScaleService);
  private readonly dragRuler = inject(DragRulerController);

  readonly nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['character', NodeCharacterComponent],
    ['map-image', MapImageNodeComponent],
    ['ruler-endpoint', RulerEndpointComponent],
    ['spell-area', CircleAreaComponent],
  ]);

  edgeTemplateMap = new NgDiagramEdgeTemplateMap([
    ['ruler', RulerEdgeComponent],
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
    zoom: { max: 5 },
    zIndex: { enabled: true },
  } satisfies NgDiagramConfig;

  readonly sidebarCollapsed = signal(false);
  readonly addCharacterDialogOpen = signal(false);

  readonly maps = signal<MapEntry[]>([
    {
      id: 'map-1',
      name: 'Map 1',
      background: '#1a1a1a',
      imageUrl: 'world%20map%203.jpeg',
      width: 1800,
      height: 1350,
      cellValue: DEFAULT_CELL_VALUE,
      unit: DEFAULT_UNIT,
    },
    {
      id: 'map-2',
      name: 'Map 2',
      background: '#5d3a1a',
      cellValue: DEFAULT_CELL_VALUE,
      unit: DEFAULT_UNIT,
    },
  ]);

  readonly activeMapId = signal('map-1');

  readonly activeMap = computed(
    () => this.maps().find((m) => m.id === this.activeMapId()) ?? null,
  );

  /** Solid color shown on the diagram host (letterbox bands + color-only maps). */
  readonly activeBackground = computed(
    () => this.activeMap()?.background ?? '#222',
  );

  constructor() {
    // Sync the map-image node with the active map. Only re-runs on id change
    // (not on every imageNode field update — those flow the other direction).
    // Gated on isInitialized so the first run waits for ngDiagram bootstrap.
    effect(() => {
      if (!this.diagramService.isInitialized()) return;
      const id = this.activeMapId();
      untracked(() => this.syncMapImageNode(id));
    });

    // Mirror the active map's scale into the service the rulers/circles read.
    effect(() => {
      const map = this.activeMap();
      if (!map) return;
      this.scaleService.cellValue.set(map.cellValue);
      this.scaleService.unit.set(map.unit);
    });
  }

  setActiveMap(id: string) {
    this.activeMapId.set(id);
  }

  async addMap({ name, file }: { name: string; file: File }) {
    let loaded: { objectUrl: string; width: number; height: number };
    try {
      loaded = await loadMapImage(file);
    } catch (err) {
      console.error('Failed to load map image', err);
      return;
    }
    const id = `map-${crypto.randomUUID()}`;
    this.maps.update((list) => [
      ...list,
      {
        id,
        name,
        background: '#1a1a1a',
        imageUrl: loaded.objectUrl,
        width: loaded.width,
        height: loaded.height,
        cellValue: DEFAULT_CELL_VALUE,
        unit: DEFAULT_UNIT,
      },
    ]);
    this.activeMapId.set(id);
  }

  onCellValueChange(value: number) {
    this.updateActiveMap({ cellValue: value });
  }

  onUnitChange(unit: string) {
    this.updateActiveMap({ unit });
  }

  toggleImageLock() {
    const map = this.activeMap();
    if (!map?.imageUrl) return;
    const locked = !map.imageLocked;
    this.updateActiveMap({ imageLocked: locked });

    const existing = this.modelService.getNodeById(MAP_IMAGE_NODE_ID);
    if (!existing) return;
    this.modelService.updateNode(MAP_IMAGE_NODE_ID, {
      draggable: !locked,
      resizable: !locked,
      rotatable: !locked,
      ...(locked ? { selected: false } : {}),
    });
    this.modelService.updateNodeData<MapImageNodeData>(MAP_IMAGE_NODE_ID, {
      imageUrl: map.imageUrl,
      locked,
    });
    if (locked) {
      this.selectionService.deselect([MAP_IMAGE_NODE_ID]);
    }
  }

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
    this.persistMapImageNodeState();
  }

  onNodeChanged() {
    this.persistMapImageNodeState();
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

  /** Persist map-image node movement / resize / rotation back to the active map. */
  private persistMapImageNodeState() {
    const node = this.modelService.getNodeById(MAP_IMAGE_NODE_ID);
    if (!node || !node.size) return;
    this.updateActiveMap({
      imageNode: {
        position: node.position,
        size: node.size,
        angle: node.angle ?? 0,
      },
    });
  }

  private updateActiveMap(patch: Partial<MapEntry>) {
    const id = this.activeMapId();
    this.maps.update((list) =>
      list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }

  private async syncMapImageNode(id: string) {
    const map = this.maps().find((m) => m.id === id) ?? null;
    const existing = this.modelService.getNodeById(MAP_IMAGE_NODE_ID);

    if (!map?.imageUrl || !map.width || !map.height) {
      if (existing) this.modelService.deleteNodes([MAP_IMAGE_NODE_ID]);
      return;
    }

    const state = map.imageNode;
    const locked = !!map.imageLocked;
    const newNode: Node<MapImageNodeData> = {
      id: MAP_IMAGE_NODE_ID,
      type: 'map-image',
      position: state?.position ?? { x: 0, y: 0 },
      size: state?.size ?? { width: map.width, height: map.height },
      angle: state?.angle ?? 0,
      draggable: !locked,
      resizable: !locked,
      rotatable: !locked,
      autoSize: false,
      zOrder: -1,
      data: { imageUrl: map.imageUrl, locked },
    };

    await this.diagramService.transaction(
      () => {
        if (existing) this.modelService.deleteNodes([MAP_IMAGE_NODE_ID]);
        this.modelService.addNodes([newNode]);
      },
      { waitForMeasurements: true },
    );

    // Always fit the image on map switch — calibration (size/position/angle)
    // is preserved on the node, but the viewport resets to a clean "show me
    // this map" baseline that the user can pan/zoom from.
    this.viewportService.zoomToFit({
      nodeIds: [MAP_IMAGE_NODE_ID],
      padding: 24,
    });
  }
}

import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
import { Cube } from './components/cube/cube';
import {
  AddCharacterDialogComponent,
  type CharacterType,
} from './components/add-character-dialog/add-character-dialog.component';
import { GridOverlayComponent } from './components/grid-overlay/grid-overlay.component';
import { LockMapImageToggleComponent } from './components/lock-map-image-toggle/lock-map-image-toggle.component';
import { LibrarySidebarComponent } from './components/library-sidebar/library-sidebar.component';
import {
  MapImageNodeComponent,
  type MapImageNodeData,
} from './components/map-image-node/map-image-node.component';
import { MapSwitcherComponent } from './components/map-switcher/map-switcher.component';
import { MotionToggleComponent } from './components/motion-toggle/motion-toggle.component';
import { RollDiceButtonComponent } from './components/roll-dice-button/roll-dice-button.component';
import {
  NodeCharacterComponent,
  type CharacterNodeData,
} from './components/node-character/node-character.component';
import { NoteNodeComponent } from './components/nodes/note-node/note-node.component';
import { PinNodeComponent } from './components/nodes/pin-node/pin-node.component';
import { ScaleLegendComponent } from './components/scale-legend/scale-legend.component';
import {
  DEFAULT_CELL_VALUE,
  DEFAULT_UNIT,
  loadMapImage,
  MapEntry,
} from './models/map.model';
import { NOTE_NODE_TYPE } from './models/note.model';
import { PIN_NODE_TYPE } from './models/pin.model';
import { DragRulerController } from './ruler/drag-ruler.controller';
import { RulerEdgeComponent } from './ruler/ruler-edge.component';
import { RulerEndpointComponent } from './ruler/ruler-endpoint.component';
import { MapScaleService } from './services/map-scale.service';
import { MapsStore } from './state/maps.store';
import { NotesStore } from './state/notes.store';
import { PinsStore } from './state/pins.store';
import { ToolbarComponent } from './tools/toolbar.component';

const MAP_IMAGE_NODE_ID = 'map-bg';

@Component({
  selector: 'app-root',
  imports: [
    NgDiagramComponent,
    Cube,
    AddCharacterDialogComponent,
    GridOverlayComponent,
    LibrarySidebarComponent,
    LockMapImageToggleComponent,
    MapSwitcherComponent,
    MotionToggleComponent,
    NodeCharacterComponent,
    NoteNodeComponent,
    PinNodeComponent,
    RollDiceButtonComponent,
    ScaleLegendComponent,
    ToolbarComponent,
  ],
  providers: [
    provideNgDiagram(),
    DragRulerController,
    NotesStore,
    PinsStore,
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
  `,
})
export class App {
  private readonly viewportService = inject(NgDiagramViewportService);
  private readonly modelService = inject(NgDiagramModelService);
  private readonly diagramService = inject(NgDiagramService);
  private readonly selectionService = inject(NgDiagramSelectionService);
  private readonly scaleService = inject(MapScaleService);
  private readonly dragRuler = inject(DragRulerController);
  private readonly mapsStore = inject(MapsStore);
  private readonly notesStore = inject(NotesStore);
  private readonly pinsStore = inject(PinsStore);

  readonly nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['character', NodeCharacterComponent],
    ['map-image', MapImageNodeComponent],
    ['ruler-endpoint', RulerEndpointComponent],
    ['spell-area', CircleAreaComponent],
    [NOTE_NODE_TYPE, NoteNodeComponent],
    [PIN_NODE_TYPE, PinNodeComponent],
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
    // elevateOnSelection: false — without this, selecting the map-image
    // background (zOrder -1) adds selectedZIndex (10000) to it and pushes
    // it above every other node.
    zIndex: { enabled: true, elevateOnSelection: false },
  } satisfies NgDiagramConfig;

  readonly sidebarCollapsed = signal(false);
  readonly addCharacterDialogOpen = signal(false);

  readonly maps = this.mapsStore.maps;
  readonly activeMapId = this.mapsStore.activeMapId;
  readonly activeMap = this.mapsStore.activeMap;

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

    // Swap notes and pins in/out of the diagram on map switch so each map
    // shows only its own. Items for the previous map are archived in their
    // respective stores.
    let prevMapId = this.activeMapId();
    effect(() => {
      if (!this.diagramService.isInitialized()) return;
      const next = this.activeMapId();
      if (next === prevMapId) return;
      const prev = prevMapId;
      prevMapId = next;
      untracked(() => {
        this.notesStore.swapActiveMap(prev, next);
        this.pinsStore.swapActiveMap(prev, next);
      });
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
    this.mapsStore.setActiveMap(id);
  }

  async addMap({ name, file }: { name: string; file: File }) {
    let loaded: { objectUrl: string; width: number; height: number };
    try {
      loaded = await loadMapImage(file);
    } catch (err) {
      console.error('Failed to load map image', err);
      return;
    }
    this.mapsStore.addMap({
      id: `map-${crypto.randomUUID()}`,
      name,
      background: '#1a1a1a',
      imageUrl: loaded.objectUrl,
      width: loaded.width,
      height: loaded.height,
      cellValue: DEFAULT_CELL_VALUE,
      unit: DEFAULT_UNIT,
    });
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
    this.mapsStore.updateActiveMap(patch);
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

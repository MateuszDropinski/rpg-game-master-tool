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
  type PaletteItemDroppedEvent,
  type SelectionMovedEvent,
} from 'ng-diagram';

import { CircleAreaComponent } from './circle/circle-area.component';
import { AddCharacterDialogComponent } from './components/add-character-dialog/add-character-dialog.component';
import { Cube } from './components/cube/cube';
import { GridOverlayComponent } from './components/grid-overlay/grid-overlay.component';
import { LockMapImageToggleComponent } from './components/lock-map-image-toggle/lock-map-image-toggle.component';
import { LibrarySidebarComponent } from './components/library-sidebar/library-sidebar.component';
import {
  MapImageNodeComponent,
  type MapImageNodeData,
} from './components/map-image-node/map-image-node.component';
import { MapSwitcherComponent } from './components/map-switcher/map-switcher.component';
import { MotionToggleComponent } from './components/motion-toggle/motion-toggle.component';
import { NodeCharacterComponent } from './components/node-character/node-character.component';
import { RollDiceButtonComponent } from './components/roll-dice-button/roll-dice-button.component';
import { NoteNodeComponent } from './components/nodes/note-node/note-node.component';
import { PinNodeComponent } from './components/nodes/pin-node/pin-node.component';
import { ScaleLegendComponent } from './components/scale-legend/scale-legend.component';
import {
  CHARACTER_NODE_TYPE,
  type CharacterNodeData,
  type CharacterType,
} from './models/character.model';
import {
  DEFAULT_CELL_VALUE,
  DEFAULT_UNIT,
  loadMapImage,
  MAP_BACKGROUND,
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

const MAP_IMAGE_NODE_TYPE = 'map-image';
const mapImageNodeId = (mapId: string) => `map-bg-${mapId}`;

/**
 * `selected` and ng-diagram's computed/measured fields are owned by the
 * selection/measurement services. Persisting and re-injecting them on a tab
 * swap leaves the resize/rotate adornments rendered while the selection
 * service's internal list is empty — clicks then land on stale handles and
 * the node appears unclickable.
 */
function stripVolatileNodeFields<N extends Node>(node: N): N {
  const {
    selected: _selected,
    measuredBounds: _measuredBounds,
    measuredPorts: _measuredPorts,
    computedZIndex: _computedZIndex,
    ...rest
  } = node as N & {
    selected?: boolean;
    measuredBounds?: unknown;
    measuredPorts?: unknown;
    computedZIndex?: unknown;
  };
  return rest as N;
}

function stripVolatileEdgeFields<E extends { selected?: boolean }>(edge: E): E {
  const { selected: _selected, ...rest } = edge;
  return rest as E;
}

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
    [CHARACTER_NODE_TYPE, NodeCharacterComponent],
    [MAP_IMAGE_NODE_TYPE, MapImageNodeComponent],
    ['ruler-endpoint', RulerEndpointComponent],
    ['spell-area', CircleAreaComponent],
    [NOTE_NODE_TYPE, NoteNodeComponent],
    [PIN_NODE_TYPE, PinNodeComponent],
  ]);

  edgeTemplateMap = new NgDiagramEdgeTemplateMap([
    ['ruler', RulerEdgeComponent],
  ]);

  model = initializeModel({ nodes: [], edges: [] });

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

  readonly background = MAP_BACKGROUND;

  /**
   * The map whose nodes/edges/viewport currently sit in the live diagram model.
   * Lets us snapshot it back into `maps` before swapping in a different map.
   * `null` until the first sync runs.
   */
  private syncedMapId: string | null = null;

  constructor() {
    // Save the previous map's state and apply the active map's saved state on
    // every id change. Also handles the initial bootstrap (syncedMapId starts
    // null, so nothing is saved on the first run). Gated on isInitialized so
    // the first run waits for ngDiagram bootstrap.
    effect(() => {
      if (!this.diagramService.isInitialized()) return;
      const id = this.activeMapId();
      untracked(() => {
        if (this.syncedMapId && this.syncedMapId !== id) {
          this.saveMapState(this.syncedMapId);
        }
        this.syncedMapId = id;
        void this.applyMapState(id);
      });
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

    const imageId = mapImageNodeId(map.id);
    const existing = this.modelService.getNodeById(imageId);
    if (!existing) return;
    this.modelService.updateNode(imageId, {
      draggable: !locked,
      resizable: !locked,
      rotatable: !locked,
      ...(locked ? { selected: false } : {}),
    });
    this.modelService.updateNodeData<MapImageNodeData>(imageId, {
      imageUrl: map.imageUrl,
      locked,
    });
    if (locked) {
      this.selectionService.deselect([imageId]);
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

  onPaletteItemDropped(event: PaletteItemDroppedEvent) {
    if (event.node.type !== CHARACTER_NODE_TYPE) return;
    const data = event.node.data as CharacterNodeData;
    const className = data.characterClass;
    const sameClass = this.modelService
      .nodes()
      .filter(
        (n) =>
          n.id !== event.node.id &&
          (n.data as CharacterNodeData)?.characterClass === className,
      );
    if (sameClass.length === 0) return;
    this.modelService.updateNodeData<CharacterNodeData>(event.node.id, {
      ...data,
      label: `${className} ${sameClass.length + 1}`,
    });
  }

  openAddCharacterDialog() {
    this.addCharacterDialogOpen.set(true);
  }

  onAddCharacterSubmit(type: CharacterType) {
    this.addCharacterDialogOpen.set(false);
    const className = type.label;
    const sameClass = this.modelService
      .nodes()
      .filter((n) => (n.data as CharacterNodeData)?.characterClass === className);
    const label =
      sameClass.length === 0 ? className : `${className} ${sameClass.length + 1}`;
    const x = 80 + Math.floor(Math.random() * 500);
    const y = 100 + Math.floor(Math.random() * 400);
    this.modelService.addNodes([
      {
        id: `char-${crypto.randomUUID()}`,
        type: CHARACTER_NODE_TYPE,
        position: { x, y },
        size: { width: 100, height: 100 },
        autoSize: false,
        resizable: true,
        data: { label, characterClass: className },
      } as Node<CharacterNodeData>,
    ]);
  }

  /** Persist map-image node movement / resize / rotation back to the active map. */
  private persistMapImageNodeState() {
    const id = this.activeMapId();
    const node = this.modelService.getNodeById(mapImageNodeId(id));
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

  /** Snapshot the live diagram model + viewport into the given map entry. */
  private saveMapState(id: string) {
    const nodes = this.modelService
      .nodes()
      .filter((n) => n.type !== MAP_IMAGE_NODE_TYPE)
      .map((n) => stripVolatileNodeFields(n));
    const edges = this.modelService.edges().map((e) => stripVolatileEdgeFields(e));
    const viewport = { ...this.viewportService.viewport() };
    this.maps.update((list) =>
      list.map((m) => (m.id === id ? { ...m, nodes, edges, viewport } : m)),
    );
  }

  /** Replace the live diagram contents with the given map's saved state. */
  private async applyMapState(id: string) {
    const map = this.maps().find((m) => m.id === id) ?? null;
    const imageNode = this.buildMapImageNode(map);
    const savedNodes = map?.nodes ?? [];
    const savedEdges = map?.edges ?? [];
    const targetNodes: Node[] = imageNode
      ? [imageNode, ...savedNodes]
      : [...savedNodes];

    // Two sequential transactions: a single delete-then-readd-same-id inside
    // one transaction silently drops the delete in ng-diagram, leaving stale
    // nodes behind.
    const existingIds = this.modelService.nodes().map((n) => n.id);
    const existingEdgeIds = this.modelService.edges().map((e) => e.id);
    if (existingIds.length > 0 || existingEdgeIds.length > 0) {
      await this.diagramService.transaction(() => {
        if (existingIds.length > 0) this.modelService.deleteNodes(existingIds);
        if (existingEdgeIds.length > 0)
          this.modelService.deleteEdges(existingEdgeIds);
      });
    }

    if (targetNodes.length > 0 || savedEdges.length > 0) {
      await this.diagramService.transaction(
        () => {
          if (targetNodes.length > 0) this.modelService.addNodes(targetNodes);
          if (savedEdges.length > 0)
            this.modelService.addEdges([...savedEdges]);
        },
        { waitForMeasurements: true },
      );
    }

    if (map?.viewport) {
      const v = map.viewport;
      this.viewportService.setViewport(v.x, v.y, v.scale);
    } else if (imageNode) {
      this.viewportService.zoomToFit({
        nodeIds: [imageNode.id],
        padding: 24,
      });
    }

    // Force re-measurement of every node/port at the *final* viewport. Without
    // this, nodes are measured during addNodes() above with whatever viewport
    // was carried over from the previous tab. If the previous tab was zoomed,
    // their cached DOM bounds are offset and subsequent hit-testing misses the
    // visible node — cursor doesn't even change on hover.
    this.diagramService.invalidateMeasurements();
  }

  private buildMapImageNode(map: MapEntry | null): Node<MapImageNodeData> | null {
    if (!map?.imageUrl || !map.width || !map.height) return null;
    const state = map.imageNode;
    const locked = !!map.imageLocked;
    return {
      id: mapImageNodeId(map.id),
      type: MAP_IMAGE_NODE_TYPE,
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
  }
}

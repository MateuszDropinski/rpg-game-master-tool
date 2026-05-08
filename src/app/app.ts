import { Component, computed, signal } from '@angular/core';
import {
  initializeModel,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  NgDiagramEdgeTemplateMap,
  NgDiagramNodeTemplateMap,
  provideNgDiagram,
  type NgDiagramConfig,
} from 'ng-diagram';

import { CircleAreaComponent } from './circle/circle-area.component';
import { Cube } from './cube/cube';
import { LibrarySidebarComponent } from './components/library-sidebar/library-sidebar.component';
import { MapSwitcherComponent } from './components/map-switcher/map-switcher.component';
import { mapBackgroundFromFile, MapEntry } from './models/map.model';
import { RulerEdgeComponent } from './ruler/ruler-edge.component';
import { RulerEndpointComponent } from './ruler/ruler-endpoint.component';
import { ToolbarComponent } from './tools/toolbar.component';

@Component({
  selector: 'app-root',
  imports: [
    NgDiagramComponent,
    NgDiagramBackgroundComponent,
    Cube,
    LibrarySidebarComponent,
    MapSwitcherComponent,
    ToolbarComponent,
  ],
  providers: [provideNgDiagram()],
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
  model = initializeModel({ nodes: [], edges: [] });

  config = {
    background: { cellSize: { width: 20, height: 20 } },
  } satisfies NgDiagramConfig;

  nodeTemplateMap = new NgDiagramNodeTemplateMap([
    ['ruler-endpoint', RulerEndpointComponent],
    ['spell-area', CircleAreaComponent],
  ]);

  edgeTemplateMap = new NgDiagramEdgeTemplateMap([
    ['ruler', RulerEdgeComponent],
  ]);

  readonly sidebarCollapsed = signal(false);

  readonly maps = signal<MapEntry[]>([
    { id: 'map-1', name: 'Map 1', background: '#2f4f4f' },
    { id: 'map-2', name: 'Map 2', background: '#5d3a1a' },
  ]);

  readonly activeMapId = signal('map-1');

  readonly activeBackground = computed(
    () => this.maps().find((m) => m.id === this.activeMapId())?.background ?? '#222',
  );

  setActiveMap(id: string) {
    this.activeMapId.set(id);
  }

  addMap({ name, file }: { name: string; file: File }) {
    const { background, objectUrl } = mapBackgroundFromFile(file);
    const id = `map-${crypto.randomUUID()}`;
    this.maps.update((list) => [...list, { id, name, background, objectUrl }]);
    this.activeMapId.set(id);
  }

  onAddLibraryItem() {
    // Library "Add" is intentionally a no-op for now.
  }
}

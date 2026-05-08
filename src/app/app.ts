import { Component } from '@angular/core';
import {
  initializeModel,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  provideNgDiagram,
  type NgDiagramConfig,
} from 'ng-diagram';

@Component({
  selector: 'app-root',
  imports: [NgDiagramComponent, NgDiagramBackgroundComponent],
  providers: [provideNgDiagram()],
  templateUrl: './app.html',
  styles: `
    :host {
      display: flex;
      height: 100%;
      width: 100%;
    }
  `,
})
export class App {
  model = initializeModel({ nodes: [], edges: [] });

  config = {
    background: { cellSize: { width: 20, height: 20 } },
  } satisfies NgDiagramConfig;
}

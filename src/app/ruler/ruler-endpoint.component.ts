import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { NgDiagramNodeTemplate, Node } from 'ng-diagram';

@Component({
  selector: 'app-ruler-endpoint',
  template: '',
  styles: `
    :host {
      display: block;
      width: 0;
      height: 0;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulerEndpointComponent implements NgDiagramNodeTemplate {
  node = input.required<Node>();
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgDiagramNodeResizeAdornmentComponent,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram';

export type MapImageNodeData = { imageUrl: string; locked?: boolean };

@Component({
  selector: 'app-map-image-node',
  imports: [
    NgDiagramNodeResizeAdornmentComponent,
    NgDiagramNodeRotateAdornmentComponent,
  ],
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  host: {
    '[class.locked]': '!!node().data.locked',
  },
  templateUrl: './map-image-node.component.html',
  styleUrl: './map-image-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapImageNodeComponent
  implements NgDiagramNodeTemplate<MapImageNodeData>
{
  node = input.required<Node<MapImageNodeData>>();
}

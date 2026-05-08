import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  NgDiagramNodeResizeAdornmentComponent,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram';
import { CHARACTER_TYPES, type CharacterNodeData } from '../../models/character.model';

const CLASS_IMAGE_MAP = new Map(CHARACTER_TYPES.map((t) => [t.label, t.imageUrl]));

@Component({
  selector: 'app-node-character',
  imports: [
    NgDiagramNodeRotateAdornmentComponent,
    NgDiagramNodeResizeAdornmentComponent,
  ],
  templateUrl: './node-character.component.html',
  styleUrl: './node-character.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
})
export class NodeCharacterComponent implements NgDiagramNodeTemplate<CharacterNodeData> {
  node = input.required<Node<CharacterNodeData>>();

  protected readonly imageUrl = computed(
    () => CLASS_IMAGE_MAP.get(this.node().data.characterClass) ?? null,
  );
}

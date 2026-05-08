import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAxe,
  phosphorFlame,
  phosphorHeart,
  phosphorMagicWand,
  phosphorMaskHappy,
  phosphorPawPrint,
  phosphorShield,
  phosphorTarget,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import {
  NgDiagramNodeResizeAdornmentComponent,
  NgDiagramNodeRotateAdornmentComponent,
  NgDiagramNodeSelectedDirective,
  NgDiagramPortComponent,
  type NgDiagramNodeTemplate,
  type Node,
} from 'ng-diagram';
import { CHARACTER_TYPES } from '../add-character-dialog/add-character-dialog.component';

export type CharacterNodeData = {
  name: string;
  characterClass: string;
  hp: number;
  maxHp: number;
};

const CLASS_ICON_MAP = new Map(CHARACTER_TYPES.map((t) => [t.label, t.icon]));

@Component({
  selector: 'app-node-character',
  imports: [
    NgIcon,
    NgDiagramNodeRotateAdornmentComponent,
    NgDiagramNodeResizeAdornmentComponent,
    NgDiagramPortComponent,
  ],
  providers: [
    provideIcons({
      phosphorUser,
      phosphorMagicWand,
      phosphorFlame,
      phosphorPawPrint,
      phosphorShield,
      phosphorMaskHappy,
      phosphorTarget,
      phosphorHeart,
      phosphorAxe,
    }),
  ],
  templateUrl: './node-character.component.html',
  styleUrl: './node-character.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    { directive: NgDiagramNodeSelectedDirective, inputs: ['node'] },
  ],
  host: {
    '[class.ng-diagram-port-hoverable-over-node]': 'true',
  },
})
export class NodeCharacterComponent implements NgDiagramNodeTemplate<CharacterNodeData> {
  node = input.required<Node<CharacterNodeData>>();

  protected readonly iconName = computed(
    () => CLASS_ICON_MAP.get(this.node().data.characterClass) ?? 'phosphorUser',
  );

  protected readonly hpPercent = computed(() => {
    const { hp, maxHp } = this.node().data;
    return maxHp > 0 ? Math.round((hp / maxHp) * 100) : 0;
  });

  protected readonly hpColor = computed(() => {
    const pct = this.hpPercent();
    if (pct > 60) return '#4caf50';
    if (pct > 30) return '#ff9800';
    return '#f44336';
  });
}

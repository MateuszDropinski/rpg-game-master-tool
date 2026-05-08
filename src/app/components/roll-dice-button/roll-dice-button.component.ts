import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorDiceSix } from '@ng-icons/phosphor-icons/regular';

@Component({
  selector: 'app-roll-dice-button',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorDiceSix })],
  templateUrl: './roll-dice-button.component.html',
  styleUrl: './roll-dice-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RollDiceButtonComponent {
  readonly disabled = input(false);
  readonly roll = output<void>();
}

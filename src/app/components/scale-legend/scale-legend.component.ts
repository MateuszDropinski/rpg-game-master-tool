import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-scale-legend',
  templateUrl: './scale-legend.component.html',
  styleUrl: './scale-legend.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleLegendComponent {
  cellValue = input.required<number>();
  unit = input.required<string>();

  cellValueChange = output<number>();
  unitChange = output<string>();

  onValueInput(event: Event) {
    const raw = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(raw) || raw <= 0) return;
    this.cellValueChange.emit(Math.round(raw));
  }

  onUnitInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.unitChange.emit(value);
  }
}

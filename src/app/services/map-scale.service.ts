import { computed, Injectable, signal } from '@angular/core';

/**
 * Single source of truth for converting flow-space pixels into the user's
 * configured world units (e.g. feet, meters). The grid overlay renders cells
 * at `CELL_PX` flow-pixels, and the user labels one such cell as `cellValue`
 * `unit`s — so a ruler's pixel distance multiplied by `unitsPerPx` gives the
 * world distance to display.
 */
@Injectable({ providedIn: 'root' })
export class MapScaleService {
  /** Pixel size of one grid cell at zoom 1.0 (in flow-space pixels). */
  readonly cellPx = 50;

  readonly cellValue = signal(50);
  readonly unit = signal('ft');

  /** World units per flow-pixel. */
  readonly unitsPerPx = computed(() => this.cellValue() / this.cellPx);
}

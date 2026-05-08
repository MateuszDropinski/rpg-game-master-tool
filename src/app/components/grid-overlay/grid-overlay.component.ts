import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NgDiagramViewportService } from 'ng-diagram';

import { MapScaleService } from '../../services/map-scale.service';

/**
 * Translucent grid overlay rendered above the diagram canvas. Sits in flow
 * space (lines stay aligned with map content as the viewport pans/zooms) but
 * is layered above all nodes so the grid is always visible — including over
 * the map image node.
 *
 * The component is positioned absolute and `pointer-events: none` so it
 * doesn't intercept any interaction with the diagram below it.
 */
@Component({
  selector: 'app-grid-overlay',
  templateUrl: './grid-overlay.component.html',
  styleUrl: './grid-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridOverlayComponent {
  readonly cellPx = inject(MapScaleService).cellPx;

  private readonly viewport = inject(NgDiagramViewportService).viewport;

  readonly vx = computed(() => this.viewport().x);
  readonly vy = computed(() => this.viewport().y);
  readonly scale = computed(() => this.viewport().scale);

  /** On-screen pixel size of one grid cell at the current zoom. */
  readonly cellPxScaled = computed(() => this.cellPx * this.scale());
}

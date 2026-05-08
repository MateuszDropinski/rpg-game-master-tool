import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  NgDiagramBaseEdgeComponent,
  NgDiagramBaseEdgeLabelComponent,
  NgDiagramModelService,
  type Edge,
  type NgDiagramEdgeTemplate,
} from 'ng-diagram';

import { MapScaleService } from '../services/map-scale.service';

@Component({
  selector: 'app-ruler-edge',
  imports: [DecimalPipe, NgDiagramBaseEdgeComponent, NgDiagramBaseEdgeLabelComponent],
  template: `
    <ng-diagram-base-edge
      [edge]="anchoredEdge()"
      stroke="#f97316"
      [strokeWidth]="2"
      strokeDasharray="6 4"
    >
      <ng-diagram-base-edge-label id="ruler-distance" [positionOnEdge]="0.5">
        <div class="ruler-edge__label">
          {{ worldDistance() | number: '1.0-1' }} {{ unit() }}
        </div>
      </ng-diagram-base-edge-label>
    </ng-diagram-base-edge>
  `,
  styles: `
    .ruler-edge__label {
      background: #f97316;
      color: white;
      font-weight: 600;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      user-select: none;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulerEdgeComponent implements NgDiagramEdgeTemplate {
  private modelService = inject(NgDiagramModelService);
  private scaleService = inject(MapScaleService);

  edge = input.required<Edge>();

  anchoredEdge = computed<Edge>(() => {
    const e = this.edge();
    const nodes = this.modelService.nodes();
    const source = nodes.find((n) => n.id === e.source)?.position;
    const target = nodes.find((n) => n.id === e.target)?.position;
    if (!source || !target) return e;
    return {
      ...e,
      sourcePosition: source,
      targetPosition: target,
      points: [source, target],
      routing: 'polyline',
      routingMode: 'manual',
    };
  });

  private distancePx = computed(() => {
    const e = this.anchoredEdge();
    const s = e.sourcePosition;
    const t = e.targetPosition;
    if (!s || !t) return 0;
    return Math.hypot(t.x - s.x, t.y - s.y);
  });

  worldDistance = computed(
    () => this.distancePx() * this.scaleService.unitsPerPx(),
  );

  unit = this.scaleService.unit;
}

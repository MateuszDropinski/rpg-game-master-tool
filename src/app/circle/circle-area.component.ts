import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { NgDiagramNodeTemplate, Node } from 'ng-diagram';

import { MapScaleService } from '../services/map-scale.service';

export interface CircleAreaData {
  angle: number;
}

@Component({
  selector: 'app-circle-area',
  imports: [DecimalPipe],
  templateUrl: './circle-area.component.html',
  styleUrl: './circle-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleAreaComponent implements NgDiagramNodeTemplate<CircleAreaData> {
  private scaleService = inject(MapScaleService);

  node = input.required<Node<CircleAreaData>>();

  private radius = computed(() => (this.node().size?.width ?? 0) / 2);
  private angle = computed(() => this.node().data?.angle ?? 0);

  worldRadius = computed(
    () => this.radius() * this.scaleService.unitsPerPx(),
  );

  unit = this.scaleService.unit;

  selected = computed(() => this.node().selected ?? false);

  lineTransform = computed(
    () => `translateY(-50%) rotate(${this.angle()}rad)`
  );

  labelLeftPx = computed(() => {
    const r = this.radius();
    return r + (r / 2) * Math.cos(this.angle());
  });

  labelTopPx = computed(() => {
    const r = this.radius();
    return r + (r / 2) * Math.sin(this.angle());
  });
}

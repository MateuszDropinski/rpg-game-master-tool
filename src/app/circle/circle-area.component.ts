import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { NgDiagramNodeTemplate, Node } from 'ng-diagram';

export interface CircleAreaData {
  angle: number;
}

@Component({
  selector: 'app-circle-area',
  templateUrl: './circle-area.component.html',
  styleUrl: './circle-area.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleAreaComponent implements NgDiagramNodeTemplate<CircleAreaData> {
  node = input.required<Node<CircleAreaData>>();

  private radius = computed(() => (this.node().size?.width ?? 0) / 2);
  private angle = computed(() => this.node().data?.angle ?? 0);

  radiusPx = computed(() => Math.round(this.radius()));

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

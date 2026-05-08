import { Injectable, inject } from '@angular/core';
import { NgDiagramModelService, type Point } from 'ng-diagram';

import type { Tool } from '../tools/tool';

@Injectable()
export class CircleController implements Tool {
  private model = inject(NgDiagramModelService);
  private center: Point | null = null;
  private activeId: string | null = null;
  private nextId = 1;

  start(point: Point): void {
    this.center = point;
    this.activeId = `spell-area-${this.nextId++}`;
    this.model.addNodes([
      {
        id: this.activeId,
        position: point,
        type: 'spell-area',
        data: { angle: 0 },
        size: { width: 0, height: 0 },
        autoSize: false,
        draggable: false,
        resizable: false,
        rotatable: false,
      },
    ]);
  }

  move(point: Point): void {
    if (!this.center || !this.activeId) return;
    if (!this.model.getNodeById(this.activeId)) return;
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const radius = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    this.model.updateNode(this.activeId, {
      position: { x: this.center.x - radius, y: this.center.y - radius },
      size: { width: radius * 2, height: radius * 2 },
      data: { angle },
    });
  }

  end(): void {
    this.center = null;
    this.activeId = null;
  }

  cleanup(): void {
    if (this.activeId && this.model.getNodeById(this.activeId)) {
      this.model.deleteNodes([this.activeId]);
    }
    this.center = null;
    this.activeId = null;
  }
}

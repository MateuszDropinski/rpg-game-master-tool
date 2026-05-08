import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCircleDashed, phosphorRuler } from '@ng-icons/phosphor-icons/regular';
import { NgDiagramViewportService } from 'ng-diagram';

import { CircleController } from '../circle/circle.controller';
import { RulerController } from '../ruler/ruler.controller';
import type { Tool } from './tool';

type ToolName = 'ruler' | 'circle';

@Component({
  selector: 'app-toolbar',
  imports: [NgIcon],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  providers: [
    RulerController,
    CircleController,
    provideIcons({ phosphorRuler, phosphorCircleDashed }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  private viewport = inject(NgDiagramViewportService);
  private ruler = inject(RulerController);
  private circle = inject(CircleController);

  activeTool = signal<ToolName | null>(null);
  private dragging = false;

  toggle(name: ToolName) {
    const current = this.activeTool();
    if (current === name) {
      this.controllerFor(current)?.cleanup();
      this.dragging = false;
      this.activeTool.set(null);
      return;
    }
    if (current) {
      this.controllerFor(current)?.cleanup();
      this.dragging = false;
    }
    this.activeTool.set(name);
  }

  onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    const tool = this.currentController();
    if (!tool) return;
    event.preventDefault();
    (event.target as Element).setPointerCapture(event.pointerId);
    tool.start(this.toFlow(event));
    this.dragging = true;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.dragging) return;
    const tool = this.currentController();
    if (!tool) return;
    tool.move(this.toFlow(event));
  }

  onPointerUp() {
    if (!this.dragging) return;
    this.dragging = false;
    this.currentController()?.end();
  }

  private currentController(): Tool | null {
    return this.controllerFor(this.activeTool());
  }

  private controllerFor(name: ToolName | null): Tool | null {
    if (name === 'ruler') return this.ruler;
    if (name === 'circle') return this.circle;
    return null;
  }

  private toFlow(event: PointerEvent) {
    return this.viewport.clientToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAsterisk,
  phosphorChatCentered,
  phosphorMapPinLine,
  phosphorRuler,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import { NgDiagramViewportService } from 'ng-diagram';

import { CircleController } from '../circle/circle.controller';
import { RulerController } from '../ruler/ruler.controller';
import { NoteToolController } from './note-tool.controller';
import type { Tool } from './tool';

type ToolName = 'ruler' | 'circle' | 'note';

@Component({
  selector: 'app-toolbar',
  imports: [NgIcon],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  providers: [
    RulerController,
    CircleController,
    NoteToolController,
    provideIcons({
      phosphorRuler,
      phosphorAsterisk,
      phosphorChatCentered,
      phosphorMapPinLine,
      phosphorUser,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  private viewport = inject(NgDiagramViewportService);
  private ruler = inject(RulerController);
  private circle = inject(CircleController);
  private note = inject(NoteToolController);

  readonly addCharacterClicked = output<void>();

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
    if (name === 'note') return this.note;
    return null;
  }

  private toFlow(event: PointerEvent) {
    return this.viewport.clientToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }
}

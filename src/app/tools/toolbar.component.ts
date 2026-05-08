import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorChatCentered,
  phosphorCircleDashed,
  phosphorMapPinLine,
  phosphorRuler,
  phosphorUser,
} from '@ng-icons/phosphor-icons/regular';
import {
  NgDiagramPaletteItemComponent,
  NgDiagramViewportService,
  type NgDiagramPaletteItem,
} from 'ng-diagram';

import {
  CHARACTER_NODE_TYPE,
  CHARACTER_TYPES,
  type CharacterNodeData,
  type CharacterType,
} from '../models/character.model';
import { CircleController } from '../circle/circle.controller';
import { RulerController } from '../ruler/ruler.controller';
import { NoteToolController } from './note-tool.controller';
import { PinToolController } from './pin-tool.controller';
import type { Tool } from './tool';

type ToolName = 'ruler' | 'circle' | 'note' | 'pin';

type CharacterPaletteEntry = {
  type: CharacterType;
  item: NgDiagramPaletteItem<CharacterNodeData>;
};

@Component({
  selector: 'app-toolbar',
  imports: [NgIcon, NgDiagramPaletteItemComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  providers: [
    RulerController,
    CircleController,
    NoteToolController,
    PinToolController,
    provideIcons({
      phosphorRuler,
      phosphorCircleDashed,
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
  private pin = inject(PinToolController);

  protected readonly characterEntries = computed<CharacterPaletteEntry[]>(() =>
    CHARACTER_TYPES.map((type) => ({
      type,
      item: {
        type: CHARACTER_NODE_TYPE,
        data: {
          label: type.label,
          characterClass: type.label,
        },
        // 2x2 grid cells at the default 50px cellPx. autoSize must be false,
        // otherwise ng-diagram measures the portrait's natural pixel dimensions
        // and the node becomes huge.
        size: { width: 100, height: 100 },
        autoSize: false,
        resizable: true,
        rotatable: true,
      },
    })),
  );

  activeTool = signal<ToolName | null>(null);
  characterFlyoutOpen = signal(false);
  private dragging = false;

  toggleCharacterFlyout() {
    this.characterFlyoutOpen.update((open) => !open);
  }

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
    this.activeTool.set(null);
  }

  /**
   * Forward wheel events to whatever sits under the cursor. Without this the
   * tool overlay swallows the event and ctrl+wheel triggers the browser's
   * page zoom instead of ng-diagram's canvas zoom.
   */
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const overlay = event.currentTarget as Element;
    const below = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((el) => el !== overlay && !overlay.contains(el));
    if (!below) return;
    below.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        deltaMode: event.deltaMode,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      }),
    );
  }

  private currentController(): Tool | null {
    return this.controllerFor(this.activeTool());
  }

  private controllerFor(name: ToolName | null): Tool | null {
    if (name === 'ruler') return this.ruler;
    if (name === 'circle') return this.circle;
    if (name === 'note') return this.note;
    if (name === 'pin') return this.pin;
    return null;
  }

  private toFlow(event: PointerEvent) {
    return this.viewport.clientToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }
}

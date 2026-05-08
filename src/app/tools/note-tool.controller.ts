import { Injectable, inject } from '@angular/core';
import { NgDiagramModelService, type Point } from 'ng-diagram';

import { NOTE_COLLAPSED_SIZE, NOTE_NODE_TYPE, type NoteData } from '../models/note.model';
import type { Tool } from './tool';

@Injectable()
export class NoteToolController implements Tool {
  private readonly model = inject(NgDiagramModelService);

  start(point: Point): void {
    const id = `note-${crypto.randomUUID()}`;
    this.model.addNodes([
      {
        id,
        type: NOTE_NODE_TYPE,
        position: {
          x: point.x - NOTE_COLLAPSED_SIZE.width / 2,
          y: point.y - NOTE_COLLAPSED_SIZE.height / 2,
        },
        size: { ...NOTE_COLLAPSED_SIZE },
        data: { label: 'Note', text: 'New note' } satisfies NoteData,
        autoSize: false,
      },
    ]);
  }

  move(): void {}

  end(): void {}

  cleanup(): void {}
}

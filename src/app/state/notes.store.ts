import { computed, inject, Injectable } from '@angular/core';
import {
  NgDiagramModelService,
  NgDiagramSelectionService,
  type NgDiagramPaletteItem,
  type Node,
} from 'ng-diagram';
import { NOTE_COLLAPSED_SIZE, NOTE_NODE_TYPE, NoteData } from '../models/note.model';

@Injectable()
export class NotesStore {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  readonly notes = computed<Node<NoteData>[]>(() =>
    this.modelService
      .nodes()
      .filter((n): n is Node<NoteData> => n.type === NOTE_NODE_TYPE),
  );

  readonly paletteItem: NgDiagramPaletteItem<NoteData> = {
    type: NOTE_NODE_TYPE,
    data: { label: 'Note', text: 'New note' },
    size: { ...NOTE_COLLAPSED_SIZE },
    autoSize: false,
  };

  updateText(id: string, text: string): void {
    const node = this.modelService.getNodeById<NoteData>(id);
    if (!node) {
      return;
    }
    this.modelService.updateNodeData<NoteData>(id, { ...node.data, text });
  }

  selectNote(id: string): void {
    this.selectionService.select([id]);
  }

  removeNote(id: string): void {
    this.modelService.deleteNodes([id]);
  }
}

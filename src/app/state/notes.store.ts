import { computed, inject, Injectable, signal } from '@angular/core';
import {
  NgDiagramModelService,
  NgDiagramSelectionService,
  type Node,
} from 'ng-diagram';
import { NOTE_NODE_TYPE, NoteData } from '../models/note.model';

@Injectable()
export class NotesStore {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  /** Notes belonging to non-active maps. Keyed by mapId. */
  private readonly archive = signal<Record<string, Node<NoteData>[]>>({});

  /** Notes for the active map (live in the ng-diagram model). */
  readonly activeMapNotes = computed<Node<NoteData>[]>(() =>
    this.modelService
      .nodes()
      .filter((n): n is Node<NoteData> => n.type === NOTE_NODE_TYPE),
  );

  /** All notes across all maps (archived + active). */
  readonly allNotes = computed<Node<NoteData>[]>(() => {
    const archived = Object.values(this.archive()).flat();
    return [...archived, ...this.activeMapNotes()];
  });

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

  /**
   * Move notes for `prevId` out of the diagram into the archive, and pull
   * notes for `nextId` from the archive back into the diagram. Preserves
   * each note's id, position, size, and data per map.
   */
  swapActiveMap(prevId: string, nextId: string): void {
    if (prevId === nextId) return;

    const current = this.activeMapNotes();
    const incoming = this.archive()[nextId] ?? [];

    if (current.length > 0) {
      this.modelService.deleteNodes(current.map((n) => n.id));
    }
    if (incoming.length > 0) {
      this.modelService.addNodes(incoming);
    }

    this.archive.update((map) => {
      const next = { ...map };
      if (current.length > 0) {
        next[prevId] = current;
      } else {
        delete next[prevId];
      }
      delete next[nextId];
      return next;
    });
  }
}

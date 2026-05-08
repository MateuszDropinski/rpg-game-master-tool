import { computed, inject, Injectable } from '@angular/core';
import { signal } from '@angular/core';
import {
  NgDiagramModelService,
  NgDiagramSelectionService,
  type Node,
} from 'ng-diagram';
import { PIN_NODE_TYPE, PinData } from '../models/pin.model';

@Injectable()
export class PinsStore {
  private readonly modelService = inject(NgDiagramModelService);
  private readonly selectionService = inject(NgDiagramSelectionService);

  /** Pins belonging to non-active maps. Keyed by mapId. */
  private readonly archive = signal<Record<string, Node<PinData>[]>>({});

  /** Pins for the active map (live in the ng-diagram model). */
  readonly activeMapPins = computed<Node<PinData>[]>(() =>
    this.modelService
      .nodes()
      .filter((n): n is Node<PinData> => n.type === PIN_NODE_TYPE),
  );

  /** All pins across all maps (archived + active). */
  readonly allPins = computed<Node<PinData>[]>(() => {
    const archived = Object.values(this.archive()).flat();
    return [...archived, ...this.activeMapPins()];
  });

  selectPin(id: string): void {
    this.selectionService.select([id]);
  }

  removePin(id: string): void {
    this.modelService.deleteNodes([id]);
  }

  /**
   * Move pins for `prevId` out of the diagram into the archive, and pull
   * pins for `nextId` from the archive back into the diagram. Preserves
   * each pin's id, position, size, and data per map.
   */
  swapActiveMap(prevId: string, nextId: string): void {
    if (prevId === nextId) return;

    const current = this.activeMapPins();
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

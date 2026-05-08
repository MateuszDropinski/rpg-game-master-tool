import { Injectable, inject } from '@angular/core';
import {
  NgDiagramModelService,
  NgDiagramSelectionService,
  type Point,
} from 'ng-diagram';

import { PIN_NODE_TYPE, PIN_SIZE, type PinData } from '../models/pin.model';
import { MapsStore } from '../state/maps.store';
import type { Tool } from './tool';

@Injectable()
export class PinToolController implements Tool {
  private readonly model = inject(NgDiagramModelService);
  private readonly selection = inject(NgDiagramSelectionService);
  private readonly mapsStore = inject(MapsStore);

  start(point: Point): void {
    const id = `pin-${crypto.randomUUID()}`;
    this.model.addNodes([
      {
        id,
        type: PIN_NODE_TYPE,
        position: {
          x: point.x - PIN_SIZE.width / 2,
          y: point.y - PIN_SIZE.height / 2,
        },
        size: { ...PIN_SIZE },
        data: {
          label: 'Pin',
          mapId: this.mapsStore.activeMapId(),
        } satisfies PinData,
        autoSize: false,
      },
    ]);
    queueMicrotask(() => this.selection.select([id]));
  }

  move(): void {}

  end(): void {}

  cleanup(): void {}
}

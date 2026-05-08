import { Injectable, inject } from '@angular/core';
import { NgDiagramModelService, type Node, type Point } from 'ng-diagram';

import type { Tool } from '../tools/tool';

const RULER_START_ID = '__ruler_start';
const RULER_END_ID = '__ruler_end';
const RULER_EDGE_ID = '__ruler_edge';

@Injectable()
export class RulerController implements Tool {
  private model = inject(NgDiagramModelService);

  start(point: Point): void {
    const endpoint = (id: string): Node => ({
      id,
      position: point,
      type: 'ruler-endpoint',
      data: {},
      size: { width: 0, height: 0 },
      autoSize: false,
      draggable: false,
      resizable: false,
      rotatable: false,
    });

    this.model.addNodes([endpoint(RULER_START_ID), endpoint(RULER_END_ID)]);
    this.model.addEdges([
      {
        id: RULER_EDGE_ID,
        source: RULER_START_ID,
        target: RULER_END_ID,
        type: 'ruler',
        data: {},
        routing: 'polyline',
      },
    ]);
  }

  move(point: Point): void {
    if (!this.model.getNodeById(RULER_END_ID)) return;
    this.model.updateNode(RULER_END_ID, { position: point });
  }

  end(): void {
    this.cleanup();
  }

  cleanup(): void {
    if (this.model.getEdgeById(RULER_EDGE_ID)) {
      this.model.deleteEdges([RULER_EDGE_ID]);
    }
    const nodeIds = [RULER_START_ID, RULER_END_ID].filter((id) =>
      this.model.getNodeById(id)
    );
    if (nodeIds.length > 0) {
      this.model.deleteNodes(nodeIds);
    }
  }
}

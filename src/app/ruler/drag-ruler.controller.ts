import { Injectable, inject } from '@angular/core';
import { NgDiagramModelService, type Node, type Point } from 'ng-diagram';

const START_ID = '__drag_ruler_start';
const END_ID = '__drag_ruler_end';
const EDGE_ID = '__drag_ruler_edge';

@Injectable()
export class DragRulerController {
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

    this.model.addNodes([endpoint(START_ID), endpoint(END_ID)]);
    this.model.addEdges([
      {
        id: EDGE_ID,
        source: START_ID,
        target: END_ID,
        type: 'ruler',
        data: {},
        routing: 'polyline',
      },
    ]);
  }

  move(point: Point): void {
    if (!this.model.getNodeById(END_ID)) return;
    this.model.updateNode(END_ID, { position: point });
  }

  cleanup(): void {
    if (this.model.getEdgeById(EDGE_ID)) this.model.deleteEdges([EDGE_ID]);
    const ids = [START_ID, END_ID].filter((id) => this.model.getNodeById(id));
    if (ids.length > 0) this.model.deleteNodes(ids);
  }
}

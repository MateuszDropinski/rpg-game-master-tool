import type { Point } from 'ng-diagram';

export interface Tool {
  start(point: Point): void;
  move(point: Point): void;
  end(): void;
  cleanup(): void;
}

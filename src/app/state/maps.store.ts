import { computed, Injectable, signal } from '@angular/core';

import {
  DEFAULT_CELL_VALUE,
  DEFAULT_UNIT,
  type MapEntry,
} from '../models/map.model';

@Injectable({ providedIn: 'root' })
export class MapsStore {
  readonly maps = signal<MapEntry[]>([
    {
      id: 'map-1',
      name: 'City',
      background: '#1a1a1a',
      imageUrl: 'world.jpeg',
      width: 1800,
      height: 1350,
      cellValue: DEFAULT_CELL_VALUE,
      unit: DEFAULT_UNIT,
    },
    {
      id: 'map-2',
      name: 'House',
      background: '#5d3a1a',
      imageUrl: 'location.jpeg',
      width: 1333,
      height: 1000,
      cellValue: DEFAULT_CELL_VALUE,
      unit: DEFAULT_UNIT,
    },
  ]);

  readonly activeMapId = signal('map-1');

  readonly activeMap = computed(
    () => this.maps().find((m) => m.id === this.activeMapId()) ?? null,
  );

  setActiveMap(id: string): void {
    this.activeMapId.set(id);
  }

  addMap(entry: MapEntry): void {
    this.maps.update((list) => [...list, entry]);
    this.activeMapId.set(entry.id);
  }

  updateActiveMap(patch: Partial<MapEntry>): void {
    const id = this.activeMapId();
    this.maps.update((list) =>
      list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }
}

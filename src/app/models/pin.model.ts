import type { BasePaletteItemData } from 'ng-diagram';

export interface PinData extends BasePaletteItemData {
  mapId: string;
}

export const PIN_NODE_TYPE = 'pin';

export const PIN_SIZE = { width: 24, height: 29 } as const;

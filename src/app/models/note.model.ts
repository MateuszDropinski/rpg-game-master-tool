import type { BasePaletteItemData } from 'ng-diagram';

export interface NoteData extends BasePaletteItemData {
  text: string;
  mapId: string;
}

export const NOTE_NODE_TYPE = 'note';

export const NOTE_COLLAPSED_SIZE = { width: 24, height: 29 } as const;
export const NOTE_EXPANDED_SIZE = { width: 240, height: 48 } as const;

import type { BasePaletteItemData } from 'ng-diagram';

export interface NoteData extends BasePaletteItemData {
  text: string;
}

export const NOTE_NODE_TYPE = 'note';

export const NOTE_COLLAPSED_SIZE = { width: 48, height: 48 } as const;
export const NOTE_EXPANDED_SIZE = { width: 220, height: 160 } as const;

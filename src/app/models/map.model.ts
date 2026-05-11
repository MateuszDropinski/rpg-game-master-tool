import type { Edge, Node, Viewport } from 'ng-diagram';

export interface MapImageNodeState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  angle: number;
}

/** Solid color shown on the diagram host (letterbox bands + color-only maps). */
export const MAP_BACKGROUND = '#1a1a1a';

export interface MapEntry {
  id: string;
  name: string;
  /** Solid color shown behind the map image (letterbox bands + color-only maps). */
  background?: string;
  /** Object URL for an uploaded image, if any. */
  imageUrl?: string;
  /** Natural pixel dimensions of the uploaded image. */
  width?: number;
  height?: number;
  /** Persisted resize/rotate/drag state for the map's image node. */
  imageNode?: MapImageNodeState;
  /** When true, the image node ignores pointer events and can't be moved/resized/rotated. */
  imageLocked?: boolean;
  /** What one grid cell represents in `unit`s. */
  cellValue: number;
  /** Free-form unit label, e.g. "ft", "m", "miles", "tiles". */
  unit: string;
  /** Persisted non-image nodes (characters, notes, spell areas, ...). */
  nodes?: Node[];
  /** Persisted edges. */
  edges?: Edge[];
  /** Persisted viewport (pan + zoom). */
  viewport?: Viewport;
}

export const DEFAULT_CELL_VALUE = 50;
export const DEFAULT_UNIT = 'ft';

export async function loadMapImage(
  file: File,
): Promise<{ objectUrl: string; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    });
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
  return { objectUrl, width: img.naturalWidth, height: img.naturalHeight };
}

export interface MapImageNodeState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  angle: number;
}

export interface MapEntry {
  id: string;
  name: string;
  /** CSS color shown when no image is set (also fills the letterbox bands). */
  background: string;
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

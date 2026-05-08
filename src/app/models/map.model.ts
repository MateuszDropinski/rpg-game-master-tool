export interface MapEntry {
  id: string;
  name: string;
  background: string;
  objectUrl?: string;
}

export function mapBackgroundFromFile(file: File): { background: string; objectUrl: string } {
  const objectUrl = URL.createObjectURL(file);
  return {
    objectUrl,
    background: `#1a1a1a url("${objectUrl}") center/cover no-repeat`,
  };
}

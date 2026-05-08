import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

const SPIN_DURATION_MS = 3000;
const EXTRA_SPINS_PER_DRAW_Y = 1080;
const EXTRA_SPINS_PER_DRAW_X = 720;

@Component({
  selector: 'app-cube',
  templateUrl: './cube.html',
  styleUrl: './cube.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cube {
  readonly size = input<number>(200);
  readonly multiplier = input<number>(1);
  readonly value = input<number>(1);

  protected readonly icosa = computed(() => buildIcosahedron(this.size(), this.multiplier()));

  private readonly drawnFace = signal<number | null>(null);
  private readonly displayedFace = signal<number | null>(null);
  private readonly spinCount = signal(0);
  protected readonly isAnimating = signal(false);
  protected readonly visible = signal(false);

  private readonly initialFace = computed(() => {
    const v = this.value();
    const m = this.multiplier() || 1;
    return clamp(Math.round(v / m), 1, 20);
  });

  protected readonly currentFace = computed(() => this.drawnFace() ?? this.initialFace());

  protected readonly currentValue = computed(
    () => (this.displayedFace() ?? this.initialFace()) * this.multiplier(),
  );

  protected readonly cubeTransform = computed(() => {
    const face = this.icosa().faces[this.currentFace() - 1];
    if (!face) return '';
    const spins = this.spinCount();
    const extraY = spins * EXTRA_SPINS_PER_DRAW_Y;
    const extraX = spins * EXTRA_SPINS_PER_DRAW_X;
    return `rotateZ(${-face.roll}deg) rotateX(${-face.pitch - extraX}deg) rotateY(${-face.yaw - extraY}deg)`;
  });

  draw(): void {
    if (this.isAnimating()) return;
    this.visible.set(true);
    this.isAnimating.set(true);
    const drawn = Math.floor(Math.random() * 20) + 1;
    this.drawnFace.set(drawn);
    this.spinCount.update(n => n + 1);
    setTimeout(() => {
      this.displayedFace.set(drawn);
      this.isAnimating.set(false);
    }, SPIN_DURATION_MS);
  }

  hide(): void {
    this.visible.set(false);
  }
}

interface FaceData {
  label: number;
  yaw: number;
  pitch: number;
  roll: number;
  hue: number;
}

interface IcosaData {
  faces: FaceData[];
  edge: number;
  dist: number;
}

const PHI = (1 + Math.sqrt(5)) / 2;
const R_NORM = Math.sqrt(1 + PHI * PHI);

const VERTS: ReadonlyArray<readonly [number, number, number]> = [
  [0,  1,  PHI], [0,  1, -PHI], [0, -1,  PHI], [0, -1, -PHI],
  [ 1,  PHI, 0], [ 1, -PHI, 0], [-1,  PHI, 0], [-1, -PHI, 0],
  [ PHI, 0,  1], [ PHI, 0, -1], [-PHI, 0,  1], [-PHI, 0, -1],
];

const FACE_INDICES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 2, 8],  [0, 8, 4],  [0, 4, 6],  [0, 6, 10], [0, 10, 2],
  [3, 1, 9],  [3, 9, 5],  [3, 5, 7],  [3, 7, 11], [3, 11, 1],
  [2, 10, 7], [2, 7, 5],  [2, 5, 8],  [8, 5, 9],  [8, 9, 4],
  [4, 9, 1],  [4, 1, 6],  [6, 1, 11], [6, 11, 10], [10, 11, 7],
];

function buildIcosahedron(size: number, multiplier: number): IcosaData {
  const scale = size / 2 / R_NORM;
  const verts = VERTS.map(([x, y, z]) => [x * scale, y * scale, z * scale] as const);
  const edge = 2 * scale;

  let dist = 0;
  const faces = FACE_INDICES.map((idx, i) => {
    const A = verts[idx[0]], B = verts[idx[1]], C = verts[idx[2]];
    const cx = (A[0] + B[0] + C[0]) / 3;
    const cy = (A[1] + B[1] + C[1]) / 3;
    const cz = (A[2] + B[2] + C[2]) / 3;
    const d = Math.hypot(cx, cy, cz);
    if (i === 0) dist = d;

    const yaw = Math.atan2(cx, cz);
    const pitch = Math.asin(cy / d);

    const ux = A[0] - cx, uy = A[1] - cy, uz = A[2] - cz;
    const ulen = Math.hypot(ux, uy, uz);
    const Ux = ux / ulen, Uy = uy / ulen, Uz = uz / ulen;

    const sB = Math.sin(yaw), cB = Math.cos(yaw);
    const sA = Math.sin(pitch), cA = Math.cos(pitch);

    const uxLocal = Ux * cB - Uz * sB;
    const uyLocal = Ux * sB * sA - Uy * cA + Uz * cB * sA;
    const roll = Math.atan2(uxLocal, -uyLocal);

    return {
      label: (i + 1) * multiplier,
      yaw: toDeg(yaw),
      pitch: toDeg(pitch),
      roll: toDeg(roll),
      hue: Math.round((i / FACE_INDICES.length) * 360),
    } satisfies FaceData;
  });

  return { faces, edge, dist };
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

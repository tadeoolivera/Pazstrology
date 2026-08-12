

import { CENTER } from '../data/config.tsx';

export const norm360 = (a: number) => ((a % 360) + 360) % 360;

export const toXY = (angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
};

export const circularDistance = (a: number, b: number) => {
  const d = Math.abs(norm360(a - b));
  return Math.min(d, 360 - d);
};
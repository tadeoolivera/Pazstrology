import { CENTER } from '../data/config.tsx';

// Normaliza cualquier ángulo para que siempre esté entre 0 y 359.999...
export const norm360 = (a: number) => ((a % 360) + 360) % 360;

// Fix de UI para la entrada del Mouse
export const pointerToAstroAngle = (dx: number, dy: number) => {
  const trigAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return norm360(180 - trigAngle);
};

// Adaptar la UI a la forma que tiene la astrología de medir las cosas (sentido antihorario y grado 0° a la izquierda)
export const toXY = (astroAngle: number, radius: number) => {
  const rad = ((180 - astroAngle) * Math.PI) / 180;
  return { 
    x: CENTER + radius * Math.cos(rad), 
    y: CENTER + radius * Math.sin(rad) 
  };
};

export const circularDistance = (a: number, b: number) => {
  const d = Math.abs(norm360(a - b));
  return Math.min(d, 360 - d);
};
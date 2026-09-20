export const DIAMETER_COUNT = 6;
export const RADIO = 140;
export const MIN_GAP = 1;
export const SIGN_ICON_SIZE = 30;
export const PLANET_ICON_SIZE = 30;

export const BORDER_COLOR = '#8A5A22';
export const LINE_COLOR = '#5C3A14';
export const RING_OUTER = 360;
export const RING_INNER = RADIO + RING_OUTER / 2.2;
export const NUMBERS_RING_INNER = RING_OUTER;
export const NUMBERS_RING_OUTER = NUMBERS_RING_INNER + 50;
export const SIZE = (NUMBERS_RING_OUTER + 20) * 2;
export const CENTER = SIZE / 2;

// Radio en el que se ubican los planetas
export const PLANETS_RADIUS = RING_INNER - PLANET_ICON_SIZE - 19;

// Radio en el que se ubican los aspectos (un poco más chico que el de los plnetas)
export const ASPECTS_RADIUS = PLANETS_RADIUS - 18;
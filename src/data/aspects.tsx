export const ASPECTS = [
  { name: 'conjunción', angle: 0, margin: 10, color: '#9025B8', minor: false },
  { name: 'oposición', angle: 180, margin: 10, color: '#E11519', minor: false },
  { name: 'cuadratura', angle: 90, margin: 8, color: '#E11519', minor: false },
  { name: 'trígono', angle: 120, margin: 8, color: '#1614DF', minor: false },
  { name: 'sextil', angle: 60, margin: 6, color: '#1614DF', minor: false },
  { name: 'inconjunción', angle: 150, margin: 2, color: '#CCBD27', minor: true },
  { name: 'quintil', angle: 72, margin: 2, color: '#40CC27', minor: true },
  { name: 'biquintil', angle: 144, margin: 2, color: '#40CC27', minor: true }
] as const;

export type Aspect = (typeof ASPECTS)[number];
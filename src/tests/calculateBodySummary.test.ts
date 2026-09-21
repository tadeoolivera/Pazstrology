import { describe, it, expect } from 'vitest';
import { calculateBodySummaries } from '../utils/summary.ts';
import C1 from './data/testChart1.json';
import C2 from './data/testChart2.json';

describe('calculateBodySummaries', () => {

  const bypass = expect.any(String); // Bypass para el color

  // Casos de prueba con respecto a cartas astrales que fueron previamente calculadas y verificadas manualmente
  it('Debe calcular el resúmen entre casa, signo, cuerpo y grado correctamente acorde a los datos de la carta C1', () => {  
    const result = calculateBodySummaries(C1.angles, C1.ringRotation, C1.planetAngles, C1.asteroidAngles);
    expect(result).toEqual([
      { color: bypass, house: 1, sign: 'aries', name: 'sun', degree: '0°0\'' },
      { color: bypass, house: 2, sign: 'taurus', name: 'moon', degree: '0°0\'' },
      { color: bypass, house: 1, sign: 'aries', name: 'mercury', degree: '14°0\'' },
      { color: bypass, house: 1, sign: 'aries', name: 'venus', degree: '24°0\'' },
      { color: bypass, house: 5, sign: 'leo', name: 'mars', degree: '0°0\'' },
      { color: bypass, house: 6, sign: 'virgo', name: 'jupiter', degree: '0°0\'' },
      { color: bypass, house: 7, sign: 'libra', name: 'saturn', degree: '0°0\'' },
      { color: bypass, house: 8, sign: 'scorpio', name: 'uranus', degree: '0°0\'' },
      { color: bypass, house: 9, sign: 'sagittarius', name: 'neptune', degree: '0°0\'' },
      { color: bypass, house: 10, sign: 'capricorn', name: 'pluto', degree: '0°0\'' },
      { color: bypass, house: 1, sign: 'aries', name: 'southNode', degree: '15°0\'' },
      { color: bypass, house: 7, sign: 'libra', name: 'northNode', degree: '15°0\'' },
      { color: bypass, house: 3, sign: 'gemini', name: 'chiron', degree: '15°0\'' },
      { color: bypass, house: 4, sign: 'cancer', name: 'lilith', degree: '15°0\'' },
    ]);
  });

  it('Debe calcular el resúmen entre casa, signo, cuerpo y grado correctamente acorde a los datos de la carta C2', () => {
    const result = calculateBodySummaries(C2.angles, C2.ringRotation, C2.planetAngles, C2.asteroidAngles);
    expect(result).toEqual([
      { color: bypass, house: 1, sign: 'aquarius', name: 'sun', degree: '16°59\'' },
      { color: bypass, house: 9, sign: 'libra', name: 'moon', degree: '18°3\'' },
      { color: bypass, house: 1, sign: 'aquarius', name: 'mercury', degree: '10°44\'' },
      { color: bypass, house: 2, sign: 'pisces', name: 'venus', degree: '14°24\'' },
      { color: bypass, house: 6, sign: 'cancer', name: 'mars', degree: '0°42\'' },
      { color: bypass, house: 7, sign: 'leo', name: 'jupiter', degree: '23°20\'' },
      { color: bypass, house: 5, sign: 'gemini', name: 'saturn', degree: '21°16\'' },
      { color: bypass, house: 9, sign: 'libra', name: 'uranus', degree: '23°47\'' },
      { color: bypass, house: 4, sign: 'taurus', name: 'neptune', degree: '10°15\'' },
      { color: bypass, house: 10, sign: 'scorpio', name: 'pluto', degree: '2°21\'' },
      { color: bypass, house: 1, sign: 'aquarius', name: 'chiron', degree: '27°15\'' },
      { color: bypass, house: 4, sign: 'aries', name: 'lilith', degree: '28°54\'' },
    ]);
  })
})
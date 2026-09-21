import { describe, it, expect } from 'vitest';
import { getCuspDetails } from '../utils/summary.ts';

describe('getCuspDetails', () => {

  // 1. Casos para verificar que las conexiones entre las cúspides de las casas y los signos se calculan correctamente en una carta por defecto (es decir, con las casas en su posición inicial ocupando 30° cada una y sin rotación de la rueda donde se ubican los signos)
  it('1.1. Debe devolver el signo Aries con la cúspide de la Casa 1 en 0°0\' cuando el ángulo es 0° y no hay rotación', () => {
    const result = getCuspDetails(0, 0);
    expect(result).toEqual({ sign: 'aries', degree: '0°0\'' });
  });
  it('1.2. Debe devolver el signo Tauro con la cúspide de la Casa 2 en 0°0\' cuando el ángulo es 30° y no hay rotación', () => {
    const result = getCuspDetails(30, 0);
    expect(result).toEqual({ sign: 'taurus', degree: '0°0\'' });
  });
  it('1.3. Debe devolver el signo Géminis con la cúspide de la Casa 3 en 0°0\' cuando el ángulo es 60° y no hay rotación', () => {
    const result = getCuspDetails(60, 0);
    expect(result).toEqual({ sign: 'gemini', degree: '0°0\'' });
  });
  it('1.4. Debe devolver el signo Cáncer con la cúspide de la Casa 4 en 0°0\' cuando el ángulo es 90° y no hay rotación', () => {
    const result = getCuspDetails(90, 0);
    expect(result).toEqual({ sign: 'cancer', degree: '0°0\'' });
  });
  it('1.5. Debe devolver el signo Leo con la cúspide de la Casa 5 en 0°0\' cuando el ángulo es 120° y no hay rotación', () => {
    const result = getCuspDetails(120, 0);
    expect(result).toEqual({ sign: 'leo', degree: '0°0\'' });
  });
  it('1.6. Debe devolver el signo Virgo con la cúspide de la Casa 6 en 0°0\' cuando el ángulo es 150° y no hay rotación', () => {
    const result = getCuspDetails(150, 0);
    expect(result).toEqual({ sign: 'virgo', degree: '0°0\'' });
  });
  it('1.7. Debe devolver el signo Libra con la cúspide de la Casa 7 en 0°0\' cuando el ángulo es 180° y no hay rotación', () => {
    const result = getCuspDetails(180, 0);
    expect(result).toEqual({ sign: 'libra', degree: '0°0\'' });
  });
  it('1.8. Debe devolver el signo Escorpio con la cúspide de la Casa 8 en 0°0\' cuando el ángulo es 210° y no hay rotación', () => {
    const result = getCuspDetails(210, 0);
    expect(result).toEqual({ sign: 'scorpio', degree: '0°0\'' });
  });
  it('1.9. Debe devolver el signo Sagitario con la cúspide de la Casa 9 en 0°0\' cuando el ángulo es 240° y no hay rotación', () => {
    const result = getCuspDetails(240, 0);
    expect(result).toEqual({ sign: 'sagittarius', degree: '0°0\'' });
  });
  it('1.10. Debe devolver el signo Capricornio con la cúspide de la Casa 10 en 0°0\' cuando el ángulo es 270° y no hay rotación', () => {
    const result = getCuspDetails(270, 0);
    expect(result).toEqual({ sign: 'capricorn', degree: '0°0\'' });
  });
  it('1.11. Debe devolver el signo Acuario con la cúspide de la Casa 11 en 0°0\' cuando el ángulo es 300° y no hay rotación', () => {
    const result = getCuspDetails(300, 0);
    expect(result).toEqual({ sign: 'aquarius', degree: '0°0\'' });
  });
  it('1.12. Debe devolver el signo Piscis con la cúspide de la Casa 12 en 0°0\' cuando el ángulo es 330° y no hay rotación', () => {
    const result = getCuspDetails(330, 0);
    expect(result).toEqual({ sign: 'pisces', degree: '0°0\'' });
  });
});

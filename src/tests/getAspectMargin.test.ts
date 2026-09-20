import { describe, it, expect } from 'vitest'
import { getAspectMargin, type Aspect } from '../data/aspects'

describe('getAspectMargin', () => {
  const majorAspect = { 
    minor: false,
    margin: 8
  } as Aspect;

  const minorAspect = {
    minor: true,
    margin: 2
  } as Aspect

  // 1. Casos con cuerpos comúnes
  it('1.1. debe devolver el margen del aspecto mayor correspondiente si no incluye a Lilith, Chiron o los nodos', () => {
    const result = getAspectMargin(majorAspect, ['sun', 'moon'])
    expect(result).toBe(8)
  })

  it('1.2. debe devolver el margen del aspecto menor correspondiente si no incluye a Lilith, Chiron o los nodos', () => {
    const result = getAspectMargin(minorAspect, ['sun', 'moon'])
    expect(result).toBe(2)
  })

  // 2. Casos con Lilith
  it('2.1. debe devolver 3 si incluye a Lilith en un aspecto mayor', () => {
    const result = getAspectMargin(majorAspect, ['lilith', 'sun'])
    expect(result).toBe(3)
  })

  it('2.2. debe devolver 1 si incluye a Lilith en un aspecto menor', () => {
    const result = getAspectMargin(minorAspect, ['lilith', 'sun'])
    expect(result).toBe(1)
  })

  // 3. Casos con Chiron
  it('3.1. debe devolver 6 si incluye a Chiron en un aspecto mayor', () => {
    const result = getAspectMargin(majorAspect, ['chiron', 'sun'])
    expect(result).toBe(6)
  })

  it('3.2. debe devolver 1 si incluye a Chiron en un aspecto menor', () => {
    const result = getAspectMargin(minorAspect, ['chiron', 'sun'])
    expect(result).toBe(1)
  })

  // 4. Casos con el nodo norte
  it('4.1. debe devolver 6 si incluye al nodo norte en un aspecto mayor', () => {
    const result = getAspectMargin(majorAspect, ['northNode', 'sun'])
    expect(result).toBe(6)
  })

  it('4.2. debe devolver 1 si incluye al nodo norte en un aspecto menor', () => {
    const result = getAspectMargin(minorAspect, ['northNode', 'sun'])
    expect(result).toBe(1)
  })

  // 5. Casos con el nodo sur
  it('5.1. debe devolver 6 si incluye al nodo sur en un aspecto mayor', () => {
    const result = getAspectMargin(majorAspect, ['southNode', 'sun'])
    expect(result).toBe(6)
  })

  it('5.2. debe devolver 1 si incluye al nodo sur en un aspecto menor', () => {
    const result = getAspectMargin(minorAspect, ['southNode', 'sun'])
    expect(result).toBe(1)
  })
})
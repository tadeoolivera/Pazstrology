import { DIAMETER_COUNT } from '../data/config.tsx';
import { PLANETS, PLANET_ORDER } from '../data/planets.tsx';
import { ASTEROIDS, ASTEROID_ORDER } from '../data/asteroids.tsx';
import { ASPECTS, getAspectMargin } from '../data/aspects.tsx';
import { SIGN_ORDER } from '../data/signs.tsx';
import { norm360, circularDistance } from './geo.ts';

export type BodySummary = {
  name: string;
  sign: string;
  house: number;
  degree: string;
};

export type HouseSummary = {
  house: number;
  sign: string;
  degree: string;
};

export type AspectSummary = {
  name1: string;
  name2: string;
  aspect: string;
  color: string;
  distance: number;
  orb: number;
};

export type ChartData = {
  planets: BodySummary[];
  houses: HouseSummary[];
  aspects: AspectSummary[];
};

type PartitionPoint = { 
  angle: number; 
  d: number; 
  isPrimary: boolean 
};

const partitionPoints = (angles: number[]): PartitionPoint[] => {
  const points: PartitionPoint[] = [];
  for (let d = 0; d < DIAMETER_COUNT; d++) {
    points.push({ angle: norm360(angles[d]), d, isPrimary: true });
    points.push({ angle: norm360(angles[d] + 180), d, isPrimary: false });
  }
  points.sort((a, b) => a.angle - b.angle);
  return points;
};

const houseOf = (p: PartitionPoint) => (((p.isPrimary ? 12 - p.d : 6 - p.d) + 8) % 12) + 1;

const signOfBody = (a: number, ringRotation: number) =>
  SIGN_ORDER[Math.floor(norm360(a - ringRotation - 1e-7) / 30) % 12];

const getCuspDetails = (cuspAngle: number, zodiacRingRotation: number) => {
  // 1. Obtenemos el signo (usando la corrección exacta que hicimos antes)
  const signIndex = Math.floor(norm360(cuspAngle - zodiacRingRotation - 1e-7) / 30) % 12;
  const sign = SIGN_ORDER[signIndex];

  // 2. Extraemos la misma lógica matemática que calculaba los grados para los planetas
  const relativeZodiacAngle = norm360(cuspAngle - zodiacRingRotation);
  const rawPositionInSign = relativeZodiacAngle % 30;
  const floatingPointTolerance = 1e-7;

  let decimalDegreesInSign: number;

  // Manejo del límite exacto entre signos
  if (rawPositionInSign < floatingPointTolerance || Math.abs(rawPositionInSign - 30) < floatingPointTolerance) {
    decimalDegreesInSign = 29 + 59/60; 
  } else {
    // Inversión de dirección a sentido antihorario
    decimalDegreesInSign = (30 - rawPositionInSign) % 30;
  }

  // 3. Conversión a grados y minutos
  const integerDegrees = Math.floor(decimalDegreesInSign);
  const arcMinutes = Math.floor((decimalDegreesInSign - integerDegrees) * 60);
  const formattedDegree = `${integerDegrees}°${arcMinutes}'`;

  return { sign, degree: formattedDegree };
};

export const calculateBodySummaries = (
  bodyAngles: number[], 
  zodiacRingRotation: number,
  planetAngles: (number | null)[],
  visibleAsteroidAngles: (number | null)[],
): BodySummary[] => {
  const houseCusps = partitionPoints(bodyAngles); 

  const getBodySummary = (absoluteAngle: number) => { 
    // Ajuste para la búsqueda de la casa astrológica (0 grados equivale a 360)
    const angleForHouseSearch = absoluteAngle === 0 ? 360 : absoluteAngle; 

    // Encontrar en qué casa cae el cuerpo celeste
    const houseCuspIndex = houseCusps.findIndex((currentCusp, currentIndex) => { 
      const nextCusp = houseCusps[(currentIndex + 1) % houseCusps.length]; 
      const houseEndAngle = currentIndex === houseCusps.length - 1 ? nextCusp.angle + 360 : nextCusp.angle; 
      return angleForHouseSearch > currentCusp.angle && angleForHouseSearch <= houseEndAngle;
    });

    const matchingHouse = houseCusps[houseCuspIndex >= 0 ? houseCuspIndex : houseCusps.length - 1]; 

    // Cálculo de la posición exacta dentro del signo zodiacal (porciones de 30 grados)
    const relativeZodiacAngle = norm360(absoluteAngle - zodiacRingRotation); 
    const rawPositionInSign = relativeZodiacAngle % 30; 
    const floatingPointTolerance = 1e-7; 
    
    let decimalDegreesInSign: number; 

    // Manejo del límite exacto entre signos para evitar saltos por redondeo
    if (rawPositionInSign < floatingPointTolerance || Math.abs(rawPositionInSign - 30) < floatingPointTolerance) {
      decimalDegreesInSign = 29 + 59/60; // Lo fuerza a 29°59'
    } else {
      // Invierte la dirección del ángulo para que coincida con el sentido antihorario astrológico
      decimalDegreesInSign = (30 - rawPositionInSign) % 30;
    }

    // Conversión a grados y minutos (sexagesimal)
    const integerDegrees = Math.floor(decimalDegreesInSign); 
    const arcMinutes = Math.floor((decimalDegreesInSign - integerDegrees) * 60); 
    const formattedDegree = `${integerDegrees}°${arcMinutes}'`; 

    return { 
      sign: signOfBody(absoluteAngle, zodiacRingRotation), 
      house: houseOf(matchingHouse), 
      degree: formattedDegree 
    };
  };
  
  const planets = PLANET_ORDER.flatMap((name, i) => {
    const a = planetAngles[i];
    if (a === null) return [];
    return [{
      name,
      ...getBodySummary(a),
      color: PLANETS[name as keyof typeof PLANETS].color,
    }];
  });

  const asteroids = ASTEROID_ORDER.flatMap((name, i) => {
    const a = visibleAsteroidAngles[i];
    if (a === null) return [];
    return [{
      name,
      ...getBodySummary(a),
      color: ASTEROIDS[name as keyof typeof ASTEROIDS].color,
    }];
  });
  return [...planets, ...asteroids];
};

export const calculateHouseSummaries = (houseAngles: number[], zodiacRingRotation: number): HouseSummary[] => {
  const houseCusps = partitionPoints(houseAngles); 
  
  return houseCusps
    .map((cusp, index) => {
      // Tomamos la línea opuesta que representa el inicio del arco que define la casa en sentido anti-horario (así se considera la cúspide en astrología)
      const oppositeLine = houseCusps[(index + 1) % houseCusps.length];
      
      // Guardo el signo como los grados exactos
      const { sign, degree } = getCuspDetails(oppositeLine.angle, zodiacRingRotation);
      
      return {
        house: houseOf(cusp),
        sign: sign,
        degree: degree
      };
    })
    .sort((a, b) => a.house - b.house); 
};
export type SummaryBody = { name: string; angle: number; isAsteroid: boolean };

export const calculateAspectSummaries = (
  bodies: SummaryBody[],
  showMinorAspects: boolean,
  showMajorAspects: boolean,
  showAsteroidAspects: boolean,
  showNodeAspects: boolean
): AspectSummary[] => {
  const results: AspectSummary[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const d = circularDistance(bodies[i].angle, bodies[j].angle);
      const involvesAsteroid = bodies[i].isAsteroid || bodies[j].isAsteroid;

      const involvesNode =
        (bodies[i].name === 'southNode' || bodies[i].name === 'northNode') ||
        (bodies[j].name === 'southNode' || bodies[j].name === 'northNode');
      if (involvesNode && !showNodeAspects) continue;
      if (involvesAsteroid && !showAsteroidAspects) continue;
      for (const asp of ASPECTS) {
        if (asp.minor && !showMinorAspects) continue;
        if (!asp.minor && !showMajorAspects) continue;
        const isNodeOpposition =
          ((bodies[i].name === 'northNode' && bodies[j].name === 'southNode') ||
            (bodies[i].name === 'southNode' && bodies[j].name === 'northNode')) &&
          asp.name === 'oposición';
        if (isNodeOpposition) continue;
        const margin = getAspectMargin(asp, [bodies[i].name, bodies[j].name]);
        if (Math.abs(d - asp.angle) <= margin) {
          results.push({
            name1: bodies[i].name,
            name2: bodies[j].name,
            aspect: asp.name,
            color: asp.color,
            distance: d,
            orb: Math.abs(d - asp.angle),
          });
          break;
        }
      }
    }
  }
  return results;
};

export const calculateChartData = (
  angles: number[],
  ringRotation: number,
  planetAngles: (number | null)[],
  visibleAsteroidAngles: (number | null)[],
  showMinorAspects: boolean,
  showMajorAspects: boolean,
  showAsteroidAspects: boolean,
  showNodeAspects: boolean
): ChartData => {
  const bodies: SummaryBody[] = [
    ...PLANET_ORDER.flatMap((name, i) => {
      const a = planetAngles[i];
      return a === null ? [] : [{ name, angle: a, isAsteroid: false }];
    }),
    ...ASTEROID_ORDER.flatMap((name, i) => {
      const a = visibleAsteroidAngles[i];
      return a === null ? [] : [{ name, angle: a, isAsteroid: true }];
    })
  ];
  return {
    planets: calculateBodySummaries(angles, ringRotation, planetAngles, visibleAsteroidAngles),
    houses: calculateHouseSummaries(angles, ringRotation),
    aspects: calculateAspectSummaries(bodies, showMinorAspects, showMajorAspects, showAsteroidAspects, showNodeAspects),
  };
};
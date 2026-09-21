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

export const houseOf = (p: PartitionPoint) => p.isPrimary ? p.d + 1 : p.d + 7;

export const getCuspDetails = (astroCuspAngle: number, astroRingRotation: number) => {
  const relativeAngle = norm360(astroCuspAngle - astroRingRotation);

  let cleanAngle = Math.round(relativeAngle * 10000) / 10000;
  if (cleanAngle === 360) cleanAngle = 0; 

  const signIndex = Math.floor(cleanAngle / 30) % 12;
  const sign = SIGN_ORDER[signIndex];

  const decimalDegreesInSign = cleanAngle % 30;

  const integerDegrees = Math.floor(decimalDegreesInSign);
  const arcMinutes = Math.floor((decimalDegreesInSign - integerDegrees) * 60);

  return { sign, degree: `${integerDegrees}°${arcMinutes}'` };
};

export const calculateBodySummaries = (
  bodyAngles: number[], 
  zodiacRingRotation: number,
  planetAngles: (number | null)[],
  visibleAsteroidAngles: (number | null)[],
): BodySummary[] => {
  const houseCusps = partitionPoints(bodyAngles); 

  const getBodySummary = (absoluteAngle: number) => { 
    const { sign, degree } = getCuspDetails(absoluteAngle, zodiacRingRotation);

    const matchingCusp = houseCusps.find((currentCusp, currentIndex) => { 
      const nextCusp = houseCusps[(currentIndex + 1) % houseCusps.length]; 
      
      const houseSize = norm360(nextCusp.angle - currentCusp.angle);
      const distanceToPlanet = norm360(absoluteAngle - currentCusp.angle);
      
      return distanceToPlanet >= 0 && distanceToPlanet < houseSize;
    });

    const finalHouse = matchingCusp ? houseOf(matchingCusp) : houseOf(houseCusps[0]);

    return { 
      sign: sign, 
      house: finalHouse, 
      degree: degree 
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
    .map((cusp) => {
      const { sign, degree } = getCuspDetails(cusp.angle, zodiacRingRotation);
      
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
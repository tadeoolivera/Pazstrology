import { DIAMETER_COUNT } from '../data/config.tsx';
import { PLANETS, PLANET_ORDER } from '../data/planets.tsx';
import { ASTEROIDS, ASTEROID_ORDER } from '../data/asteroids.tsx';
import { ASPECTS } from '../data/aspects.tsx';
import { SIGN_ORDER } from '../data/signs.tsx';
import { norm360, circularDistance } from './geo.ts';

export type BodySummary = {
  name: string;
  sign: string;
  house: number;
  color: string;
  degree: string;
};

export type HouseSummary = {
  house: number;
  sign: string;
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

type PartitionPoint = { angle: number; d: number; isPrimary: boolean };

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

const signOfHouse = (a: number, ringRotation: number) => {
  const diff = norm360(a - ringRotation);
  const eps = 1e-7;
  const mod = diff % 30;
  const k = (mod < eps || Math.abs(mod - 30) < eps) ? Math.round(diff / 30) : Math.ceil(diff / 30 - eps);
  return SIGN_ORDER[((k % 12) + 12) % 12];
};

export const calculateBodySummaries = (
  angles: number[],
  ringRotation: number,
  planetAngles: (number | null)[],
  visibleAsteroidAngles: (number | null)[],
): BodySummary[] => {
  const points = partitionPoints(angles);

  const bodySummary = (a: number) => {

    const aa = a === 0 ? 360 : a;
    const k = points.findIndex((p, idx) => {
      const next = points[(idx + 1) % points.length];
      const end = idx === points.length - 1 ? next.angle + 360 : next.angle;
      return aa > p.angle && aa <= end;
    });

    const housePoint = points[k >= 0 ? k : points.length - 1];
    const diff = norm360(a - ringRotation);
    const mod = diff % 30;
    const eps = 1e-7;
    let degInSign: number;
    if (mod < eps || Math.abs(mod - 30) < eps) {
      degInSign = 29 + 59/60;
    } else {
      degInSign = (30 - (diff % 30)) % 30;
    }
    const deg = Math.floor(degInSign);
    const min = Math.floor((degInSign - deg) * 60);
    const degree = `${deg}°${min}'`;
    return { sign: signOfBody(a, ringRotation), house: houseOf(housePoint), degree };
  };

  const planets = PLANET_ORDER.flatMap((name, i) => {
    const a = planetAngles[i];
    if (a === null) return [];
    return [{
      name,
      ...bodySummary(a),
      color: PLANETS[name as keyof typeof PLANETS].color,
    }];
  });

  const asteroids = ASTEROID_ORDER.flatMap((name, i) => {
    const a = visibleAsteroidAngles[i];
    if (a === null) return [];
    return [{
      name,
      ...bodySummary(a),
      color: ASTEROIDS[name as keyof typeof ASTEROIDS].color,
    }];
  });
  return [...planets, ...asteroids];
};

export const calculateHouseSummaries = (angles: number[], ringRotation: number): HouseSummary[] => {
  const points = partitionPoints(angles);
  return points
    .map((p) => ({
      house: houseOf(p),
      sign: signOfHouse(p.angle, ringRotation)
    }))
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
        const margin = involvesAsteroid ? asp.margin - 1 : asp.margin;
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
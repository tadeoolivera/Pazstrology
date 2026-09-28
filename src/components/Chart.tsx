import { useState, useRef, useCallback, useEffect, useImperativeHandle, cloneElement, type CSSProperties, type Ref } from 'react';
import type { ChartData } from '../utils/summary.ts';

import {
  DIAMETER_COUNT,
  MIN_GAP,
  SIGN_ICON_SIZE,
  PLANET_ICON_SIZE,
  BORDER_COLOR,
  LINE_COLOR,
  RING_INNER,
  RING_OUTER,
  NUMBERS_RING_INNER,
  NUMBERS_RING_OUTER,
  SIZE,
  CENTER,
  PLANETS_RADIUS,
  ASPECTS_RADIUS
} from '../data/config.tsx';
import { SIGNS, SIGN_ORDER } from '../data/signs.tsx';
import { PLANETS, PLANET_ORDER, MAX_ELONGATION } from '../data/planets.tsx';
import { ASTEROIDS, ASTEROID_ORDER } from '../data/asteroids.tsx';
import { ASPECTS, getAspectMargin } from '../data/aspects.tsx';
import { norm360, toXY, circularDistance, pointerToAstroAngle } from '../utils/geo.ts';
import { calculateChartData } from '../utils/summary.ts';

export type ChartActions = {
  reset: () => void;
  download: () => void;
  load: (file: File) => void;
  addBody: (name: string) => void;
  removeBody: (name: string) => void;
  undo: () => void;
  redo: () => void;
  toggleRetrograde: (name: string) => void;
};

const STORAGE_KEY = 'pazstrology:chart';

type SavedChart = {
  angles: number[];
  ringRotation: number;
  planetAngles: number[];
  asteroidAngles: number[];
  showMinorAspects: boolean;
  showMajorAspects: boolean;
  showAsteroidAspects: boolean;
  showNodeAspects: boolean;
  retrogrades?: string[];
};

function readSavedChart(raw: string | null): SavedChart | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (
      !Array.isArray(data.angles) ||
      !Array.isArray(data.planetAngles) ||
      !Array.isArray(data.asteroidAngles)
    ) {
      return null;
    }
    return data as SavedChart;
  } catch {
    return null;
  }
}

let cachedSaved: SavedChart | null | undefined;
const savedChart = (): SavedChart | null => {
  if (cachedSaved === undefined) {
    cachedSaved = readSavedChart(localStorage.getItem(STORAGE_KEY));
  }
  return cachedSaved;
};

type Props = {
  ref?: Ref<ChartActions>;
  onSummary?: (data: ChartData) => void;
  onOptionsChange?: (opciones: {
    showMinorAspects: boolean;
    showMajorAspects: boolean;
    showAsteroidAspects: boolean;
    showNodeAspects: boolean;
  }) => void;
  onRetrogradesChange?: (retrogrades: Set<string>) => void;
  showMinorAspects: boolean;
  showMajorAspects: boolean;
  showAsteroidAspects: boolean;
  showNodeAspects: boolean;
  syncRotation?: boolean;
};

const Chart = ({ ref, onSummary, onOptionsChange, onRetrogradesChange, showMinorAspects, showMajorAspects, showAsteroidAspects, showNodeAspects, syncRotation = false }: Props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [angles, setAngles] = useState(() =>
    savedChart()?.angles ??
    Array.from({ length: DIAMETER_COUNT }, (_, i) => i * (360 / (DIAMETER_COUNT * 2)))
  );
  const [dragging, setDragging] = useState<{ d: number; isPrimary: boolean } | null>(null);
  const [ringRotation, setRingRotation] = useState(() => savedChart()?.ringRotation ?? 0);
  const ringDrag = useRef<{ inicio: number; base: number } | null>(null);
  const ringSyncBodies = useRef<{ planets: (number | null)[]; asteroids: (number | null)[] } | null>(null);
  const [planetAngles, setPlanetAngles] = useState<(number | null)[]>(
    () => savedChart()?.planetAngles ?? Array(PLANET_ORDER.length).fill(null)
  );
  const planetDrag = useRef<{ idx: number; inicio: number; base: number } | null>(null);
  const [asteroidAngles, setAsteroidAngles] = useState<(number | null)[]>(
    () => savedChart()?.asteroidAngles ?? Array(ASTEROID_ORDER.length).fill(null)
  );
  const asteroidDrag = useRef<{ idx: number; inicio: number; base: number } | null>(null);
  const [retrogrades, setRetrogrades] = useState<Set<string>>(
    () => new Set(savedChart()?.retrogrades ?? [])
  );
  const [highlightBody, setHighlightBody] = useState<string | null>(null);
  const historyRef = useRef<{ angles: number[]; ringRotation: number; planetAngles: (number | null)[]; asteroidAngles: (number | null)[]; retrogrades: string[] }[]>([]);
  const redoRef = useRef<{ angles: number[]; ringRotation: number; planetAngles: (number | null)[]; asteroidAngles: (number | null)[]; retrogrades: string[] }[]>([]);
  const pushHistory = useCallback(() => {
    historyRef.current.push({
      angles: [...angles],
      ringRotation,
      planetAngles: [...planetAngles],
      asteroidAngles: [...asteroidAngles],
      retrogrades: [...retrogrades],
    });
    if (historyRef.current.length > 50) historyRef.current.shift();
    redoRef.current = [];
  }, [angles, ringRotation, planetAngles, asteroidAngles, retrogrades]);

  useEffect(() => {
    onRetrogradesChange?.(retrogrades);
  }, [retrogrades, onRetrogradesChange]);

  const visibleAsteroidAngles = asteroidAngles.map((a, i) => {
    if (a === null) return null as number | null;
    if (ASTEROID_ORDER[i] === 'northNode') {
      const south = asteroidAngles[0];
      return south !== null ? norm360(south + 180) : a;
    }
    return a;
  });

  const angleFromPointer = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const dx = px - CENTER;
    const dy = py - CENTER;
    
    return pointerToAstroAngle(dx, dy);
  };

  const gapsFor = (pointAngle: number, others: number[]) => {
    let gapUp = 360;
    let gapDown = 360;
    for (const o of others) {
      const up = norm360(o - pointAngle);
      const down = norm360(pointAngle - o);
      if (up > 0 && up < gapUp) gapUp = up;
      if (down > 0 && down < gapDown) gapDown = down;
    }
    return { gapUp, gapDown };
  };

  const move = useCallback((d: number, isPrimary: boolean, e: React.PointerEvent) => {
    setAngles((prev) => {
      const primarioActual = prev[d];
      const draggedPoint = isPrimary ? primarioActual : norm360(primarioActual + 180);

      const theta = angleFromPointer(e);

      let delta = theta - draggedPoint;
      delta = (((delta + 180) % 360) + 360) % 360 - 180;

      const otros = [];
      for (let k = 0; k < DIAMETER_COUNT; k++) {
        if (k === d) continue;
        otros.push(norm360(prev[k]));
        otros.push(norm360(prev[k] + 180));
      }

      const primaryPoint = primarioActual;
      const oppositePoint = norm360(primarioActual + 180);

      const gP = gapsFor(primaryPoint, otros);
      const gO = gapsFor(oppositePoint, otros);

      const maxUp = Math.min(gP.gapUp, gO.gapUp) - MIN_GAP;
      const maxDown = Math.min(gP.gapDown, gO.gapDown) - MIN_GAP;

      const deltaFinal = Math.max(-maxDown, Math.min(maxUp, delta));

      const next = [...prev];
      next[d] = norm360(prev[d] + deltaFinal);
      return next;
    });
  }, []);

  const handlePointerDown = (d: number, isPrimary: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pushHistory();
    if (d === 0 || d === 6) return
    setDragging({ d, isPrimary });
    (e.target as Element).setPointerCapture(e.pointerId);
    move(d, isPrimary, e);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (ringDrag.current) {
      const theta = angleFromPointer(e);
      const delta = theta - ringDrag.current.inicio;
      const newRing = norm360(ringDrag.current.base + delta);
      setRingRotation(newRing);
      if (syncRotation && ringSyncBodies.current) {
        const { planets: initPlanets, asteroids: initAsteroids } = ringSyncBodies.current;
        setPlanetAngles(initPlanets.map(a => a === null ? null : norm360(a + delta)));
        setAsteroidAngles(initAsteroids.map(a => a === null ? null : norm360(a + delta)));
      }
      return;
    }
    if (planetDrag.current) {
      const { idx, inicio, base } = planetDrag.current;
      const theta = angleFromPointer(e);
      const snap = e.shiftKey;
      const sunIndex = PLANET_ORDER.indexOf('sun');
      setPlanetAngles((prev) => {
        const next = [...prev];
        const raw = norm360(base + (theta - inicio));
        const angle = snap ? norm360(Math.round(raw)) : raw;
        if (idx === sunIndex) {
          next[idx] = angle;
          for (const name of Object.keys(MAX_ELONGATION) as (keyof typeof MAX_ELONGATION)[]) {
            const pi = PLANET_ORDER.indexOf(name);
            const prevPi = prev[pi];
            if (prevPi === null) continue;
            const limit = MAX_ELONGATION[name];
            let delta = norm360(prevPi - angle);
            if (delta > 180) delta -= 360;
            if (Math.abs(delta) > limit + 0.5) {
              const pushed = norm360(angle + Math.sign(delta) * limit);
              next[pi] = snap ? norm360(Math.round(pushed)) : pushed;
            }
          }
        } else {
          const limit = MAX_ELONGATION[PLANET_ORDER[idx] as keyof typeof MAX_ELONGATION];
          const sol = prev[sunIndex];
          if (limit !== undefined && sol !== null) {
            let delta = norm360(angle - sol);
            if (delta > 180) delta -= 360;
            const clamped = norm360(sol + Math.max(-limit, Math.min(limit, delta)));
            next[idx] = snap ? norm360(Math.round(clamped)) : clamped;
          } else {
            next[idx] = angle;
          }
        }
        return next;
      });
      return;
    }
    if (asteroidDrag.current) {
      const { idx, inicio, base } = asteroidDrag.current;
      const theta = angleFromPointer(e);
      const snap = e.shiftKey;
      setAsteroidAngles((prev) => {
        const next = [...prev];
        const raw = norm360(base + (theta - inicio));
        next[idx] = snap ? norm360(Math.round(raw)) : raw;
        return next;
      });
      return;
    }
    if (!dragging) return;
    move(dragging.d, dragging.isPrimary, e);
  };


  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (ringDrag.current) {
      ringDrag.current = null;
      ringSyncBodies.current = null;
      return;
    }
    if (planetDrag.current) {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      planetDrag.current = null;
      setHighlightBody(null);
      return;
    }
    if (asteroidDrag.current) {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      asteroidDrag.current = null;
      setHighlightBody(null);
      return;
    }
    if (!dragging) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDragging(null);
  };

  const startPlanetDrag = (idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const base = planetAngles[idx];
    if (base === null) return;
    pushHistory();
    setHighlightBody(PLANET_ORDER[idx]);
    (e.target as Element).setPointerCapture(e.pointerId);
    planetDrag.current = { idx, inicio: angleFromPointer(e), base };
  };

  const startAsteroidDrag = (idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const esNorth = ASTEROID_ORDER[idx] === 'northNode';
    const idxPar = esNorth ? 0 : idx;
    const base = esNorth ? asteroidAngles[0] : asteroidAngles[idx];
    if (base === null) return;
    pushHistory();
    setHighlightBody(ASTEROID_ORDER[idx]);
    (e.target as Element).setPointerCapture(e.pointerId);
    asteroidDrag.current = { idx: idxPar, inicio: angleFromPointer(e), base };
  };

  const startRingDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pushHistory();
    (e.target as Element).setPointerCapture(e.pointerId);
    ringDrag.current = { inicio: angleFromPointer(e), base: ringRotation };
    if (syncRotation) {
      ringSyncBodies.current = { planets: [...planetAngles], asteroids: [...asteroidAngles] };
    } else {
      ringSyncBodies.current = null;
    }
  };

const reset = () => {
    pushHistory();
    setAngles(Array.from({ length: DIAMETER_COUNT }, (_, i) => i * (360 / (DIAMETER_COUNT * 2))));
    setRingRotation(0);
    setPlanetAngles(Array(PLANET_ORDER.length).fill(null));
    setAsteroidAngles(Array(ASTEROID_ORDER.length).fill(null));
    setRetrogrades(new Set());
  };

  const addBody = (name: string) => {
    pushHistory();
    const pi = PLANET_ORDER.indexOf(name as (typeof PLANET_ORDER)[number]);
    if (pi >= 0) {
      setPlanetAngles((prev) => {
        if (prev[pi] !== null) return prev;
        const next = [...prev];
        const count = next.filter((v) => v !== null).length;
        const base = norm360(count * 30);
        const sunIndex = PLANET_ORDER.indexOf('sun');

        if (name === 'sun') {
          next[pi] = base;
          for (const k of Object.keys(MAX_ELONGATION) as (keyof typeof MAX_ELONGATION)[]) {
            const pi2 = PLANET_ORDER.indexOf(k);
            const a = next[pi2];
            if (a === null) continue;
            const limit = MAX_ELONGATION[k];
            let delta = norm360(a - base);
            if (delta > 180) delta -= 360;
            if (Math.abs(delta) > limit) {
              next[pi2] = norm360(base + Math.sign(delta) * limit);
            }
          }
        } else {
          const limit = MAX_ELONGATION[name as keyof typeof MAX_ELONGATION];
          const sol = next[sunIndex];
          if (limit !== undefined && sol !== null) {
            next[pi] = norm360(sol + limit / 2);
          } else {
            next[pi] = base;
          }
        }
        return next;
      });
      return;
    }
    const ai = ASTEROID_ORDER.indexOf(name as (typeof ASTEROID_ORDER)[number]);
    if (ai < 0) return;
    setAsteroidAngles((prev) => {
      if (prev[ai] !== null) return prev;
      const next = [...prev];
      const count = next.filter((v) => v !== null).length;
      const angle = norm360(count * 30 + 15);
      if (name === 'southNode' || name === 'northNode') {
        next[0] = angle;
        next[1] = norm360(angle + 180);
      } else {
        next[ai] = angle;
      }
      return next;
    });
  };

  const toggleRetrograde = (name: string) => {
    if (['sun', 'moon', 'southNode', 'northNode'].includes(name)) return;
    pushHistory();
    setRetrogrades((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const removeBody = (name: string) => {
    pushHistory();
    const pi = PLANET_ORDER.indexOf(name as (typeof PLANET_ORDER)[number]);
    if (pi >= 0) {
      setPlanetAngles((prev) => {
        const next = [...prev];
        next[pi] = null;
        return next;
      });
      return;
    }
    const ai = ASTEROID_ORDER.indexOf(name as (typeof ASTEROID_ORDER)[number]);
    if (ai < 0) return;
    setAsteroidAngles((prev) => {
      const next = [...prev];
      if (name === 'southNode' || name === 'northNode') {
        next[0] = null;
        next[1] = null;
      } else {
        next[ai] = null;
      }
      return next;
    });
  };

  const downloadChart = () => {
    const data = {
      angles,
      ringRotation,
      planetAngles,
      asteroidAngles,
      showMinorAspects,
      showMajorAspects,
      showAsteroidAspects,
      showNodeAspects,
      retrogrades: [...retrogrades]
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadChart = (file: File) => {
    file
      .text()
      .then((text) => {
        const data = JSON.parse(text);
        if (
          !Array.isArray(data.angles) ||
          !Array.isArray(data.planetAngles) ||
          !Array.isArray(data.asteroidAngles)
        ) {
          throw new Error('estructura inválida');
        }
        pushHistory();
        setAngles(data.angles);
        setRingRotation(data.ringRotation ?? 0);
        setPlanetAngles(data.planetAngles);
        setAsteroidAngles(data.asteroidAngles);
        setRetrogrades(new Set(data.retrogrades ?? []));
        onOptionsChange?.({
          showMinorAspects: data.showMinorAspects ?? true,
          showMajorAspects: data.showMajorAspects ?? true,
          showAsteroidAspects: data.showAsteroidAspects ?? true,
          showNodeAspects: data.showNodeAspects ?? true,
        });
      })
      .catch(() => alert('El archivo no es una carta válida'));
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    redoRef.current.push({
      angles: [...angles],
      ringRotation,
      planetAngles: [...planetAngles],
      asteroidAngles: [...asteroidAngles],
      retrogrades: [...retrogrades],
    });
    if (redoRef.current.length > 50) redoRef.current.shift();
    setAngles(prev.angles);
    setRingRotation(prev.ringRotation);
    setPlanetAngles(prev.planetAngles);
    setAsteroidAngles(prev.asteroidAngles);
    setRetrogrades(new Set(prev.retrogrades));
  };

  const redo = () => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push({
      angles: [...angles],
      ringRotation,
      planetAngles: [...planetAngles],
      asteroidAngles: [...asteroidAngles],
      retrogrades: [...retrogrades],
    });
    if (historyRef.current.length > 50) historyRef.current.shift();
    setAngles(next.angles);
    setRingRotation(next.ringRotation);
    setPlanetAngles(next.planetAngles);
    setAsteroidAngles(next.asteroidAngles);
    setRetrogrades(new Set(next.retrogrades));
  };

  useImperativeHandle(ref, () => ({
    reset,
    download: downloadChart,
    load: loadChart,
    addBody,
    removeBody,
    undo,
    redo,
    toggleRetrograde,
  }));

  const points = [];
  for (let d = 0; d < DIAMETER_COUNT; d++) {
    points.push({ angle: norm360(angles[d]), d, isPrimary: true, key: `${d}-p` });
    points.push({ angle: norm360(angles[d] + 180), d, isPrimary: false, key: `${d}-o` });
  }
  const sortedPoints = [...points].sort((a, b) => a.angle - b.angle);

  const wheelNumbers = sortedPoints.map((p, i) => {
    const sig = sortedPoints[(i + 1) % sortedPoints.length];
    const mid = norm360(p.angle + norm360(sig.angle - p.angle) / 2);
    const pos = toXY(mid, (NUMBERS_RING_INNER + NUMBERS_RING_OUTER) / 2);
    
    const num = p.isPrimary ? p.d + 1 : p.d + 7;
    
    return { x: pos.x, y: pos.y, num };
  });

  const icons = Array.from({ length: 12 }, (_, i) => {
    const pos = toXY(i * 30 + 15 + ringRotation, (RING_INNER + RING_OUTER) / 2);
    return { x: pos.x, y: pos.y, idx: i };
  });

  const rings = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 + ringRotation;
    const b = (i + 1) * 30 + ringRotation;
    const pi = toXY(a, RING_INNER);
    const pj = toXY(b, RING_INNER);
    const pi2 = toXY(a, RING_OUTER);
    const pj2 = toXY(b, RING_OUTER);
    return `M ${pi.x} ${pi.y} A ${RING_INNER} ${RING_INNER} 0 0 0 ${pj.x} ${pj.y} L ${pj2.x} ${pj2.y} A ${RING_OUTER} ${RING_OUTER} 0 0 1 ${pi2.x} ${pi2.y} Z`;
  });

  const ringsNum = sortedPoints.map((p, i) => {
    const sig = sortedPoints[(i + 1) % sortedPoints.length];
    const a = p.angle;
    const b = sig.angle;
    const pi = toXY(a, NUMBERS_RING_INNER);
    const pj = toXY(b, NUMBERS_RING_INNER);
    const pi2 = toXY(a, NUMBERS_RING_OUTER);
    const pj2 = toXY(b, NUMBERS_RING_OUTER);
    return `M ${pi.x} ${pi.y} A ${NUMBERS_RING_INNER} ${NUMBERS_RING_INNER} 0 0 0 ${pj.x} ${pj.y} L ${pj2.x} ${pj2.y} A ${NUMBERS_RING_OUTER} ${NUMBERS_RING_OUTER} 0 0 1 ${pi2.x} ${pi2.y} Z`;
  });

  const ticks = [];
  for (let t = 0; t < 360; t += 1) {
    const mayor = t % 5 === 0;
    const largo = mayor ? 14 : 7;
    const p1 = toXY(t + ringRotation, RING_INNER);
    const p2 = toXY(t + ringRotation, RING_INNER - largo);
    ticks.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, mayor });
  }

  const bodies: Array<{
    name: (typeof PLANET_ORDER)[number] | (typeof ASTEROID_ORDER)[number];
    angle: number;
    isAsteroid: boolean;
  }> = [
    ...PLANET_ORDER.flatMap((name, i) => {
      const a = planetAngles[i];
      return a === null ? [] : [{ name, angle: a, isAsteroid: false }];
    }),
    ...ASTEROID_ORDER.flatMap((name, i) => {
      const a = visibleAsteroidAngles[i];
      return a === null ? [] : [{ name, angle: a, isAsteroid: true }];
    })
  ];
  const aspectLines = [];
  const conjunctionEndpoints: Array<{
    x: number;
    y: number;
    color: string;
    n1: typeof bodies[number]['name'];
    n2: typeof bodies[number]['name'];
  }> = [];
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
          const A = toXY(bodies[i].angle, ASPECTS_RADIUS);
          const B = toXY(bodies[j].angle, ASPECTS_RADIUS);
          if (asp.name === 'conjunción') {
            const arcRadius = ASPECTS_RADIUS;
            const a1 = norm360(bodies[i].angle);
            const a2 = norm360(bodies[j].angle);

            const P1 = toXY(a1, arcRadius);
            const P2 = toXY(a2, arcRadius);

            const span = ((a2 - a1 + 540) % 360) - 180;

            const sweepFlag = span >= 0 ? 0 : 1;

            conjunctionEndpoints.push(
              { x: P1.x, y: P1.y, color: asp.color, n1: bodies[i].name, n2: bodies[j].name },
              { x: P2.x, y: P2.y, color: asp.color, n1: bodies[i].name, n2: bodies[j].name }
            );

            aspectLines.push({
              n1: bodies[i].name,
              n2: bodies[j].name,
              d: `M ${P1.x} ${P1.y} A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${P2.x} ${P2.y}`,
              color: asp.color,
              aspecto: asp.name
            });
          } else {
            aspectLines.push({ n1: bodies[i].name, n2: bodies[j].name, d: `M ${A.x} ${A.y} L ${B.x} ${B.y}`, color: asp.color, aspecto: asp.name });
          }
          break;
        }
      }
    }
  }

  useEffect(() => {
    onSummary?.(
      calculateChartData(
        angles,
        ringRotation,
        planetAngles,
        visibleAsteroidAngles,
        showMinorAspects,
        showMajorAspects,
        showAsteroidAspects,
        showNodeAspects
      )
    );
  }, [angles, ringRotation, planetAngles, visibleAsteroidAngles, showMinorAspects, showMajorAspects, showAsteroidAspects, showNodeAspects, onSummary]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        angles,
        ringRotation,
        planetAngles,
        asteroidAngles,
        showMinorAspects,
        showMajorAspects,
        showAsteroidAspects,
        showNodeAspects,
        retrogrades: [...retrogrades]
      })
    );
  }, [angles, ringRotation, planetAngles, asteroidAngles, showMinorAspects, showMajorAspects, showAsteroidAspects, showNodeAspects, retrogrades]);

  const syncedOptions = useRef(false);
  useEffect(() => {
    if (syncedOptions.current) return;
    syncedOptions.current = true;
    const saved = savedChart();
    if (saved) {
      onOptionsChange?.({
        showMinorAspects: saved.showMinorAspects ?? true,
        showMajorAspects: saved.showMajorAspects ?? true,
        showAsteroidAspects: saved.showAsteroidAspects ?? true,
        showNodeAspects: saved.showNodeAspects ?? true,
      });
    }
  }, [onOptionsChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        const prev = historyRef.current.pop();
        if (!prev) return;
        redoRef.current.push({
          angles: [...angles],
          ringRotation,
          planetAngles: [...planetAngles],
          asteroidAngles: [...asteroidAngles],
          retrogrades: [...retrogrades],
        });
        if (redoRef.current.length > 50) redoRef.current.shift();
        setAngles(prev.angles);
        setRingRotation(prev.ringRotation);
        setPlanetAngles(prev.planetAngles);
        setAsteroidAngles(prev.asteroidAngles);
        setRetrogrades(new Set(prev.retrogrades));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        const next = redoRef.current.pop();
        if (!next) return;
        historyRef.current.push({
          angles: [...angles],
          ringRotation,
          planetAngles: [...planetAngles],
          asteroidAngles: [...asteroidAngles],
          retrogrades: [...retrogrades],
        });
        if (historyRef.current.length > 50) historyRef.current.shift();
        setAngles(next.angles);
        setRingRotation(next.ringRotation);
        setPlanetAngles(next.planetAngles);
        setAsteroidAngles(next.asteroidAngles);
        setRetrogrades(new Set(next.retrogrades));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [angles, ringRotation, planetAngles, asteroidAngles, retrogrades]);

  return (
    <div style={styles.wrapper}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={styles.svg}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <g style={{ cursor: 'grab' }} onPointerDown={startRingDrag}>
          {rings.map((d, i) => (
            <path key={i} d={d} fill={"white"} stroke={BORDER_COLOR} strokeWidth={0.5} />
          ))}
          {ticks.map((m, i) => (
            <line
              key={i}
              x1={m.x1}
              y1={m.y1}
              x2={m.x2}
              y2={m.y2}
              stroke={m.mayor ? BORDER_COLOR : '#C4AE8C'}
              strokeWidth={m.mayor ? 1.6 : 0.7}
            />
          ))}
        </g>

        {/* Anillo de las casas */}
        <g>
          {ringsNum.map((d, i) => (
            <path key={i} d={d} fill={"white"} stroke={BORDER_COLOR} strokeWidth={0.5} />
          ))}
          {wheelNumbers.map((n) => (
            <text
              key={n.num}
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight="bold"
              fill="#94908D"
              fontFamily="system-ui, sans-serif"
            >
              {n.num}
            </text>
          ))}

          {/* Líneas de las particiones */}
          {points.map((p, idx) => {
            const A = toXY(p.angle, NUMBERS_RING_INNER);
            const isCusp = idx === 0 || idx === 1 || idx === 6 || idx === 7;
            const baseWidth = isCusp ? 2 : 0.5;
            const PROTRUSION = 8;
            const ARROW_LENGTH = 9;
            const B = toXY(p.angle, isCusp ? NUMBERS_RING_OUTER + PROTRUSION : NUMBERS_RING_OUTER);
            return (
              <g key={p.key}>
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke={LINE_COLOR}
                  strokeWidth={baseWidth}
                />
                {isCusp && (
                  <polygon
                    points={[
                      toXY(p.angle, NUMBERS_RING_OUTER + PROTRUSION + ARROW_LENGTH),
                      toXY(norm360(p.angle - 1.4), NUMBERS_RING_OUTER + PROTRUSION),
                      toXY(norm360(p.angle + 1.4), NUMBERS_RING_OUTER + PROTRUSION)
                    ]
                      .map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
                      .join(' ')}
                    fill={LINE_COLOR}
                  />
                )}
                <polygon
                  points={[
                    toXY(norm360(p.angle - 3.5), NUMBERS_RING_INNER - 8),
                    toXY(norm360(p.angle + 3.5), NUMBERS_RING_INNER - 8),
                    toXY(norm360(p.angle + 3.5), NUMBERS_RING_OUTER + 8),
                    toXY(norm360(p.angle - 3.5), NUMBERS_RING_OUTER + 8)
                  ]
                    .map((pt) => `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
                    .join(' ')}
                  fill="transparent"
                  style={p.d === 0 || p.d === 6 ? { cursor: 'default', touchAction: 'none' } : { cursor: 'grab', touchAction: 'none' }}
                  onPointerDown={p.d === 0 || p.d === 6 ? undefined : handlePointerDown(p.d, p.isPrimary)}
                />
              </g>
            );
          })}
        </g>
        {icons.map((n) => (
          <g key={n.idx} transform={`translate(${n.x - SIGN_ICON_SIZE / 2}, ${n.y - SIGN_ICON_SIZE / 2})`}>
            {cloneElement(SIGNS[SIGN_ORDER[n.idx]], { width: SIGN_ICON_SIZE, height: SIGN_ICON_SIZE })}
          </g>
        ))}

        {/* Líneas de los aspectos */}
        {aspectLines.map((l, i) => {
          if (highlightBody !== null && l.n1 !== highlightBody && l.n2 !== highlightBody) return null;
          const focused = highlightBody !== null;
          return (
            <path
              key={i}
              d={l.d}
              fill="none"
              stroke={l.color}
              strokeWidth={focused ? 2 : 1.2}
              strokeOpacity={focused ? 1 : 0.7}
              strokeLinecap="round"
            />
          );
        })}

        {conjunctionEndpoints.map((point, i) => (
          highlightBody !== null && point.n1 !== highlightBody && point.n2 !== highlightBody
            ? null
            : (
              <circle
                key={`conjunction-endpoint-${i}`}
                cx={point.x}
                cy={point.y}
                r={2.8}
                fill={point.color}
                opacity={highlightBody !== null ? 1 : 0.85}
              />
            )
        ))}

        {/* Marcas de planetas */}
        {planetAngles.map((a, idx) => {
          if (a === null) return null;
          const name = PLANET_ORDER[idx];
          const planeta = PLANETS[name];
          const A = toXY(a, RING_INNER);
          const B = toXY(a, RING_INNER - 30);
          const G = toXY(a, PLANETS_RADIUS);
          const isRetro = retrogrades.has(name);
          const dimmed = highlightBody !== null && highlightBody !== name;
          return (
            <g key={name} style={{ cursor: 'grab', opacity: dimmed ? 0.3 : 1, transition: 'opacity 150ms' }}>
              <circle
                cx={G.x}
                cy={G.y}
                r={16}
                fill="transparent"
                onPointerDown={startPlanetDrag(idx)}
              />
              <line
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={planeta.color}
                strokeWidth={1.6}
                onPointerDown={startPlanetDrag(idx)}
              />
              <g transform={`translate(${G.x - PLANET_ICON_SIZE / 2}, ${G.y - PLANET_ICON_SIZE / 2})`} onPointerDown={startPlanetDrag(idx)}>
                {cloneElement(planeta.icon, { width: PLANET_ICON_SIZE, height: PLANET_ICON_SIZE })}
              </g>
              {isRetro && (
                <text x={G.x + 20} y={G.y - 10} fontSize={11} fontWeight="800" fill={planeta.color} textAnchor="middle">R</text>
              )}
            </g>
          );
        })}

        {/* Marcas de asteroides */}
        {visibleAsteroidAngles.map((a, idx) => {
          if (a === null) return null;
          const name = ASTEROID_ORDER[idx];
          const isAsteroid = ASTEROIDS[name];
          const A = toXY(a, RING_INNER);
          const B = toXY(a, RING_INNER - 30);
          const G = toXY(a, PLANETS_RADIUS);
          const isRetro = retrogrades.has(name);
          const dimmed = highlightBody !== null && highlightBody !== name;
          return (
            <g key={name} style={{ cursor: 'grab', opacity: dimmed ? 0.3 : 1, transition: 'opacity 150ms' }}>
              <circle
                cx={G.x}
                cy={G.y}
                r={16}
                fill="transparent"
                onPointerDown={startAsteroidDrag(idx)}
              />
              <line
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={isAsteroid.color}
                strokeWidth={1.6}
                onPointerDown={startAsteroidDrag(idx)}
              />
              <g transform={`translate(${G.x - PLANET_ICON_SIZE / 2}, ${G.y - PLANET_ICON_SIZE / 2})`} onPointerDown={startAsteroidDrag(idx)}>
                {cloneElement(isAsteroid.icon, { width: PLANET_ICON_SIZE, height: PLANET_ICON_SIZE })}
              </g>
              {isRetro && (
                <text x={G.x + 20} y={G.y - 10} fontSize={11} fontWeight="800" fill={isAsteroid.color} textAnchor="middle">R</text>
              )}
            </g>
          );
        })}

      </svg>
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 600,
    fontFamily: 'system-ui, sans-serif',
    userSelect: 'none',
  },
  svg: { width: '100%', maxWidth: 900, touchAction: 'none' },
};

export default Chart;
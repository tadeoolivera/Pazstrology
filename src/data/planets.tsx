import SunIcon from 'zodiacfonts/icons/main-planets/sun.svg?react';
import MoonIcon from 'zodiacfonts/icons/main-planets/moon.svg?react';
import MercuryIcon from 'zodiacfonts/icons/main-planets/mercury.svg?react';
import VenusIcon from 'zodiacfonts/icons/main-planets/venus.svg?react';
import MarsIcon from 'zodiacfonts/icons/main-planets/mars.svg?react';
import JupiterIcon from 'zodiacfonts/icons/main-planets/jupiter.svg?react';
import SaturnIcon from 'zodiacfonts/icons/main-planets/saturn.svg?react';
import NeptuneIcon from 'zodiacfonts/icons/main-planets/neptune.svg?react';

const UranusPng = '/uranus.png';
const PlutoPng = '/pluto.png';

import { norm360 } from '../utils/geo.ts';

export const PLANETS = {
  sun: { icon: <SunIcon color="#FE7D00" />, color: '#FE7D00' },
  moon: { icon: <MoonIcon color="#FCCF4B" />, color: '#FCCF4B' },
  mercury: { icon: <MercuryIcon color="#7C28F7" />, color: '#7C28F7' },
  venus: { icon: <VenusIcon color="#F971C8" />, color: '#F971C8' },
  mars: { icon: <MarsIcon color="#FC0523" />, color: '#FC0523' },
  jupiter: { icon: <JupiterIcon color="#1BC3C5" />, color: '#1BC3C5' },
  saturn: { icon: <SaturnIcon color="#FC0826" />, color: '#FC0826' },
  uranus: {
    icon: (
      <g transform="translate(2.25, 2.25) scale(0.85)">
        <image href={UranusPng} width={30} height={30} preserveAspectRatio="xMidYMid meet" />
      </g>
    ),
    color: '#840100'
  },
  neptune: { icon: <NeptuneIcon color="#0E6866" />, color: '#0E6866' },
  pluto: {
    icon: (
      <g transform="translate(2.25, 2.25) scale(0.85)">
        <image href={PlutoPng} width={30} height={30} preserveAspectRatio="xMidYMid meet" />
      </g>
    ),
    color: '#FC0523'
  }
};

export const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;

export const MAX_ELONGATION = { mercury: 28, venus: 48 } as const;

export const initialPlanetPositions = () => {
  const initial = PLANET_ORDER.map((_, i) => (i * 360) / PLANET_ORDER.length);
  const sunIndex = PLANET_ORDER.indexOf('sun');
  for (const name of Object.keys(MAX_ELONGATION) as (keyof typeof MAX_ELONGATION)[]) {
    const pi = PLANET_ORDER.indexOf(name);
    initial[pi] = norm360(initial[sunIndex] + MAX_ELONGATION[name] / 2);
  }
  return initial;
};
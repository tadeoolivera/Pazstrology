import SouthNodeIcon from 'zodiacfonts/icons/celestial-points/south-node.svg?react';
import NorthNodeIcon from 'zodiacfonts/icons/celestial-points/north-node.svg?react';
import ChironIcon from 'zodiacfonts/icons/dwarf-planets-and-asteroids/chiron.svg?react';
import LilithIcon from 'zodiacfonts/icons/celestial-points/lilith.svg?react';

const ASTEROIDS_COLOR = '#6B7184';

export const ASTEROIDS = {
  southNode: { icon: <SouthNodeIcon color={ASTEROIDS_COLOR} />, color: ASTEROIDS_COLOR },
  northNode: { icon: <NorthNodeIcon color={ASTEROIDS_COLOR} />, color: ASTEROIDS_COLOR },
  chiron: { icon: <ChironIcon color={ASTEROIDS_COLOR} />, color: ASTEROIDS_COLOR },
  lilith: { icon: <LilithIcon color={ASTEROIDS_COLOR} />, color: ASTEROIDS_COLOR }
};

export const ASTEROID_ORDER = ['southNode', 'northNode', 'chiron', 'lilith'] as const;
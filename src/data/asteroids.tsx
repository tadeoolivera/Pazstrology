import SouthNodeIcon from 'zodiacfonts/icons/celestial-points/south-node.svg?react';
import NorthNodeIcon from 'zodiacfonts/icons/celestial-points/north-node.svg?react';
import ChironIcon from 'zodiacfonts/icons/dwarf-planets-and-asteroids/chiron.svg?react';
import LilithIcon from 'zodiacfonts/icons/celestial-points/lilith.svg?react';

export const ASTEROIDS = {
  southNode: { icon: <SouthNodeIcon color="#6B7184" />, color: '#6B7184' },
  northNode: { icon: <NorthNodeIcon color="#6B7184" />, color: '#6B7184' },
  chiron: { icon: <ChironIcon color="#6B7184" />, color: '#6B7184' },
  lilith: { icon: <LilithIcon color="#6B7184" />, color: '#6B7184' }
};

export const ASTEROID_ORDER = ['southNode', 'northNode', 'chiron', 'lilith'] as const;
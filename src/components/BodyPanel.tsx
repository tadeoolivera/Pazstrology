import { cloneElement } from 'react';
import type { CSSProperties } from 'react';
import { PLANETS, PLANET_ORDER } from '../data/planets.tsx';
import { ASTEROIDS, ASTEROID_ORDER } from '../data/asteroids.tsx';
import { PLANETS_NAMES, ASTEROID_NAMES } from '../data/names.ts';
import type { ChartData } from '../utils/summary.ts';

const PNG_VIEWBOX: Record<string, string> = {
  uranus: '3.89 0.61 21.49 29.14',
  pluto: '1.71 0.25 26.22 29.5',
};

const BodyIcon = ({ name, size }: { name: string; size: number }) => {
  if (name === 'uranus' || name === 'pluto') {
    return (
      <svg width={size} height={size} viewBox={PNG_VIEWBOX[name]}>
        {cloneElement(PLANETS[name].icon, {})}
      </svg>
    );
  }
  return cloneElement(PLANETS[name as keyof typeof PLANETS].icon, { width: size, height: size });
};

const panelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  minWidth: 200,
  maxWidth: 400,
  overflowY: 'auto',
  padding: 12,
  borderRadius: 12,
  border: '1px solid #8A5A22',
  background: '#FFFDF7',
};

const headerStyle: CSSProperties = {
  padding: 4,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 600,
  color: '#5C3A14',
};

const hintStyle: CSSProperties = {
  margin: '4px 0 0',
  fontSize: 13,
  color: '#3A2A12',
};

const sheetStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
  gap: 8,
};

const tileStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '10px 6px',
  borderRadius: 8,
  border: '1px solid #8A5A22',
  background: '#FFFDF7',
  cursor: 'pointer',
  userSelect: 'none',
};

const tileOnStyle: CSSProperties = {
  ...tileStyle,
  background: '#F3E9D7',
  cursor: 'default',
};

const removeStyle: CSSProperties = {
  position: 'absolute',
  top: 2,
  right: 2,
  width: 20,
  height: 20,
  lineHeight: 1,
  borderRadius: '50%',
  border: 'none',
  background: '#FC0523',
  color: 'white',
  fontSize: 12,
  cursor: 'pointer',
};

const nameStyle: CSSProperties = {
  fontSize: 12,
  color: '#3A2A12',
};

type Props = {
  data: ChartData | null;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
};

const BodyPanel = ({ data, onAdd, onRemove }: Props) => {
  const present = (name: string) => data?.planets.some((p) => p.name === name) ?? false;

  return (
    <aside style={panelStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Cuerpos en la carta</h2>
        <p style={hintStyle}>Toca un cuerpo para agregarlo o quitarlo de la carta.</p>
      </div>
      <div style={sheetStyle}>
        {PLANET_ORDER.map((name) => {
          const isPresent = present(name);
          return (
            <div
              key={name}
              style={isPresent ? tileOnStyle : tileStyle}
              onClick={isPresent ? undefined : () => onAdd(name)}
            >
              <BodyIcon name={name} size={30} />
              <span style={nameStyle}>{PLANETS_NAMES[name]}</span>
              {isPresent && (
                <button
                  style={removeStyle}
                  aria-label={`Quitar ${PLANETS_NAMES[name]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(name);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        {ASTEROID_ORDER.map((name) => {
          const isPresent = present(name);
          return (
            <div
              key={name}
              style={isPresent ? tileOnStyle : tileStyle}
              onClick={isPresent ? undefined : () => onAdd(name)}
            >
              {cloneElement(ASTEROIDS[name].icon, { width: 30, height: 30 })}
              <span style={nameStyle}>{ASTEROID_NAMES[name]}</span>
              {isPresent && (
                <button
                  style={removeStyle}
                  aria-label={`Quitar ${ASTEROID_NAMES[name]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(name);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default BodyPanel;
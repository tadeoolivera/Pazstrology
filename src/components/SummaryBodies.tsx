import type { BodySummary } from '../utils/summary.ts';
import { SIGNS_NAMES, PLANETS_NAMES, ASTEROID_NAMES } from '../data/names.ts';
import { summaryStyles, type SummaryStyles } from './summaryStyles.ts';

export type { BodySummary } from '../utils/summary.ts';

type Props = {
  planets: BodySummary[];
  retrogrades?: Set<string>;
  styles?: SummaryStyles;
};

const SummaryBodies = ({ planets, retrogrades, styles }: Props) => {
  const s = {
    box: { ...summaryStyles.box, ...styles?.box },
    table: { ...summaryStyles.table, ...styles?.table },
    th: { ...summaryStyles.th, ...styles?.th },
    td: { ...summaryStyles.td, ...styles?.td },
  };

  const nameDe = (n: string) => PLANETS_NAMES[n] ?? ASTEROID_NAMES[n] ?? n;
  const retro = (n: string) => retrogrades?.has(n) ?? false;

  return (
    <div style={s.box}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Cuerpo</th>
            <th style={s.th}>Signo</th>
            <th style={s.th}>Casa</th>
            <th style={s.th}>Grado</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((p) => (
            <tr key={p.name}>
              <td style={s.td}>
                {nameDe(p.name)}
                {retro(p.name) && (
                  <span style={{ fontWeight: 700, fontSize: 14, marginLeft: 6 }}>R</span>
                )}
              </td>
              <td style={s.td}>{SIGNS_NAMES[p.sign] ?? p.sign}</td>
              <td style={s.td}>{p.house}</td>
              <td style={s.td}>{p.degree}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryBodies;
import type { AspectSummary } from '../utils/summary.ts';
import { PLANETS_NAMES, ASTEROID_NAMES } from '../data/names.ts';
import { summaryStyles, type SummaryStyles } from './summaryStyles.ts';

type Props = {
  aspects: AspectSummary[];
  retrogrades?: Set<string>;
  styles?: SummaryStyles;
};

const SummaryAspects = ({ aspects, retrogrades, styles }: Props) => {
  const s = {
    box: { ...summaryStyles.box, ...styles?.box },
    table: { ...summaryStyles.table, ...styles?.table },
    th: { ...summaryStyles.th, ...styles?.th },
    td: { ...summaryStyles.td, ...styles?.td },
  };

  const nameDe = (n: string) => PLANETS_NAMES[n] ?? ASTEROID_NAMES[n] ?? n;
  const retro = (n: string) => retrogrades?.has(n) ?? false;
  const withRetro = (n: string, color: string) => (
    <>
      {nameDe(n)}
      {retro(n) && (
        <span style={{ fontWeight: 800, fontSize: 11, color, marginLeft: 4 }}>R</span>
      )}
    </>
  );

  return (
    <div style={s.box}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Relación</th>
            <th style={s.th}>Orbe</th>
          </tr>
        </thead>
        <tbody>
          {aspects.map((a, i) => (
            <tr key={i}>
              <td style={s.td}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    background: a.color,
                    marginRight: 6,
                    verticalAlign: 'middle',
                  }}
                />
                {withRetro(a.name1, a.color)}
                {` — `}
                {withRetro(a.name2, a.color)}
                {` (${a.aspect.charAt(0).toUpperCase() + a.aspect.slice(1)})`}
              </td>
              <td style={s.td}>{a.orb.toFixed(1)}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryAspects;
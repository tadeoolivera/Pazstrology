import type { HouseSummary } from '../utils/summary.ts';
import { SIGNS_NAMES } from '../data/names.ts';
import { summaryStyles, type SummaryStyles } from './summaryStyles.ts';

type Props = {
  houses: HouseSummary[];
  styles?: SummaryStyles;
};

const SummaryHouses = ({ houses, styles }: Props) => {
  const s = {
    box: { ...summaryStyles.box, ...styles?.box },
    table: { ...summaryStyles.table, ...styles?.table },
    th: { ...summaryStyles.th, ...styles?.th },
    td: { ...summaryStyles.td, ...styles?.td },
  };

  return (
    <div style={s.box}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Casa</th>
            <th style={s.th}>Signo</th>
            <th style={s.th}>Cúspide</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((c) => (
            <tr key={c.house}>
              <td style={s.td}>Casa {c.house}</td>
              <td style={s.td}>{SIGNS_NAMES[c.sign] ?? c.sign}</td>
              <td style={s.td}>{c.degree}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryHouses;
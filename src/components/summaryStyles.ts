
import type { CSSProperties } from 'react';

export type SummaryStyles = {
  box?: CSSProperties;
  title?: CSSProperties;
  table?: CSSProperties;
  th?: CSSProperties;
  td?: CSSProperties;
};

export const summaryStyles: Record<string, CSSProperties> = {
  box: {
    padding: 16,
    borderRadius: 10,
    border: '1px solid #8A5A22',
    background: '#FFFDF7',
    width: '100%',
  },
  title: {
    margin: 0,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 600,
    color: '#5C3A14',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '6px 8px',
    borderBottom: '2px solid #8A5A22',
    color: '#8A5A22',
  },
  td: {
    textAlign: 'left',
    padding: '6px 8px',
    borderBottom: '1px solid #EDE3D0',
    color: '#3A2A12',
  },
};
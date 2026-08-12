import { useEffect, type ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { summaryStyles } from './summaryStyles.ts';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ title, onClose, children }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(38, 0, 10, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 16,
  },
  dialog: {
    background: '#FFFDF7',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.35)',
    maxWidth: 460,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: 8,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '4px 8px 0',
  },
  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    color: '#5C3A14',
    ...summaryStyles.title,
  },
  close: {
    border: 'none',
    background: 'transparent',
    fontSize: 18,
    lineHeight: 1,
    color: '#8A5A22',
    cursor: 'pointer',
    padding: 4,
  },
};

export default Modal;
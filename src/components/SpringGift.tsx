import { useState, useEffect, useCallback } from 'react';

/* ── tiny helpers ───────────────────────────────────────────────── */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

/* ── constants ──────────────────────────────────────────────────── */
const PETAL_COUNT = 28;
const HEART_COUNT = 12;
const SPARKLE_COUNT = 18;

/* ── SVG Flower ─────────────────────────────────────────────────── */
const Flower = ({
  x,
  y,
  size,
  delay,
  petalColor = '#FFD54F',
  centerColor = '#8D6E33',
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  petalColor?: string;
  centerColor?: string;
}) => {
  const petalCount = 6;
  return (
    <g className="sg-flower" style={{ animationDelay: `${delay}s` }}>
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (360 / petalCount) * i;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={size * 0.38}
            ry={size * 0.18}
            fill={petalColor}
            opacity={0.92}
            transform={`rotate(${angle} ${x} ${y}) translate(0 ${-size * 0.32})`}
          />
        );
      })}
      <circle cx={x} cy={y} r={size * 0.16} fill={centerColor} />
    </g>
  );
};

/* ── Bouquet (SVG group) ────────────────────────────────────────── */
const Bouquet = ({ x, y }: { x: number; y: number }) => {
  const flowers = [
    { dx: 0, dy: -48, size: 32, color: '#FFD54F', delay: 0.8 },
    { dx: -22, dy: -36, size: 26, color: '#FFEB3B', delay: 1.0 },
    { dx: 22, dy: -36, size: 26, color: '#FFC107', delay: 1.2 },
    { dx: -12, dy: -58, size: 22, color: '#FFE082', delay: 1.4 },
    { dx: 14, dy: -56, size: 24, color: '#FFD54F', delay: 1.1 },
    { dx: -30, dy: -52, size: 20, color: '#FFCA28', delay: 1.6 },
    { dx: 28, dy: -50, size: 20, color: '#FFE082', delay: 1.5 },
  ];

  return (
    <g>
      {/* stems */}
      {flowers.map((f, i) => (
        <line
          key={`stem-${i}`}
          x1={x}
          y1={y}
          x2={x + f.dx}
          y2={y + f.dy}
          stroke="#6A994E"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="sg-stem"
          style={{ animationDelay: `${Math.max(0, f.delay - 0.3)}s` }}
        />
      ))}
      {/* wrapping paper */}
      <path
        d={`M${x - 18} ${y + 6} Q${x} ${y + 22} ${x + 18} ${y + 6} L${x + 10} ${y - 8} Q${x} ${y + 2} ${x - 10} ${y - 8}Z`}
        fill="#F9A825"
        opacity={0.85}
        className="sg-wrap"
      />
      {/* bow tie */}
      <circle cx={x} cy={y + 4} r={3.5} fill="#D81B60" className="sg-wrap" />
      {/* flowers */}
      {flowers.map((f, i) => (
        <Flower
          key={i}
          x={x + f.dx}
          y={y + f.dy}
          size={f.size}
          delay={f.delay}
          petalColor={f.color}
        />
      ))}
    </g>
  );
};

/* ── Stick Figure: Boy ──────────────────────────────────────────── */
const Boy = ({ x, y }: { x: number; y: number }) => (
  <g className="sg-boy">
    {/* body */}
    <line x1={x} y1={y - 24} x2={x} y2={y + 30} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    {/* legs */}
    <line x1={x} y1={y + 30} x2={x - 16} y2={y + 58} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    <line x1={x} y1={y + 30} x2={x + 16} y2={y + 58} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    {/* arm (left, waving) */}
    <line x1={x} y1={y - 10} x2={x - 26} y2={y + 8} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" className="sg-wave-arm" />
    {/* arm (right, holding bouquet) */}
    <line x1={x} y1={y - 10} x2={x + 28} y2={y - 2} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    {/* head — tez café con leche */}
    <circle cx={x} cy={y - 36} r={14} fill="#C68E5E" stroke="#5C3A14" strokeWidth={2} />
    {/* hair — rulos */}
    <g fill="#241407">
      <circle cx={x - 11} cy={y - 46} r={5.5} />
      <circle cx={x - 6} cy={y - 50} r={6.5} />
      <circle cx={x} cy={y - 52} r={7} />
      <circle cx={x + 6} cy={y - 50} r={6.5} />
      <circle cx={x + 11} cy={y - 46} r={5.5} />
      <circle cx={x - 13} cy={y - 40} r={4} />
      <circle cx={x + 13} cy={y - 40} r={4} />
    </g>
    {/* eyes */}
    <circle cx={x - 4} cy={y - 37} r={1.8} fill="#2B1A0F" />
    <circle cx={x + 6} cy={y - 37} r={1.8} fill="#2B1A0F" />
    {/* lentes */}
    <g stroke="#D3D3D3" strokeWidth={1.8} fill="rgba(255,255,255,0.15)">
      <rect x={x - 10} y={y - 42} width={10.5} height={9} rx={2.5} />
      <rect x={x + 1} y={y - 42} width={10.5} height={9} rx={2.5} />
      <line x1={x + 0.5} y1={y - 38.5} x2={x + 1} y2={y - 38.5} strokeLinecap="round" />
      <line x1={x - 10} y1={y - 39} x2={x - 13.5} y2={y - 40} strokeLinecap="round" />
      <line x1={x + 11.5} y1={y - 39} x2={x + 13.5} y2={y - 40} strokeLinecap="round" />
    </g>
    {/* smile */}
    <path d={`M${x - 4} ${y - 31} Q${x + 1} ${y - 26} ${x + 6} ${y - 31}`} fill="none" stroke="#2B1A0F" strokeWidth={1.5} strokeLinecap="round" />
  </g>
);

/* ── Stick Figure: Girl ─────────────────────────────────────────── */
const Girl = ({ x, y }: { x: number; y: number }) => (
  <g className="sg-girl">
    {/* remera rosa */}
    <line x1={x} y1={y - 24} x2={x} y2={y + 10} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    {/* shorts negros */}
    <path
      d={`M${x - 10} ${y + 10} L${x - 10} ${y + 28} L${x - 1} ${y + 28} L${x - 1} ${y + 19} L${x + 1} ${y + 19} L${x + 1} ${y + 28} L${x + 10} ${y + 28} L${x + 10} ${y + 10} Z`}
      fill="#212121"
    />
    {/* legs */}
    <line x1={x - 5} y1={y + 28} x2={x - 14} y2={y + 58} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    <line x1={x + 5} y1={y + 28} x2={x + 14} y2={y + 58} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    {/* arms */}
    <line x1={x} y1={y - 10} x2={x - 24} y2={y + 6} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" />
    <line x1={x} y1={y - 10} x2={x + 24} y2={y - 18} stroke="#5C3A14" strokeWidth={3} strokeLinecap="round" className="sg-reach-arm" />
    {/* head */}
    <circle cx={x} cy={y - 36} r={14} fill="#FFDAB9" stroke="#5C3A14" strokeWidth={2} />
    {/* long hair */}
    <path d={`M${x - 14} ${y - 38} Q${x - 18} ${y - 14} ${x - 16} ${y}`} stroke="#5C3A14" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d={`M${x + 14} ${y - 38} Q${x + 18} ${y - 14} ${x + 16} ${y}`} stroke="#5C3A14" strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d={`M${x - 12} ${y - 46} Q${x} ${y - 54} ${x + 12} ${y - 46}`} fill="#5C3A14" />
    {/* flower in hair */}
    <Flower x={x + 12} y={y - 48} size={10} delay={2.2} petalColor="#FFD54F" centerColor="#F9A825" />
    {/* eyes */}
    <circle cx={x - 5} cy={y - 37} r={1.8} fill="#5C3A14" />
    <circle cx={x + 5} cy={y - 37} r={1.8} fill="#5C3A14" />
    {/* smile */}
    <path d={`M${x - 4} ${y - 31} Q${x} ${y - 26} ${x + 4} ${y - 31}`} fill="none" stroke="#D81B60" strokeWidth={1.5} strokeLinecap="round" />
    {/* blush */}
    <circle cx={x - 10} cy={y - 32} r={3.5} fill="#F48FB1" opacity={0.4} />
    <circle cx={x + 10} cy={y - 32} r={3.5} fill="#F48FB1" opacity={0.4} />
  </g>
);

/* ── main component ─────────────────────────────────────────────── */
export default function SpringGift({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0); // 0→fade-in, 1→scene, 2→message

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClose = useCallback(() => onClose(), [onClose]);

  /* close on Escape + lock background scroll */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleClose]);

  /* generate petals, hearts, sparkles once */
  const [petals] = useState(() =>
    Array.from({ length: PETAL_COUNT }).map(() => ({
      x: rand(0, 100),
      size: rand(6, 14),
      dur: rand(4, 9),
      delay: rand(0, 6),
      drift: rand(-40, 40),
      color: ['#FFD54F', '#FFEB3B', '#FFC107', '#FFE082', '#FFCA28'][Math.floor(rand(0, 5))],
    })),
  );

  const [hearts] = useState(() =>
    Array.from({ length: HEART_COUNT }).map(() => ({
      x: rand(20, 80),
      dur: rand(3, 6),
      delay: rand(2, 8),
      size: rand(10, 20),
    })),
  );

  const [sparkles] = useState(() =>
    Array.from({ length: SPARKLE_COUNT }).map(() => ({
      x: rand(5, 95),
      y: rand(5, 85),
      dur: rand(1.5, 3),
      delay: rand(0, 5),
      size: rand(2, 5),
    })),
  );

  return (
    <div
      className={`sg-overlay ${phase >= 1 ? 'sg-visible' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Regalo de primavera para Paz"
    >
      {/* inline styles scoped to this overlay */}
      <style>{`
        .sg-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 50% 60%, #FFF8E1 0%, #FFF3C4 40%, #FFE082 100%);
          opacity: 0;
          transition: opacity 0.8s ease;
          cursor: pointer;
          overflow: hidden;
          overflow-y: auto;
          padding: 16px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .sg-overlay.sg-visible { opacity: 1; }

        .sg-card {
          position: relative;
          z-index: 2;
          background: rgba(255, 253, 247, 0.92);
          border: 2px solid #F9A825;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(249, 168, 37, 0.35);
          max-width: 460px;
          width: 100%;
          max-height: 92vh;
          max-height: 92dvh;
          overflow-y: auto;
          padding: 18px 18px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: default;
          animation: sgCardIn 0.6s ease-out 0.4s both;
        }
        @keyframes sgCardIn {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .sg-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #E0C99A;
          background: #fff;
          color: #8A5A22;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sg-close:hover { background: #FFF3C4; }

        .sg-petal {
          position: absolute;
          top: -20px;
          border-radius: 50% 0 50% 0;
          opacity: 0.75;
          animation: sgFall var(--dur) ease-in-out var(--delay) infinite;
          pointer-events: none;
        }
        @keyframes sgFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }

        .sg-heart {
          position: absolute;
          bottom: -30px;
          animation: sgFloat var(--dur) ease-out var(--delay) infinite;
          opacity: 0;
          pointer-events: none;
        }
        @keyframes sgFloat {
          0%   { transform: translateY(0) scale(0.5); opacity: 0; }
          20%  { opacity: 0.6; }
          100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
        }

        .sg-sparkle {
          position: absolute;
          border-radius: 50%;
          background: #FFD54F;
          animation: sgSparkle var(--dur) ease-in-out var(--delay) infinite;
          opacity: 0;
          pointer-events: none;
        }
        @keyframes sgSparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 0.9; transform: scale(1); }
        }

        .sg-flower {
          transform-box: fill-box;
          transform-origin: center;
          animation: sgBloom 0.6s ease-out forwards;
          opacity: 0;
          transform: scale(0);
        }
        @keyframes sgBloom {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .sg-stem {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: sgGrow 0.5s ease-out forwards;
        }
        @keyframes sgGrow {
          to { stroke-dashoffset: 0; }
        }

        .sg-wrap {
          transform-box: fill-box;
          transform-origin: center;
          animation: sgPop 0.4s ease-out 0.5s both;
        }
        @keyframes sgPop {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 0.85; }
        }

        .sg-big-heart {
          transform-box: fill-box;
          transform-origin: center;
          animation: sgHeartbeat 1.6s ease-in-out 2.6s infinite;
          opacity: 0;
        }
        @keyframes sgHeartbeat {
          0% { opacity: 0; transform: scale(0); }
          15% { opacity: 1; transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .sg-wave-arm {
          transform-box: fill-box;
          transform-origin: top center;
          animation: sgWave 1.2s ease-in-out 2.5s infinite;
        }
        @keyframes sgWave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(10deg); }
        }

        .sg-reach-arm {
          transform-box: fill-box;
          transform-origin: top center;
          animation: sgReach 2s ease-in-out 2s infinite;
        }
        @keyframes sgReach {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }

        .sg-boy { animation: sgSlideRight 1s ease-out 0.3s both; }
        @keyframes sgSlideRight {
          0%   { transform: translateX(-60px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .sg-girl { animation: sgSlideLeft 1s ease-out 0.5s both; }
        @keyframes sgSlideLeft {
          0%   { transform: translateX(60px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        .sg-butterfly { animation: sgButterfly 8s ease-in-out infinite; }
        @keyframes sgButterfly {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(30px, -15px); }
          50%  { transform: translate(60px, 5px); }
          75%  { transform: translate(20px, 10px); }
          100% { transform: translate(0, 0); }
        }

        .sg-title {
          font-size: clamp(20px, 5vw, 28px);
          font-weight: 800;
          color: #E8960C;
          text-shadow: 0 2px 8px rgba(249, 168, 37, 0.3);
          margin: 6px 0 2px;
          opacity: 0;
          animation: sgFadeIn 0.8s ease-out 1.8s forwards;
          pointer-events: none;
          text-align: center;
        }
        .sg-subtitle {
          font-size: 13px;
          color: #A68A5B;
          margin-bottom: 6px;
          opacity: 0;
          animation: sgFadeIn 0.8s ease-out 2.1s forwards;
          pointer-events: none;
          text-align: center;
        }
        .sg-message {
          text-align: center;
          color: #5C3A14;
          font-size: clamp(14px, 3.5vw, 16px);
          line-height: 1.7;
          max-width: 400px;
          white-space: pre-line;
          margin-top: 10px;
          padding: 0 8px;
          min-height: 8em;
          pointer-events: none;
          font-weight: 500;
        }
        .sg-accepted {
          text-align: center;
          color: #5C3A14;
          font-size: clamp(14px, 3.5vw, 16px);
          line-height: 1.7;
          white-space: pre-line;
          background: #FFF8E1;
          border: 1px dashed #F9A825;
          border-radius: 12px;
          padding: 12px;
          margin-top: 10px;
          animation: sgFadeIn 0.5s ease-out both;
          pointer-events: none;
        }
        .sg-cursor {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          background: #8A5A22;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: sgBlink 0.7s step-end infinite;
        }
        @keyframes sgBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .sg-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .sg-btn-primary {
          background: #F9A825;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 10px 22px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(249, 168, 37, 0.4);
          transition: transform 0.15s ease;
        }
        .sg-btn-primary:hover { transform: scale(1.05); }
        .sg-btn-primary:active { transform: scale(0.96); }
        .sg-btn-ghost {
          background: transparent;
          color: #8A5A22;
          border: 1px solid #E0C99A;
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 14px;
          cursor: pointer;
        }
        .sg-btn-ghost:hover { background: #FFF3C4; }

        .sg-hint {
          margin-top: 12px;
          color: #A68A5B;
          font-size: 12px;
          opacity: 0;
          animation: sgFadeIn 0.6s ease-out 4s forwards;
          pointer-events: none;
          text-align: center;
        }
        @keyframes sgFadeIn {
          to { opacity: 0.85; }
        }

        .sg-burst {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 3;
        }
        .sg-burst span {
          position: absolute;
          left: 50%;
          top: 42%;
          animation: sgBurstPop 1.2s ease-out forwards;
          animation-delay: var(--bdelay);
          opacity: 0;
        }
        @keyframes sgBurstPop {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 1; transform: translate(var(--bx), var(--by)) scale(1.3); }
          100% { opacity: 0; transform: translate(calc(var(--bx) * 2), calc(var(--by) * 2)) scale(0.8); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sg-petal, .sg-heart, .sg-sparkle, .sg-butterfly,
          .sg-wave-arm, .sg-reach-arm, .sg-big-heart {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>

      {/* falling petals */}
      {petals.map((p, i) => (
        <div
          key={`p-${i}`}
          className="sg-petal"
          style={
            {
              left: `${p.x}%`,
              width: p.size,
              height: p.size * 1.4,
              background: p.color,
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* floating hearts */}
      {hearts.map((h, i) => (
        <div
          key={`h-${i}`}
          className="sg-heart"
          style={
            {
              left: `${h.x}%`,
              '--dur': `${h.dur}s`,
              '--delay': `${h.delay}s`,
              fontSize: h.size,
            } as React.CSSProperties
          }
        >
          💛
        </div>
      ))}

      {/* sparkles */}
      {sparkles.map((s, i) => (
        <div
          key={`s-${i}`}
          className="sg-sparkle"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              '--dur': `${s.dur}s`,
              '--delay': `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* card (clicks inside don't close) */}
      <div className="sg-card" onClick={(e) => e.stopPropagation()} role="document">
        <button className="sg-close" onClick={handleClose} aria-label="Cerrar regalo">
          ✕
        </button>

        {/* scene */}
        <svg
          viewBox="0 0 360 210"
          width="360"
          style={{ maxWidth: '100%', overflow: 'visible' }}
          role="img"
          aria-label="Tadeo dándole flores amarillas a Paz"
        >
          {/* ground */}
          <ellipse cx="180" cy="196" rx="160" ry="14" fill="#A5D6A7" opacity="0.5" />
          {/* grass tufts */}
          {[80, 130, 180, 230, 280].map((gx) => (
            <g key={gx}>
              <line x1={gx - 4} y1={196} x2={gx - 6} y2={186} stroke="#66BB6A" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={gx} y1={196} x2={gx} y2={184} stroke="#81C784" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={gx + 4} y1={196} x2={gx + 5} y2={187} stroke="#66BB6A" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          ))}
          {/* sun */}
          <circle cx="310" cy="30" r="22" fill="#FFD54F" opacity="0.9">
            <animate attributeName="r" values="22;24;22" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* sun rays */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={310 + Math.cos(angle) * 26}
                y1={30 + Math.sin(angle) * 26}
                x2={310 + Math.cos(angle) * 36}
                y2={30 + Math.sin(angle) * 36}
                stroke="#FFD54F"
                strokeWidth={2}
                strokeLinecap="round"
                opacity="0.7"
              >
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
              </line>
            );
          })}
          {/* small clouds */}
          <g opacity="0.5">
            <ellipse cx="60" cy="32" rx="28" ry="10" fill="white" />
            <ellipse cx="52" cy="28" rx="16" ry="10" fill="white" />
            <ellipse cx="72" cy="28" rx="18" ry="10" fill="white" />
          </g>
          <g opacity="0.35">
            <ellipse cx="200" cy="20" rx="22" ry="8" fill="white" />
            <ellipse cx="190" cy="16" rx="14" ry="8" fill="white" />
            <ellipse cx="212" cy="17" rx="14" ry="8" fill="white" />
          </g>
          {/* butterfly */}
          <g className="sg-butterfly">
            <ellipse cx="140" cy="60" rx="6" ry="4" fill="#FFD54F" opacity="0.7">
              <animate attributeName="ry" values="4;1;4" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="152" cy="60" rx="6" ry="4" fill="#FFCA28" opacity="0.7">
              <animate attributeName="ry" values="4;1;4" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <line x1="144" y1="58" x2="146" y2="54" stroke="#5C3A14" strokeWidth={0.8} />
            <line x1="148" y1="58" x2="150" y2="54" stroke="#5C3A14" strokeWidth={0.8} />
          </g>
          {/* boy (left) */}
          <Boy x={120} y={146} />
          {/* bouquet in boy's hands */}
          <Bouquet x={156} y={138} />
          {/* girl (right) */}
          <Girl x={220} y={146} />
          {/* big beating heart between them */}
          <text x="172" y="72" fontSize="22" textAnchor="middle" className="sg-big-heart">
            💛
          </text>
        </svg>

        {/* title */}
        <div className="sg-title">¡Sorpresa!</div>
        <div className="sg-subtitle">¿Te pensabas que no iban a haber flores amarillas?</div>

        {/* close hint */}
        <div className="sg-hint">tocá afuera para cerrar 👋</div>
      </div>
    </div>
  );
}

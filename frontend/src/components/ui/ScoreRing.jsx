import React from 'react';

const ScoreRing = ({ score = 0, size = 40, stroke = 6 }) => {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  // color based on score levels
  const getColor = (s) => {
    if (s >= 80) return 'var(--success)';
    if (s >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="var(--border)"
        strokeWidth={stroke}
        fill="transparent"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={getColor(clamped)}
        strokeWidth={stroke}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 400ms ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" style={{ fontFamily: 'DM Mono, monospace', fontSize: Math.max(10, size * 0.27), fill: 'var(--text-primary)' }}>
        {clamped}
      </text>
    </svg>
  );
};

export default ScoreRing;

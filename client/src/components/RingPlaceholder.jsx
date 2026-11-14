/* © 2026 Eden Jewelry. All rights reserved. */
import { useId } from 'react';

// Drawn ring shown until real photos are added. The gem takes the stone's colour.
const STONES = {
  emerald: ['#8affd6', '#17a673', '#05472f'],
  diamond: ['#ffffff', '#d5e6ff', '#7d93b8'],
  moissanite: ['#f4fbff', '#bfe6ff', '#6e8fb5'],
  zircon: ['#fff7ff', '#e2d5ff', '#8d7ab8'],
};
const OTHER_STONE = ['#ffe9a8', '#e0a93a', '#7a5212'];

const BANDS = {
  silver: ['#ffffff', '#b8c0ca', '#f1f4f7', '#8e96a1'],
  grey: ['#c9cdd2', '#6f757d', '#a9aeb5', '#4a4f56'],
};

export default function RingPlaceholder({ stone = 'none', color = 'silver', label, className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const band = BANDS[color] || BANDS.silver;
  const gem = stone === 'none' ? null : STONES[stone] || OTHER_STONE;

  return (
    <svg className={`ring-placeholder ${className}`} viewBox="0 0 200 200" role="img" aria-label={label || 'Ring photo coming soon'}>
      <defs>
        <radialGradient id={`bg${id}`} cx="0.5" cy="0.45" r="0.65">
          <stop offset="0" stopColor="#2a2522" />
          <stop offset="1" stopColor="#141110" />
        </radialGradient>
        <linearGradient id={`band${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={band[0]} />
          <stop offset="0.35" stopColor={band[1]} />
          <stop offset="0.6" stopColor={band[2]} />
          <stop offset="1" stopColor={band[3]} />
        </linearGradient>
        {gem && (
          <linearGradient id={`gem${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={gem[0]} />
            <stop offset="0.5" stopColor={gem[1]} />
            <stop offset="1" stopColor={gem[2]} />
          </linearGradient>
        )}
      </defs>
      <rect width="200" height="200" fill={`url(#bg${id})`} />
      <ellipse cx="100" cy="168" rx="56" ry="7" fill="#000" opacity="0.35" />
      <circle cx="100" cy="112" r="46" fill="none" stroke={`url(#band${id})`} strokeWidth="11" />
      <circle cx="100" cy="112" r="40" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
      <path d="M64 92 A46 46 0 0 1 104 66" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      {gem ? (
        <g transform="translate(100 56)">
          <path d="M-11 6 L11 6 L8 13 L-8 13 Z" fill={`url(#band${id})`} />
          <path d="M-16 -2 L-9 -12 L9 -12 L16 -2 L0 13 Z" fill={`url(#gem${id})`} stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
          <path d="M-9 -12 L-4 -2 L4 -2 L9 -12 M-16 -2 L16 -2 M-4 -2 L0 13 L4 -2" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" />
        </g>
      ) : (
        <g stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2">
          <path d="M100 61 v8 M131 72 l-5 6 M69 72 l5 6 M146 104 h-8 M54 104 h8" />
        </g>
      )}
      <text x="100" y="192" textAnchor="middle" fontSize="9" fill="#8f877f" letterSpacing="2" fontFamily="Manrope, sans-serif">
        PHOTO SOON
      </text>
    </svg>
  );
}

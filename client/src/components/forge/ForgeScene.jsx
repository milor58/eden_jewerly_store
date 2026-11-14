/* © 2026 Eden Jewelry. All rights reserved. */
// The blacksmith workshop, drawn in SVG. ForgeHero.jsx animates it with GSAP.
// Every animated part has a className that starts with its role
// (crucible, stream, smith-arm, spark, ember, hero-ring ...).

const FLAMES = [
  { x: 176, s: 0.8 },
  { x: 204, s: 1.05 },
  { x: 231, s: 1.25 },
  { x: 258, s: 1.0 },
  { x: 285, s: 0.78 },
];

const EMBERS = Array.from({ length: 24 }, (_, i) => ({
  cx: 168 + ((i * 37) % 128),
  cy: 600 + ((i * 13) % 30),
  r: 1.4 + ((i * 7) % 5) * 0.35,
}));

const SPARK_SETS = [1, 2, 3];
const SPARKS = Array.from({ length: 14 }, (_, i) => i);

export default function ForgeScene({ preserve = 'xMidYMax slice', viewBox = '0 0 1200 800' }) {
  return (
    <svg
      className="forge-svg"
      viewBox={viewBox}
      preserveAspectRatio={preserve}
      role="img"
      aria-label="A blacksmith melts silver, pours it into a mould and hammers it into a ring"
    >
      <defs>
        <pattern id="fz-bricks" width="90" height="44" patternUnits="userSpaceOnUse">
          <rect width="90" height="44" fill="#140f0d" />
          <rect x="1" y="1" width="88" height="20" rx="2" fill="#1d1512" />
          <rect x="-44" y="23" width="88" height="20" rx="2" fill="#1b1411" />
          <rect x="46" y="23" width="88" height="20" rx="2" fill="#1e1613" />
        </pattern>
        <linearGradient id="fz-wallShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060504" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#060504" stopOpacity="0.35" />
          <stop offset="1" stopColor="#060504" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="fz-fireGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff8a2a" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#ff5a1f" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fz-innerGlow" cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.5" stopColor="#ff7a24" />
          <stop offset="1" stopColor="#6b1a05" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fz-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff4b8" />
          <stop offset="0.45" stopColor="#ffb238" />
          <stop offset="1" stopColor="#ff4d1a" />
        </linearGradient>
        <linearGradient id="fz-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f8fb" />
          <stop offset="0.35" stopColor="#a9b1bc" />
          <stop offset="0.6" stopColor="#e9ecf0" />
          <stop offset="1" stopColor="#7f8791" />
        </linearGradient>
        <linearGradient id="fz-hot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="0.5" stopColor="#ffb347" />
          <stop offset="1" stopColor="#ff5a1f" />
        </linearGradient>
        <linearGradient id="fz-hotV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.6" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#ff8a2a" />
        </linearGradient>
        <linearGradient id="fz-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b727b" />
          <stop offset="1" stopColor="#30343a" />
        </linearGradient>
        <linearGradient id="fz-anvil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4f56" />
          <stop offset="0.25" stopColor="#30343a" />
          <stop offset="1" stopColor="#1b1d21" />
        </linearGradient>
        <linearGradient id="fz-apron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d4c2b" />
          <stop offset="1" stopColor="#4a2c19" />
        </linearGradient>
        <radialGradient id="fz-ringGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#dfe9ff" stopOpacity="0.32" />
          <stop offset="0.55" stopColor="#9fb6d9" stopOpacity="0.1" />
          <stop offset="1" stopColor="#9fb6d9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fz-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#b8c0ca" />
          <stop offset="0.55" stopColor="#f1f4f7" />
          <stop offset="0.8" stopColor="#8e96a1" />
          <stop offset="1" stopColor="#dfe3e8" />
        </linearGradient>
        <linearGradient id="fz-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8affd6" />
          <stop offset="0.45" stopColor="#17a673" />
          <stop offset="1" stopColor="#05472f" />
        </linearGradient>
        <filter id="fz-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="forge-world">
        {/* ---------- room ---------- */}
        <rect x="-200" y="-100" width="1600" height="805" fill="url(#fz-bricks)" />
        <rect x="-200" y="-100" width="1600" height="805" fill="url(#fz-wallShade)" />
        <rect x="-200" y="700" width="1600" height="200" fill="#0b0807" />
        <line x1="-200" y1="700" x2="1400" y2="700" stroke="#2a1e18" strokeWidth="2" />
        <ellipse className="furnace-glow" cx="230" cy="560" rx="400" ry="310" fill="url(#fz-fireGlow)" />

        {/* tool rack on the wall */}
        <g stroke="#2f2622" strokeLinecap="round" opacity="0.9">
          <line x1="980" y1="170" x2="1160" y2="170" strokeWidth="8" />
          <line x1="1005" y1="175" x2="1005" y2="300" strokeWidth="5" />
          <rect x="990" y="292" width="30" height="18" rx="3" fill="#2f2622" strokeWidth="0" />
          <line x1="1050" y1="175" x2="1040" y2="320" strokeWidth="4" />
          <line x1="1058" y1="175" x2="1066" y2="320" strokeWidth="4" />
          <line x1="1110" y1="175" x2="1110" y2="285" strokeWidth="5" />
          <circle cx="1110" cy="298" r="14" fill="none" strokeWidth="5" />
          <line x1="1145" y1="175" x2="1145" y2="270" strokeWidth="4" />
        </g>

        {/* ---------- furnace ---------- */}
        <rect x="185" y="-120" width="90" height="372" fill="#221b18" />
        <path d="M120 250 L340 250 L310 318 L150 318 Z" fill="#2b231f" stroke="#3d322c" strokeWidth="2" />
        <rect x="105" y="318" width="250" height="390" rx="10" fill="#2e2521" stroke="#40352f" strokeWidth="2" />
        <g stroke="#3a2f29" strokeWidth="2" fill="none">
          <path d="M105 380 H355 M105 440 H150 M310 440 H355 M105 500 H140 M320 500 H355 M105 560 H145 M315 560 H355 M105 620 H145 M315 620 H355 M105 680 H355" />
          <path d="M170 318 V380 M240 318 V380 M300 318 V380 M128 380 V440 M335 380 V440 M128 680 V708 M230 680 V708 M330 680 V708" />
        </g>
        <path d="M150 652 L150 505 Q230 420 310 505 L310 652 Z" fill="#150a05" stroke="#4a3a31" strokeWidth="7" />
        <ellipse className="furnace-inner" cx="230" cy="615" rx="78" ry="52" fill="url(#fz-innerGlow)" opacity="0.75" />

        {/* ---------- crucible (moved by GSAP) ---------- */}
        <g className="crucible" transform="translate(230 560)">
          <g className="crucible-chain" opacity="0">
            <line x1="0" y1="-34" x2="0" y2="-900" stroke="#6d645d" strokeWidth="3" strokeDasharray="9 5" />
            <path d="M0 -20 q-9 -6 0 -14" fill="none" stroke="#8a817a" strokeWidth="3" />
          </g>
          <g className="crucible-tilt">
            <path d="M-30 2 Q0 -42 30 2" fill="none" stroke="#7a726b" strokeWidth="4" />
            <ellipse cx="0" cy="0" rx="36" ry="7" fill="#1a1412" stroke="#7a726b" strokeWidth="2" />
            <g className="bars">
              <rect className="bar" x="-27" y="-18" width="16" height="20" rx="2" fill="url(#fz-silver)" stroke="#8a919a" strokeWidth="0.8" />
              <rect className="bar" x="-8" y="-24" width="16" height="26" rx="2" fill="url(#fz-silver)" stroke="#8a919a" strokeWidth="0.8" />
              <rect className="bar" x="11" y="-16" width="16" height="18" rx="2" fill="url(#fz-silver)" stroke="#8a919a" strokeWidth="0.8" />
            </g>
            <ellipse className="liquid" cx="0" cy="1" rx="33" ry="6" fill="url(#fz-hot)" opacity="0" filter="url(#fz-glow)" />
            <path d="M-36 0 L36 0 L26 62 Q0 70 -26 62 Z" fill="#48403b" stroke="#6f6761" strokeWidth="2" />
            <path className="crucible-hot" d="M-36 0 L36 0 L26 62 Q0 70 -26 62 Z" fill="url(#fz-hot)" opacity="0" />
            <path d="M-36 0 A36 7 0 0 0 36 0" fill="none" stroke="#857d76" strokeWidth="2.5" />
          </g>
        </g>

        {/* flames in front of the crucible */}
        <ellipse cx="230" cy="648" rx="72" ry="10" fill="#ff7a24" opacity="0.8" />
        {FLAMES.map((f) => (
          <g key={f.x} transform={`translate(${f.x} 650) scale(${f.s})`}>
            <path
              className="flame"
              d="M0 0 C-22 -8 -26 -38 -10 -62 C-6 -46 4 -50 2 -74 C18 -54 26 -28 18 -10 C14 -3 8 0 0 0 Z"
              fill="url(#fz-flame)"
              opacity="0.92"
            />
          </g>
        ))}
        <g className="embers">
          {EMBERS.map((e, i) => (
            <circle key={i} className="ember" cx={e.cx} cy={e.cy} r={e.r} fill="#ffb347" opacity="0" />
          ))}
        </g>
        <rect x="138" y="648" width="184" height="16" rx="4" fill="#3a2f29" stroke="#4a3d35" />

        {/* ---------- anvil + stump ---------- */}
        <path d="M592 666 L708 666 L718 704 L582 704 Z" fill="#4a2d1c" stroke="#5d3a25" strokeWidth="2" />
        <path d="M610 676 H690 M600 690 H700" stroke="#5f3b26" strokeWidth="2" />
        <path
          d="M482 598 Q520 594 548 588 L782 588 L782 614 L748 620 Q728 628 724 648 L742 668 L560 668 L578 648 Q574 628 552 620 L548 612 Q518 606 482 598 Z"
          fill="url(#fz-anvil)"
          stroke="#50565e"
          strokeWidth="2"
        />
        <line x1="550" y1="589.5" x2="780" y2="589.5" stroke="#9aa2ac" strokeWidth="2" opacity="0.55" />
        <rect x="758" y="591" width="9" height="6" fill="#15171a" />

        {/* ---------- mould, molten stream, ring blank ---------- */}
        <g className="mold">
          <rect x="610" y="566" width="80" height="22" rx="3" fill="#26282c" stroke="#4b4f55" strokeWidth="1.5" />
          <ellipse cx="650" cy="573" rx="24" ry="5" fill="#0d0e10" />
          <ellipse className="mold-glow" cx="650" cy="573" rx="23" ry="4.5" fill="none" stroke="#ffb347" strokeWidth="5" opacity="0" filter="url(#fz-glow)" />
        </g>
        <rect className="stream" x="646" y="449" width="8" height="124" rx="4" fill="url(#fz-hotV)" opacity="0" filter="url(#fz-glow)" />
        <ellipse className="ring-cool" cx="650" cy="577" rx="26" ry="8" fill="none" stroke="url(#fz-silver)" strokeWidth="7" opacity="0" />
        <ellipse className="ring-hot" cx="650" cy="577" rx="26" ry="8" fill="none" stroke="#ff8a2a" strokeWidth="7" opacity="0" filter="url(#fz-glow)" />
        <g className="steam">
          {[-14, 2, 16, -4].map((dx, i) => (
            <circle key={i} className="steam-puff" cx={650 + dx} cy="560" r={9 + i * 2} fill="#cfd6de" opacity="0" />
          ))}
        </g>

        {/* ---------- the blacksmith ---------- */}
        <g className="smith">
          <path d="M905 585 L936 585 L946 742 L918 742 Z" fill="#1a1715" />
          <path d="M869 585 L902 585 L899 742 L867 742 Z" fill="#221e1b" />
          <rect x="857" y="734" width="50" height="15" rx="6" fill="#0f0c0b" />
          <rect x="912" y="734" width="48" height="15" rx="6" fill="#0f0c0b" />
          <path d="M872 438 Q906 418 944 440 L952 600 L866 600 Z" fill="#342923" />
          {/* far arm with tongs */}
          <line x1="880" y1="452" x2="846" y2="530" stroke="#2e241f" strokeWidth="24" strokeLinecap="round" />
          <line x1="846" y1="530" x2="787" y2="566" stroke="#b9805a" strokeWidth="17" strokeLinecap="round" />
          <circle cx="783" cy="568" r="10" fill="#ad7550" />
          <g className="tongs" opacity="0">
            <line x1="788" y1="564" x2="676" y2="573" stroke="#2b2c30" strokeWidth="5" strokeLinecap="round" />
            <line x1="788" y1="571" x2="676" y2="582" stroke="#3a3c42" strokeWidth="5" strokeLinecap="round" />
            <circle cx="752" cy="568" r="4" fill="#55585f" />
          </g>
          {/* apron */}
          <path d="M864 462 Q905 452 946 462 L960 716 L852 716 Z" fill="url(#fz-apron)" stroke="#8a5634" strokeWidth="1.5" />
          <path d="M880 463 L902 420 L928 463" fill="none" stroke="#5a3720" strokeWidth="4" />
          <rect x="880" y="590" width="50" height="30" rx="3" fill="none" stroke="#8a5634" strokeWidth="1.5" />
          {/* head */}
          <rect x="903" y="398" width="22" height="32" fill="#b07652" />
          <circle cx="915" cy="382" r="28" fill="#c38a62" />
          <path d="M887 378 Q889 348 916 346 Q944 346 945 380 Q938 366 922 364 Q900 362 887 378 Z" fill="#1f1915" />
          <path d="M889 389 Q887 413 908 419 Q929 417 935 399 Q920 405 905 401 Q895 397 889 389 Z" fill="#2a211c" />
          <path d="M888 378 L879 390 L889 392 Z" fill="#b47b55" />
          <circle cx="931" cy="385" r="5" fill="#b47b55" />
          <line x1="894" y1="377" x2="900" y2="377" stroke="#2a211c" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M890 362 Q882 384 892 404" fill="none" stroke="#ff9a50" strokeWidth="2" opacity="0.55" />
          <path d="M868 460 Q862 520 866 598" fill="none" stroke="#ff9a50" strokeWidth="2" opacity="0.35" />
        </g>

        {/* hammer arm (rotates around the shoulder 900,445) */}
        <g className="smith-arm">
          <line x1="900" y1="445" x2="858" y2="512" stroke="#3a2e27" strokeWidth="26" strokeLinecap="round" />
          <line x1="858" y1="512" x2="783" y2="530" stroke="#c38a62" strokeWidth="19" strokeLinecap="round" />
          <line x1="783" y1="530" x2="672" y2="553" stroke="#6e4527" strokeWidth="8" strokeLinecap="round" />
          <circle cx="780" cy="531" r="11" fill="#b67a54" />
          <rect x="627" y="539" width="46" height="30" rx="4" fill="url(#fz-steel)" stroke="#7d858f" strokeWidth="1.5" />
          <line x1="631" y1="543" x2="669" y2="543" stroke="#a3abb5" strokeWidth="2" opacity="0.7" />
        </g>

        {/* sparks: one set per hammer strike */}
        {SPARK_SETS.map((set) => (
          <g key={set} className={`spark-set spark-set-${set}`}>
            {SPARKS.map((i) => (
              <circle key={i} className="spark" cx="650" cy="566" r={i % 3 === 0 ? 3 : 2} fill={i % 2 ? '#ffd27a' : '#ffffff'} opacity="0" />
            ))}
          </g>
        ))}
      </g>

      {/* ---------- final reveal ---------- */}
      <rect className="forge-dim" x="-200" y="-100" width="1600" height="1000" fill="#050404" opacity="0" />
      <g className="hero-ring" opacity="0">
        <circle r="200" fill="url(#fz-ringGlow)" />
        <circle r="102" fill="none" stroke="#1a1c20" strokeWidth="30" opacity="0.6" transform="translate(6 8)" />
        <circle r="102" fill="none" stroke="url(#fz-band)" strokeWidth="24" />
        <circle r="90" fill="none" stroke="#6c737d" strokeWidth="1.5" opacity="0.8" />
        <circle r="114" fill="none" stroke="#f6f8fb" strokeWidth="1.5" opacity="0.7" />
        <path d="M-82 -60 A102 102 0 0 1 18 -100" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        <path d="M-24 -109 L24 -109 L17 -97 L-17 -97 Z" fill="url(#fz-band)" stroke="#9aa2ac" strokeWidth="1" />
        <g transform="translate(0 -134)">
          <g className="hero-gem">
            <path d="M-30 -4 L-17 -24 L17 -24 L30 -4 L0 26 Z" fill="url(#fz-emerald)" stroke="#c9ffe9" strokeWidth="1.5" />
            <path d="M-17 -24 L-8 -4 L8 -4 L17 -24 M-30 -4 L30 -4 M-8 -4 L0 26 L8 -4" fill="none" stroke="#c9ffe9" strokeWidth="0.9" opacity="0.7" />
            <path d="M-26 -6 L-31 -14 M26 -6 L31 -14 M-14 18 L-20 10 M14 18 L20 10" stroke="#e7ebf0" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
        <g transform="translate(-28 -168)">
          <path className="hero-shine" d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z" fill="#ffffff" opacity="0" />
        </g>
        <g transform="translate(84 46)">
          <path className="hero-shine" d="M0 -12 L2.4 -2.4 L12 0 L2.4 2.4 L0 12 L-2.4 2.4 L-12 0 L-2.4 -2.4 Z" fill="#ffffff" opacity="0" />
        </g>
      </g>
    </svg>
  );
}

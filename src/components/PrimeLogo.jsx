import { motion } from 'framer-motion';

export default function PrimeLogo({ size = 'medium', animated = false }) {
  const sizes = { small: 36, medium: 80, large: 140 };
  const s = sizes[size] || sizes.medium;

  return (
    <motion.div
      className="primelogo"
      style={{ width: s + 20, height: s + 10 }}
      animate={animated ? {
        filter: [
          'drop-shadow(0 0 8px rgba(201,26,37,0.5))',
          'drop-shadow(0 0 20px rgba(201,26,37,0.85))',
          'drop-shadow(0 0 8px rgba(201,26,37,0.5))',
        ],
      } : {}}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 200 180" width={s} height={s * 0.85} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Optimus Prime face outline */}
        <motion.g
          initial={animated ? { scale: 0.6, opacity: 0 } : false}
          animate={animated ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Helm main shape */}
          <path d="M100 12 C70 12 45 30 38 58 C32 80 28 95 26 110 L26 120 C26 128 30 134 36 134 L50 134 C54 134 57 132 58 129 L62 110 C64 96 72 82 86 76 L100 72 L114 76 C128 82 136 96 138 110 L142 129 C143 132 146 134 150 134 L164 134 C170 134 174 128 174 120 L174 110 C172 95 168 80 162 58 C155 30 130 12 100 12Z"
            fill="currentColor" opacity="0.95"/>

          {/* Helmet ridge / fin */}
          <path d="M100 12 L86 42 L100 36 L114 42Z" fill="currentColor"/>

          {/* Faceplate / mask */}
          <path d="M50 72 C60 64 80 58 100 58 C120 58 140 64 150 72 L150 120 L50 120Z"
            fill="var(--bg-card)" opacity="0.35"/>

          {/* Antennae / ear guards */}
          <rect x="18" y="68" width="8" height="44" rx="3" fill="currentColor"/>
          <rect x="174" y="68" width="8" height="44" rx="3" fill="currentColor"/>
          <circle cx="22" cy="64" r="5" fill="var(--prime-red)" opacity="0.9"/>
          <circle cx="178" cy="64" r="5" fill="var(--prime-red)" opacity="0.9"/>

          {/* Eyes — slanted, iconic */}
          <path d="M46 80 L68 86 L66 94 L44 88Z" fill="var(--prime-red)" opacity="0.95"/>
          <path d="M154 80 L132 86 L134 94 L156 88Z" fill="var(--prime-red)" opacity="0.95"/>
          {/* Eye inner glow */}
          <path d="M48 82 L64 87 L63 91 L47 86Z" fill="var(--prime-amber)" opacity="0.7"/>

          {/* Nose / faceplate ridge */}
          <rect x="94" y="90" width="12" height="6" rx="2" fill="var(--prime-blue)" opacity="0.8"/>
          <rect x="97" y="98" width="6" height="14" rx="2" fill="var(--prime-steel)" opacity="0.6"/>

          {/* Mouth plate */}
          <rect x="60" y="114" width="80" height="12" rx="4" fill="var(--prime-steel)" opacity="0.7"/>
          <line x1="68" y1="120" x2="132" y2="120" stroke="var(--prime-red)" strokeWidth="2" opacity="0.6"/>

          {/* Neck / collar */}
          <path d="M58 130 L58 160 L80 160 L100 144 L120 160 L142 160 L142 130Z"
            fill="currentColor" opacity="0.8"/>

          {/* Autobot emblem on forehead */}
          <motion.circle
            cx="100" cy="44" r="8"
            fill="var(--prime-red)"
            animate={animated ? { scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}

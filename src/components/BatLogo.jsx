import { motion } from 'framer-motion';

export default function BatLogo({ size = 'medium', animated = false }) {
  const sizes = { small: 40, medium: 80, large: 150 };
  const s = sizes[size] || sizes.medium;

  return (
    <motion.div
      className={`batlogo ${animated ? 'animated' : ''}`}
      style={{ width: s + 40, height: s + 40 }}
      animate={animated ? {
        filter: ['drop-shadow(0 0 10px rgba(0,180,216,0.5))', 'drop-shadow(0 0 25px rgba(0,180,216,0.8))', 'drop-shadow(0 0 10px rgba(0,180,216,0.5))'],
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 60" width={s} height={s * 0.6}>
        <motion.path
          d="M 50 5 C 48 15, 40 20, 35 22 C 32 23, 30 22, 28 25 C 26 28, 24 32, 22 38 C 20 42, 18 42, 16 40 C 14 38, 14 35, 15 33 C 16 31, 18 30, 20 30 C 22 30, 22 32, 22 32 C 22 32, 25 28, 28 26 C 30 24, 32 25, 34 26 C 36 27, 38 28, 40 28 C 42 28, 44 27, 46 25 C 48 23, 50 22, 50 22 C 50 22, 52 23, 54 25 C 56 27, 58 28, 60 28 C 62 28, 64 27, 66 26 C 68 25, 70 24, 72 26 C 75 28, 78 32, 78 32 C 78 32, 80 31, 82 33 C 83 35, 83 38, 81 40 C 79 42, 77 42, 75 38 C 73 32, 71 28, 69 25 C 67 22, 65 23, 62 22 C 57 20, 52 15, 50 5 Z"
          fill="currentColor"
          className="bat-path"
          initial={animated ? { scaleY: 0, scaleX: 0.5, transformOrigin: 'center' } : false}
          animate={animated ? { scaleY: 1, scaleX: 1 } : false}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
}

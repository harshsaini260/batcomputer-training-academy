import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import {
  Home, Dumbbell, Utensils, Brain, BookOpen, TrendingUp,
  Menu, X, Flame, Trophy, Settings, LogOut, Music2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PrimeLogo from '../components/PrimeLogo';
import ThemeAudio from '../components/ThemeAudio';
import { TRAINING_PHASES } from '../data/trainingData';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/workout', icon: Dumbbell, label: 'Train' },
  { path: '/nutrition', icon: Utensils, label: 'Fuel' },
  { path: '/brain', icon: Brain, label: 'Mind' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' },
];

export default function Layout({ children }) {
  const { state } = useApp();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const streak = useMemo(() => calculateStreak(state.workouts), [state.workouts]);
  const currentLevel = useMemo(() => ({
    level: state.totalXP ? Math.floor(state.totalXP / 500) + 1 : 1
  }), [state.totalXP]);

  const phaseLabel = state.settings.user?.phase
    ? (TRAINING_PHASES[state.settings.user.phase]?.label || 'Recruit')
    : 'Autobot';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Top Header — glass morphism */}
      <motion.header
        className={`app-header ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          background: scrolled
            ? 'var(--glass-fill-strong)'
            : 'var(--glass-fill)',
          backdropFilter: scrolled
            ? 'blur(var(--blur-lg)) saturate(180%)'
            : 'blur(var(--blur-md)) saturate(180%)',
          WebkitBackdropFilter: scrolled
            ? 'blur(var(--blur-lg)) saturate(180%)'
            : 'blur(var(--blur-md)) saturate(180%)',
          borderBottom: '1px solid var(--separator)',
          zIndex: 100,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
        }}
      >
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              padding: 8,
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="header-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <PrimeLogo size="small" animated />
          </Link>
        </div>

        <div className="header-center" style={{
          flex: 1,
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>{getTimeOfDay()}</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginLeft: 8,
            letterSpacing: '-0.01em',
          }}>{state.settings.user?.name?.split(' ')[0] || 'Autobot'}</span>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--prime-red)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>🔥{streak}</span>
          <span className="badge badge-red" style={{ fontSize: 11, padding: '2px 8px' }}>
            LVL{currentLevel.level}
          </span>
          <ThemeAudio />
        </div>
      </motion.header>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }}
            />
            <motion.aside
              className="side-menu"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 280,
                background: 'var(--bg-elevated)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                borderRight: '1px solid var(--separator)',
                zIndex: 200,
                padding: '24px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PrimeLogo size="small" animated />
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: 'var(--text-primary)',
                      lineHeight: 1.1,
                    }}>Autobot Arc</h2>
                    <p style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>Prime Training System v1.0</p>
                  </div>
                </div>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 'var(--r-md)',
                        color: isActive ? 'var(--prime-red)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--prime-red-soft)' : 'transparent',
                        textDecoration: 'none',
                        fontSize: 16,
                        fontWeight: isActive ? 600 : 500,
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div style={{
                borderTop: '1px solid var(--separator)',
                paddingTop: 16,
                marginTop: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--prime-red), var(--prime-blue))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>{state.settings.user?.name?.charAt(0) || 'A'}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{state.settings.user?.name || 'Autobot'}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{phaseLabel}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Flame size={15} />{streak}🔥
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Trophy size={15} />{state.achievements?.length || 0}
                  </span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'var(--glass-fill-strong)',
        backdropFilter: 'blur(var(--blur-lg)) saturate(180%)',
        WebkitBackdropFilter: 'blur(var(--blur-lg)) saturate(180%)',
        borderTop: '1px solid var(--separator)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                flex: 1,
                padding: '6px 0',
                color: isActive ? 'var(--prime-red)' : 'var(--text-tertiary)',
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomIndicator"
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: 32,
                    height: 3,
                    borderRadius: 2,
                    background: 'var(--prime-red)',
                  }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: '0.01em' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return '🌙 Night';
  if (h < 12) return '☀️ Morning';
  if (h < 17) return '🌤 Afternoon';
  if (h < 21) return '🌆 Evening';
  return '🌙 Night';
}

function calculateStreak(workouts) {
  if (!workouts || !workouts.length) return 0;
  const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWorkout = new Date(sorted[0].date);
  lastWorkout.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const d1 = new Date(sorted[i].date);
    const d2 = new Date(sorted[i + 1].date);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diff = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}


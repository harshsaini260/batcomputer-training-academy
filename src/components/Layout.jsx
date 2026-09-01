import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Home, Dumbbell, Utensils, Brain, BookOpen, TrendingUp,
  Menu, X, Flame, Trophy, Settings, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BatLogo from '../components/BatLogo';
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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const streak = calculateStreak(state.workouts);
  const currentLevel = { level: state.totalXP ? Math.floor(state.totalXP / 500) + 1 : 1 };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Top Header */}
      <motion.header
        className={`app-header ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="header-logo">
            <BatLogo size="small" animated />
          </Link>
        </div>

        <div className="header-center">
          <span className="header-greeting">
            {getTimeOfDay()}
          </span>
          <span className="header-user">
            {state.settings.user?.name?.split(' ')[0] || 'Agent'}
          </span>
        </div>

        <div className="header-right">
          <div className="header-stats">
            <span className="header-streak">🔥{streak}</span>
            <span className="header-level">LVL{currentLevel.level}</span>
          </div>
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
            />
            <motion.aside
              className="side-menu"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="side-menu-header">
                <BatLogo size="medium" animated />
                <h2>Batcomputer</h2>
                <p className="side-menu-subtitle">Training Academy v1.0</p>
              </div>

              <nav className="side-nav">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {isActive && <motion.div className="nav-indicator" layoutId="navIndicator" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="side-menu-footer">
                <div className="menu-user">
                  <div className="menu-avatar">
                    {state.settings.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="menu-user-name">{state.settings.user?.name || 'Agent'}</p>
                    <p className="menu-user-phase">Recruit Phase</p>
                  </div>
                </div>
                <div className="menu-divider" />
                <div className="menu-stats">
                  <div className="menu-stat">
                    <Flame size={16} />
                    <span>{streak} day streak</span>
                  </div>
                  <div className="menu-stat">
                    <Trophy size={16} />
                    <span>{state.achievements?.length || 0} achievements</span>
                  </div>
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
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
              {isActive && <motion.div className="bottom-indicator" layoutId="bottomIndicator" />}
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

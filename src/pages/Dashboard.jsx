import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS, MOTIVATION_LEVELS, TRAINING_PHASES, PRIME_QUOTES } from '../data/trainingData';
import { calculateLevel, calculateStreak } from '../context/AppContext';
import PrimeLogo from '../components/PrimeLogo';
import {
  Flame, Dumbbell, Clock, Brain, TrendingUp,
  Award, ChevronRight, Target, Calendar, Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { state } = useApp();
  const { workouts, weightLog, journalEntries, brainScores, achievements, settings, totalXP = 0 } = state;
  const level = calculateLevel(totalXP);
  const streak = calculateStreak(workouts);

  const stats = useMemo(() => {
    const thisWeek = workouts.filter(w => {
      const d = new Date(w.date);
      const now = new Date();
      return (now - d) < 7 * 24 * 60 * 60 * 1000;
    });
    const thisMonth = workouts.filter(w => {
      const d = new Date(w.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const totalCaloriesWeek = thisWeek.reduce((s, w) => s + (w.calories || 0), 0);
    const totalCaloriesMonth = thisMonth.reduce((s, w) => s + (w.calories || 0), 0);
    const totalDurationWeek = thisWeek.reduce((s, w) => s + (w.duration || 0), 0);
    const avgBrainScore = brainScores.length > 0
      ? Math.round(brainScores.reduce((s, b) => s + b.percentage, 0) / brainScores.length)
      : 0;

    const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : settings.startWeight;
    const weightLost = (settings.startWeight || 59) - currentWeight;
    const weightProgress = settings.targetWeight ? ((settings.startWeight - settings.targetWeight) / (settings.startWeight || 59)) * 100 : 0;

    return {
      totalWorkouts: workouts.length,
      weekWorkouts: thisWeek.length,
      monthWorkouts: thisMonth.length,
      totalCaloriesWeek,
      totalCaloriesMonth,
      totalDurationWeek,
      avgBrainScore,
      currentWeight,
      weightLost,
      weightProgress: Math.min(weightProgress, 100),
      journalStreak: 0,
      journalCount: journalEntries.length,
      brainCount: brainScores.length,
      achievementCount: achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
    };
  }, [workouts, weightLog, journalEntries, brainScores, achievements, settings]);

  const motivation = useMemo(() => {
    const idx = Math.min(Math.floor(stats.totalWorkouts / 5), MOTIVATION_LEVELS.length - 1);
    return MOTIVATION_LEVELS[Math.max(idx, 0)];
  }, [stats.totalWorkouts]);

  const recentAchievements = useMemo(() =>
    [...achievements].reverse().slice(0, 3),
    [achievements]
  );

  const recentWorkouts = useMemo(() =>
    [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3),
    [workouts]
  );

  const primeQuote = useMemo(() => {
    const opts = PRIME_QUOTES || [];
    return opts[Math.floor(Math.random() * opts.length)];
  }, []);

  const phaseLabel = (settings.user?.phase ? TRAINING_PHASES[settings.user.phase]?.label : 'Autobot') || 'Autobot';

  return (
    <div className="dashboard page-container">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-top">
          <div>
            <p className="greeting">Good {getTimeOfDay()}, {settings.user?.name?.split(' ')[0] || 'Autobot'}</p>
            <h1 className="glow-text" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em' }}>
              {phaseLabel}
            </h1>
          </div>
          <PrimeLogo size="small" animated />
        </div>
        {primeQuote?.text && (
          <p className="mission-quote">
            "{primeQuote.text}" — <span style={{ color: 'var(--prime-red)', fontWeight: 600 }}>{primeQuote.source}</span>
          </p>
        )}
      </motion.div>

      {/* XP & Level Bar */}
      <motion.div
        className="xp-card card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="xp-header">
          <div className="level-info">
            <span className="level-badge" style={{
              background: 'linear-gradient(135deg, var(--prime-red), var(--prime-red-deep))',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 'var(--r-sm)',
              letterSpacing: '0.04em',
            }}>LVL {level.level}</span>
            <span className="level-title">{phaseLabel}</span>
          </div>
          <div className="xp-info">
            <span className="xp-current" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--prime-red)' }}>{level.xp} / {level.xpRequired} XP</span>
            <span className="xp-next" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>→ Level {level.level + 1}</span>
          </div>
        </div>
        <div className="progress-bar xp-bar">
          <div className="progress-fill" style={{ width: `${level.progress * 100}%` }} />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {[
          { icon: <Flame size={18} />, label: 'Day Streak', value: `${streak}🔥`, color: 'red' },
          { icon: <Dumbbell size={18} />, label: 'This Week', value: `${stats.weekWorkouts} workouts`, color: 'blue' },
          { icon: <Zap size={18} />, label: 'Week Calories', value: `${stats.totalCaloriesWeek}`, color: 'amber' },
          { icon: <Clock size={18} />, label: 'Week Time', value: `${formatTime(stats.totalDurationWeek)}`, color: 'purple' },
          { icon: <Brain size={18} />, label: 'Brain Avg', value: `${stats.avgBrainScore}%`, color: 'green' },
          { icon: <TrendingUp size={18} />, label: 'Weight Lost', value: `${stats.weightLost.toFixed(1)} kg`, color: 'red' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`stat-card card stat-${stat.color}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
          >
            <span className="stat-icon">{stat.icon}</span>
            <span className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{stat.value}</span>
            <span className="stat-label" style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Today's Plan */}
        <motion.div
          className="card plan-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} /> Today's Mission
            </h3>
            <span className="badge badge-blue">{getTodaySchedule()?.focus || 'Rest Day'}</span>
          </div>
          {getTodaySchedule()?.workout ? (
            <div className="plan-content">
              <p className="plan-day" style={{ fontSize: 15, color: 'var(--text-secondary)', margin: '8px 0' }}>{getTodayScheduleName()}</p>
              <Link to="/workout" className="btn btn-primary plan-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Dumbbell size={16} /> Start Training
              </Link>
            </div>
          ) : (
            <div className="plan-rest" style={{ textAlign: 'center', padding: '16px 0' }}>
              <span className="rest-icon" style={{ fontSize: 36, display: 'block' }}>🤖</span>
              <p style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>Recovery Mode</p>
              <span className="rest-desc" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Focus on stretching, journaling, and meal prep</span>
              <Link to="/nutrition" className="btn btn-secondary plan-btn" style={{ marginTop: 12 }}>Review Nutrition</Link>
            </div>
          )}
        </motion.div>

        {/* Motivation */}
        <motion.div
          className="card motivation-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, var(--prime-red-soft), var(--prime-blue-soft))',
            border: '1px solid var(--border-glow)',
          }}
        >
          <div className="card-header">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} /> Mission Status
            </h3>
          </div>
          <div className="motivation-icon" style={{ fontSize: 40, textAlign: 'center', margin: '12px 0' }}>{motivation.icon}</div>
          <p className="motivation-level" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{motivation.level}</p>
          <p className="motivation-message" style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', marginTop: 4 }}>"{motivation.message}"</p>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          className="card workouts-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dumbbell size={18} /> Recent Missions
            </h3>
            <Link to="/workout" className="link" style={{ fontSize: 13, color: 'var(--prime-red)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          {recentWorkouts.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: 'var(--text-tertiary)', marginBottom: 12 }}>No workouts logged yet</p>
              <Link to="/workout" className="btn btn-primary">Start First Workout</Link>
            </div>
          ) : (
            <div className="workout-list">
              {recentWorkouts.map((w, i) => (
                <div key={w.id} className="workout-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < recentWorkouts.length - 1 ? '1px solid var(--separator)' : 'none',
                }}>
                  <div className="workout-info">
                    <span className="workout-name" style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</span>
                    <span className="workout-meta" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formatDate(w.date)} • {w.duration || 0}min</span>
                  </div>
                  <div className="workout-stats" style={{ display: 'flex', gap: 6 }}>
                    {w.calories && <span className="badge badge-amber">{w.calories} cal</span>}
                    {w.isPR && <span className="badge badge-green">PR</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          className="card achievements-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-header">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} /> Achievements
            </h3>
            <span className="achievement-count" style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 600 }}>
              {stats.achievementCount}/{stats.totalAchievements}
            </span>
          </div>
          {achievements.length === 0 ? (
            <div className="achievement-progress" style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ color: 'var(--text-tertiary)', marginBottom: 12 }}>Complete workouts to unlock achievements</p>
              <div className="achievement-preview" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                {ACHIEVEMENTS.slice(0, 3).map(a => (
                  <div key={a.id} className="achievement-locked" style={{ opacity: 0.4, fontSize: 28 }}>
                    <span>{a.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="achievement-list">
              {recentAchievements.map(a => (
                <motion.div
                  key={a.id}
                  className="achievement-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--separator)',
                  }}
                >
                  <span className="achievement-icon" style={{ fontSize: 24 }}>{a.icon}</span>
                  <div className="achievement-info" style={{ flex: 1 }}>
                    <span className="achievement-name" style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</span>
                    <span className="achievement-desc" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{a.description}</span>
                  </div>
                  <span className={`badge badge-${getRarityColor(a.rarity)}`}>{a.rarity}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="quick-actions"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          marginTop: 20,
        }}
      >
        {[
          { to: '/workout', icon: <Dumbbell size={22} />, label: 'Train' },
          { to: '/nutrition', icon: '🥗', label: 'Fuel' },
          { to: '/brain', icon: <Brain size={22} />, label: 'Mind' },
          { to: '/journal', icon: <BookOpen size={22} />, label: 'Journal' },
          { to: '/progress', icon: <TrendingUp size={22} />, label: 'Progress' },
        ].map(action => (
          <Link key={action.to} to={action.to} className="action-btn" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '16px 8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--r-lg)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}>
            {typeof action.icon === 'string' ? <span style={{ fontSize: 24 }}>{action.icon}</span> : action.icon}
            <span>{action.label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

function getRandomQuote() {
  if (!PRIME_QUOTES || PRIME_QUOTES.length === 0) return 'Freedom is the right of all sentient beings.';
  const quotes = PRIME_QUOTES;
  return quotes[Math.floor(Math.random() * quotes.length)].text;
}

function getTodaySchedule() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = days[new Date().getDay()];
  const schedule = {
    MON: { workout: true, focus: 'Push/Pull Strength' },
    TUE: { workout: true, focus: 'Legs & Core' },
    WED: { workout: false, focus: 'Active Recovery' },
    THU: { workout: true, focus: 'Upper Body Power' },
    FRI: { workout: true, focus: 'Full Body / Cardio' },
    SAT: { workout: false, focus: 'Active Recovery' },
    SUN: { workout: false, focus: 'Rest & Journal' },
  };
  return schedule[today];
}

function getTodayScheduleName() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = days[new Date().getDay()];
  const names = {
    MON: 'Recruit Day 1 – Upper Push Power',
    TUE: 'Recruit Day 3 – Leg Power',
    WED: 'Recovery Day',
    THU: 'Recruit Day 2 – Upper Pull Power',
    FRI: 'Recruit Day 5 – Full Body',
    SAT: 'Recovery Day',
    SUN: 'Rest Day',
  };
  return names[today];
}

function formatTime(minutes) {
  if (!minutes) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getRarityColor(rarity) {
  const colors = { common: 'gray', uncommon: 'blue', rare: 'amber', epic: 'red', legendary: 'purple' };
  return colors[rarity] || 'gray';
}

function Zap(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS, MOTIVATION_LEVELS, TRAINING_PHASES } from '../data/trainingData';
import { calculateLevel, calculateStreak } from '../context/AppContext';
import BatLogo from '../components/BatLogo';
import {
  Flame, Zap, Brain, BookOpen, Dumbbell, TrendingUp,
  Award, ChevronRight, Target, Calendar, Trophy, Clock
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
    const idx = Math.min(Math.floor(stats.totalWorkouts / 10), MOTIVATION_LEVELS.length - 1);
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

  return (
    <div className="dashboard page-container">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-top">
          <div>
            <p className="greeting">Good {getTimeOfDay()}, Agent</p>
            <h1 className="glow-text">
              {settings.user?.name || 'Harsh Saini'}
            </h1>
          </div>
          <BatLogo size="small" animated />
        </div>
        <p className="mission-quote">
          "{getRandomQuote()}"
        </p>
      </motion.div>

      {/* XP & Level Bar */}
      <motion.div
        className="xp-card card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="xp-header">
          <div className="level-info">
            <span className="level-badge">LVL {level.level}</span>
            <span className="level-title">Recruit</span>
          </div>
          <div className="xp-info">
            <span className="xp-current">{level.xp} / {level.xpRequired} XP</span>
            <span className="xp-next">→ Level {level.level + 1}</span>
          </div>
        </div>
        <div className="progress-bar xp-bar">
          <div className="progress-fill" style={{ width: `${level.progress * 100}%` }} />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {[
          { icon: <Flame size={20} />, label: 'Day Streak', value: `${streak}🔥`, color: 'orange' },
          { icon: <Dumbbell size={20} />, label: 'This Week', value: `${stats.weekWorkouts} workouts`, color: 'blue' },
          { icon: <Zap size={20} />, label: 'Week Calories', value: `${stats.totalCaloriesWeek}`, color: 'yellow' },
          { icon: <Clock size={20} />, label: 'Week Time', value: `${formatTime(stats.totalDurationWeek)}`, color: 'purple' },
          { icon: <Brain size={20} />, label: 'Brain Avg', value: `${stats.avgBrainScore}%`, color: 'green' },
          { icon: <TrendingUp size={20} />, label: 'Weight Lost', value: `${stats.weightLost.toFixed(1)} kg`, color: 'cyan' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`stat-card card stat-${stat.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <span className="stat-icon">{stat.icon}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Today's Plan */}
        <motion.div
          className="card plan-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h3><Calendar size={18} /> Today's Mission</h3>
            <span className="badge badge-blue">{getTodaySchedule()?.focus || 'Rest Day'}</span>
          </div>
          {getTodaySchedule()?.workout ? (
            <div className="plan-content">
              <p className="plan-day">{getTodayScheduleName()}</p>
              <Link to="/workout" className="btn btn-glow plan-btn">
                <Dumbbell size={18} /> Start Training
              </Link>
            </div>
          ) : (
            <div className="plan-rest">
              <span className="rest-icon">🧘</span>
              <p>Recovery Day</p>
              <span className="rest-desc">Focus on stretching, journaling, and meal prep</span>
              <Link to="/nutrition" className="btn btn-ghost plan-btn">Review Nutrition Plan</Link>
            </div>
          )}
        </motion.div>

        {/* Motivation */}
        <motion.div
          className="card motivation-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h3><Target size={18} /> Mission Status</h3>
          </div>
          <div className="motivation-icon">{motivation.icon}</div>
          <p className="motivation-level">{motivation.level}</p>
          <p className="motivation-message">"{motivation.message}"</p>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          className="card workouts-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <h3><Dumbbell size={18} /> Recent Missions</h3>
            <Link to="/workout" className="link">View All</Link>
          </div>
          {recentWorkouts.length === 0 ? (
            <div className="empty-state">
              <p>No workouts logged yet</p>
              <Link to="/workout" className="btn btn-primary">Start First Workout</Link>
            </div>
          ) : (
            <div className="workout-list">
              {recentWorkouts.map((w, i) => (
                <div key={w.id} className="workout-item">
                  <div className="workout-info">
                    <span className="workout-name">{w.name}</span>
                    <span className="workout-meta">{formatDate(w.date)} • {w.duration || 0}min</span>
                  </div>
                  <div className="workout-stats">
                    {w.calories && <span className="badge badge-yellow">{w.calories} cal</span>}
                    {w.isPR && <span className="badge badge-green">PR</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          className="card achievements-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="card-header">
            <h3><Trophy size={18} /> Achievements</h3>
            <span className="achievement-count">{stats.achievementCount}/{stats.totalAchievements}</span>
          </div>
          {achievements.length === 0 ? (
            <div className="achievement-progress">
              <p>Complete workouts to unlock achievements</p>
              <div className="achievement-preview">
                {ACHIEVEMENTS.slice(0, 3).map(a => (
                  <div key={a.id} className="achievement-locked">
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="achievement-icon">{a.icon}</span>
                  <div className="achievement-info">
                    <span className="achievement-name">{a.name}</span>
                    <span className="achievement-desc">{a.description}</span>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Link to="/workout" className="action-btn">
          <Dumbbell /> <span>Workout</span>
        </Link>
        <Link to="/nutrition" className="action-btn">
          <span>🥗</span> <span>Nutrition</span>
        </Link>
        <Link to="/brain" className="action-btn">
          <Brain /> <span>Brain</span>
        </Link>
        <Link to="/journal" className="action-btn">
          <BookOpen /> <span>Journal</span>
        </Link>
        <Link to="/progress" className="action-btn">
          <TrendingUp /> <span>Progress</span>
        </Link>
      </motion.div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return 'evening, Agent';
  if (h < 12) return 'morning, Agent';
  if (h < 17) return 'afternoon, Agent';
  if (h < 21) return 'evening, Agent';
  return 'night, Agent';
}

function getRandomQuote() {
  const quotes = [
    "It's not who I am underneath, but what I DO that defines me.",
    "Why do we fall? So we can learn to pick ourselves up.",
    "The night is darkest just before the dawn.",
    "I am vengeance. I am the night. I am Batman.",
    "All men have limits. I ignore mine.",
    "The body achieves what the mind believes.",
    "You either die a hero or you live long enough to see yourself become the villain.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
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
    MON: 'Agent Day 1 – Upper Push Power',
    TUE: 'Agent Day 3 – Leg Power',
    WED: 'Recovery Day',
    THU: 'Agent Day 2 – Upper Pull Power',
    FRI: 'Agent Day 5 – Full Body Combat',
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
  const colors = { common: 'blue', uncommon: 'green', rare: 'yellow', epic: 'red', legendary: 'purple' };
  return colors[rarity] || 'blue';
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Award, Flame, Dumbbell, Brain, BookOpen, Minus, Plus, Trash2 } from 'lucide-react';
import './Progress.css';

export default function Progress() {
  const { state, dispatch } = useApp();
  const [selectedRange, setSelectedRange] = useState('month');

  const weightData = state.weightLog
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weight,
      fullDate: w.date,
    }));

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const filteredWeight = weightData.filter(w => new Date(w.fullDate) >= monthAgo);

  const chartData = selectedRange === 'month' ? filteredWeight : weightData;

  const recentWeight = state.weightLog.length > 0 ? state.weightLog[state.weightLog.length - 1].weight : null;
  const startWeight = state.settings.startWeight || 59;
  const targetWeight = state.settings.targetWeight || 52;
  const weightLost = startWeight - (recentWeight || startWeight);
  const weightProgress = targetWeight ? ((startWeight - targetWeight) / (startWeight - targetWeight + 0.001)) : 0;

  const weeklyData = getWeeklyStats();

  const totalWorkouts = state.workouts.length;
  const totalCalories = state.workouts.reduce((s, w) => s + (w.calories || 0), 0);
  const totalMinutes = state.workouts.reduce((s, w) => s + (w.duration || 0), 0);
  const avgBrainScore = state.brainScores.length > 0
    ? Math.round(state.brainScores.reduce((s, b) => s + b.percentage, 0) / state.brainScores.length)
    : 0;

  function getWeeklyStats() {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const weekWorkouts = state.workouts.filter(wo => {
        const d = new Date(wo.date);
        return d >= weekStart && d < weekEnd;
      });
      weeks.push({
        week: w === 0 ? 'This Week' : w === 1 ? 'Last Week' : `${w} weeks ago`,
        workouts: weekWorkouts.length,
        calories: weekWorkouts.reduce((s, wo) => s + (wo.calories || 0), 0),
        minutes: weekWorkouts.reduce((s, wo) => s + (wo.duration || 0), 0),
      });
    }
    return weeks;
  }

  const logWeight = () => {
    const weight = prompt('Enter current weight (kg):', recentWeight || state.settings.startWeight || '59');
    if (weight && !isNaN(parseFloat(weight))) {
      dispatch({
        type: 'LOG_WEIGHT',
        payload: { weight: parseFloat(weight) },
      });
    }
  };

  return (
    <div className="progress-page page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title glow-text">Progress Tracker</h1>
        <p className="page-subtitle">Data doesn't lie. Track every metric.</p>
      </motion.div>

      {/* Weight Tracker */}
      <motion.div
        className="card weight-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="wc-header">
          <h3><TrendingDown size={18} /> Weight Journey</h3>
          <button className="btn btn-ghost" onClick={logWeight}>
            <Plus size={16} /> Log Weight
          </button>
        </div>

        <div className="weight-milestones">
          <div className="milestone">
            <span className="m-label">Start</span>
            <span className="m-value">{startWeight} kg</span>
          </div>
          <div className="milestone-arrow">
            <TrendingDown size={20} color="var(--green-success)" />
          </div>
          <div className="milestone current">
            <span className="m-label">Current</span>
            <span className="m-value">{recentWeight || '—'} kg</span>
          </div>
          <div className="milestone-arrow">
            <TrendingDown size={20} color="var(--yellow-bat)" />
          </div>
          <div className="milestone target">
            <span className="m-label">Target</span>
            <span className="m-value">{targetWeight} kg</span>
          </div>
        </div>

        {chartData.length > 1 && (
          <div className="weight-chart">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#4a5568" fontSize={11} fontFamily="Share Tech Mono" />
                <YAxis domain={[targetWeight - 2, startWeight + 2]} stroke="#4a5568" fontSize={11} fontFamily="Share Tech Mono" />
                <Tooltip
                  contentStyle={{ background: '#11161d', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '8px' }}
                  labelStyle={{ color: '#8b9bb4' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#00b4d8" strokeWidth={3} dot={{ fill: '#00b4d8', r: 4 }} activeDot={{ r: 6, fill: '#f5c542' }} />
                <Line type="monotone" dataKey="target" data={chartData.map(d => ({ ...d, target: targetWeight }))} stroke="#ef233c" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="weight-loss-progress">
          <span className="wlp-label">Weight Loss</span>
          <span className="wlp-value">{weightLost.toFixed(1)} kg lost</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min((weightLost / (startWeight - targetWeight)) * 100, 100)}%` }} />
          </div>
          <span className="wlp-remaining">
            {Math.max(startWeight - targetWeight - weightLost, 0).toFixed(1)} kg to go
          </span>
        </div>

        {/* Weight Log */}
        {state.weightLog.length > 0 && (
          <div className="weight-log-list">
            <h4>Recent Measurements</h4>
            {[...state.weightLog].reverse().slice(0, 5).map((w, i) => (
              <div key={w.id} className="weight-log-item">
                <span className="wl-weight">{w.weight} kg</span>
                <span className="wl-date">{formatDate(w.date)}</span>
                {i > 0 && state.weightLog[state.weightLog.length - 1 - i]?.weight && (
                  <span className={`wl-diff ${w.weight < state.weightLog[state.weightLog.length - 1 - i].weight ? 'down' : 'up'}`}>
                    {w.weight < state.weightLog[state.weightLog.length - 1 - i].weight ? '↓' : '↑'}
                    {Math.abs(w.weight - state.weightLog[state.weightLog.length - 1 - i].weight).toFixed(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="progress-stats-grid">
        {[
          { icon: <Dumbbell size={20} />, label: 'Total Workouts', value: totalWorkouts, color: '#00b4d8' },
          { icon: <Flame size={20} />, label: 'Calories Burned', value: totalCalories.toLocaleString(), color: '#ef233c' },
          { icon: <Calendar size={20} />, label: 'Training Time', value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, color: '#f5c542' },
          { icon: <Brain size={20} />, label: 'Brain Avg', value: `${avgBrainScore}%`, color: '#7b2cbf' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="card progress-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <span className="ps-icon" style={{ color: stat.color }}>{stat.icon}</span>
            <span className="ps-value">{stat.value}</span>
            <span className="ps-label">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        className="card weekly-chart-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="week" stroke="#4a5568" fontSize={11} fontFamily="Share Tech Mono" />
            <YAxis stroke="#4a5568" fontSize={11} fontFamily="Share Tech Mono" />
            <Tooltip
              contentStyle={{ background: '#11161d', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '8px' }}
            />
            <Bar dataKey="workouts" fill="#00b4d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Journal Mood Chart */}
      {state.journalEntries.length > 2 && (
        <motion.div
          className="card mood-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Mood & Energy Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[...state.journalEntries].reverse().slice(0, 14).map(e => ({
              date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              mood: e.mood,
              energy: e.energy,
            }))}>
              <XAxis dataKey="date" stroke="#4a5568" fontSize={10} fontFamily="Share Tech Mono" />
              <YAxis domain={[0, 10]} stroke="#4a5568" fontSize={10} fontFamily="Share Tech Mono" />
              <Tooltip contentStyle={{ background: '#11161d', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="mood" stroke="#f5c542" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="energy" stroke="#00b4d8" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

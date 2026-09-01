import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { WORKOUT_PLANS } from '../data/trainingData';
import {
  Play, Pause, RotateCcw, Check, ChevronRight, ChevronLeft,
  Flame, Clock, Dumbbell, Timer, SkipForward, AlertTriangle
} from 'lucide-react';
import './Workout.css';

const EXERCISE_EMOJIS = {
  'push-up': '💪', 'dip': '💪', 'plank': '🔥', 'squat': '🦵', 'lunge': '🦵',
  'bridge': '🍑', 'crunch': '🔥', 'row': '🏋️', 'burpee': '💥', 'climber': '⛰️',
  'default': '⚡'
};

export default function Workout() {
  const { state, dispatch } = useApp();
  const [phase, setPhase] = useState(state.phase || 'BEGINNER');
  const [selectedDay, setSelectedDay] = useState(1);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [workoutData, setWorkoutData] = useState({ calories: 0, duration: 0, exercises: [] });

  const plan = WORKOUT_PLANS[phase];
  const dayPlan = plan?.days[selectedDay];

  // Timer
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest timer
  useEffect(() => {
    let interval;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft(t => {
          if (t <= 1) {
            setIsResting(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setWorkoutActive(true);
    setCurrentExercise(0);
    setCurrentSet(1);
    setIsResting(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setWorkoutStartTime(new Date());
    setWorkoutData({ calories: 0, duration: 0, exercises: [] });
  };

  const completeExercise = () => {
    const exercise = dayPlan?.exercises[currentExercise];
    const exerciseData = {
      name: exercise.name,
      sets: currentSet,
      totalSets: exercise.sets,
      completed: true,
    };

    setWorkoutData(prev => ({
      ...prev,
      exercises: [...prev.exercises, exerciseData],
    }));

    if (currentExercise < (dayPlan?.exercises.length || 0) - 1) {
      // Move to next exercise
      const restSecs = parseInt(exercise.rest) || 60;
      setRestTimeLeft(restSecs);
      setIsResting(true);
      setCurrentExercise(e => e + 1);
      setCurrentSet(1);
    } else {
      // Workout complete
      finishWorkout();
    }
  };

  const completeSet = () => {
    if (currentSet < dayPlan?.exercises[currentExercise].sets) {
      setCurrentSet(s => s + 1);
      const restSecs = 60;
      setRestTimeLeft(restSecs);
      setIsResting(true);
    } else {
      completeExercise();
    }
  };

  const finishWorkout = () => {
    const duration = Math.floor(timerSeconds / 60) || Math.floor((Date.now() - workoutStartTime) / 60000) || 30;
    const calories = Math.floor(duration * 7 + (workoutData.exercises.length * 15));
    setWorkoutData(prev => ({ ...prev, calories, duration }));
    setIsTimerRunning(false);
    setShowCompletion(true);
  };

  const saveWorkout = () => {
    dispatch({
      type: 'END_WORKOUT',
      payload: {
        name: dayPlan?.name || 'Custom Workout',
        type: dayPlan?.type || 'strength',
        phase,
        day: selectedDay,
        duration: workoutData.duration,
        calories: workoutData.calories,
        exercises: workoutData.exercises,
      },
    });
    resetWorkout();
  };

  const resetWorkout = () => {
    setWorkoutActive(false);
    setShowCompletion(false);
    setCurrentExercise(0);
    setCurrentSet(1);
    setIsResting(false);
    setRestTimeLeft(0);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  if (!plan) {
    return <div className="workout-page page-container"><p>Loading...</p></div>;
  }

  // Onboarding / Plan Selection View
  if (!workoutActive && !showCompletion) {
    return (
      <div className="workout-page page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title glow-text">Training Protocol</h1>
          <p className="page-subtitle">{plan.name}</p>
        </motion.div>

        {/* Phase selector */}
        <motion.div
          className="phase-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {Object.entries(WORKOUT_PLANS).map(([key, p]) => (
            <button
              key={key}
              className={`phase-btn ${phase === key ? 'active' : ''}`}
              onClick={() => { setPhase(key); setSelectedDay(1); }}
            >
              <span className="phase-name">{p.name}</span>
              <span className="phase-desc">{p.frequency}</span>
            </button>
          ))}
        </motion.div>

        {/* Day selector */}
        <motion.div
          className="day-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {Object.entries(plan.days).map(([dayNum, day]) => (
            <button
              key={dayNum}
              className={`day-btn ${selectedDay === parseInt(dayNum) ? 'active' : ''}`}
              onClick={() => setSelectedDay(parseInt(dayNum))}
            >
              <span className="day-number">D{dayNum}</span>
              <span className="day-name">{day.name.split('–')[0]?.trim() || day.name}</span>
              <span className="day-focus">{day.focus}</span>
            </button>
          ))}
        </motion.div>

        {/* Day Detail */}
        {dayPlan && (
          <motion.div
            className="day-detail card"
            key={selectedDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="day-detail-header">
              <div>
                <h3>{dayPlan.name}</h3>
                <div className="day-meta">
                  <span className="badge badge-blue">{dayPlan.type}</span>
                  <span>{dayPlan.focus}</span>
                </div>
              </div>
            </div>

            <div className="warmup-cooldown">
              <div className="wc-item">
                <span className="wc-label">🔥 Warm-up</span>
                <span className="wc-text">{dayPlan.warmup}</span>
              </div>
              <div className="wc-item">
                <span className="wc-label">❄️ Cool-down</span>
                <span className="wc-text">{dayPlan.cooldown}</span>
              </div>
            </div>

            <div className="exercise-list">
              {dayPlan.exercises.map((ex, i) => (
                <motion.div
                  key={i}
                  className="exercise-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <div className="exercise-header">
                    <span className="exercise-num">{i + 1}</span>
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-equip">{ex.equipment}</span>
                  </div>
                  <div className="exercise-specs">
                    <span className="spec"><Dumbbell size={14} /> {ex.sets} sets</span>
                    <span className="spec"><Repeat size={14} /> {ex.reps}</span>
                    <span className="spec"><Clock size={14} /> Rest: {ex.rest}</span>
                  </div>
                  {ex.note && <p className="exercise-note">💡 {ex.note}</p>}
                </motion.div>
              ))}
            </div>

            <motion.button
              className="btn btn-glow start-btn"
              onClick={startWorkout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={20} /> Begin Training
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }

  // Active Workout
  if (workoutActive && !showCompletion) {
    const exercise = dayPlan?.exercises[currentExercise];

    if (isResting) {
      return (
        <div className="workout-page workout-active">
          <div className="rest-overlay">
            <motion.div
              className="rest-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="rest-timer-ring">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,180,216,0.1)" strokeWidth="8" />
                  <circle
                    cx="100" cy="100" r="90" fill="none" stroke="var(--blue-glow)" strokeWidth="8"
                    strokeDasharray={`${(restTimeLeft / 60) * 565.48} 565.48`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dasharray 1s linear' }}
                  />
                </svg>
                <span className="rest-timer-text">{formatTime(restTimeLeft)}</span>
              </div>
              <p className="rest-label">Rest Period</p>
              <p className="rest-next">Next: {currentExercise < (dayPlan?.exercises.length || 0)
                ? dayPlan.exercises[currentExercise].name
                : 'Workout Complete'}</p>
              <button className="btn btn-ghost" onClick={() => { setIsResting(false); setRestTimeLeft(0); }}>
                Skip Rest <SkipForward size={16} />
              </button>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="workout-page workout-active">
        <div className="active-workout-header">
          <div className="awh-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentExercise) / (dayPlan?.exercises.length || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div className="awh-info">
            <span className="awh-timer"><Timer size={16} /> {formatTime(timerSeconds)}</span>
            <span className="awh-progress-text">
              {currentExercise + 1}/{dayPlan?.exercises.length}
            </span>
          </div>
        </div>

        <motion.div
          className="active-exercise"
          key={currentExercise}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="exercise-display">
            <span className="exercise-emoji">{EXERCISE_EMOJIS[exercise?.name.toLowerCase().split(' ')[0]] || EXERCISE_EMOJIS.default}</span>
            <h2 className="exercise-current-name">{exercise?.name}</h2>
            <p className="exercise-focus">{dayPlan?.focus}</p>
            {exercise?.note && <p className="exercise-instruction">💡 {exercise.note}</p>}
          </div>

          <div className="set-tracker">
            <div className="set-ring">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(0,180,216,0.1)" strokeWidth="10" />
                <circle
                  cx="100" cy="100" r="85" fill="none" stroke="var(--blue-glow)" strokeWidth="10"
                  strokeDasharray={`${(currentSet / (exercise?.sets || 1)) * 534.07} 534.07`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="set-info">
                <span className="set-current">{currentSet}</span>
                <span className="set-total">/ {exercise?.sets}</span>
              </div>
            </div>
            <p className="set-label">SETS COMPLETED</p>
            <p className="set-reps">Target: {exercise?.reps} reps</p>
          </div>

          <div className="active-actions">
            {currentSet < (exercise?.sets || 1) ? (
              <motion.button
                className="btn btn-primary set-complete-btn"
                onClick={completeSet}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check size={24} /> Complete Set {currentSet}
              </motion.button>
            ) : (
              <motion.button
                className="btn btn-glow exercise-complete-btn"
                onClick={completeExercise}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check size={24} /> Complete Exercise
              </motion.button>
            )}
          </div>

          <button className="btn btn-danger quit-btn" onClick={resetWorkout}>
            End Workout
          </button>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  if (showCompletion) {
    return (
      <div className="workout-page completion-page">
        <motion.div
          className="completion-content"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <motion.div
            className="completion-bat"
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.8 }}
          >
            🦇
          </motion.div>
          <h1 className="completion-title glow-text">Mission Complete</h1>
          <p className="completion-subtitle">{dayPlan?.name}</p>

          <div className="completion-stats">
            <div className="completion-stat">
              <span className="cs-value">{formatTime(workoutData.duration * 60)}</span>
              <span className="cs-label">Duration</span>
            </div>
            <div className="completion-stat">
              <span className="cs-value">{workoutData.calories}</span>
              <span className="cs-label">Calories</span>
            </div>
            <div className="completion-stat">
              <span className="cs-value">{workoutData.exercises.length}</span>
              <span className="cs-label">Exercises</span>
            </div>
          </div>

          <p className="completion-message">
            Outstanding work, Agent. Gotham just got a little safer.
          </p>

          <div className="completion-actions">
            <button className="btn btn-ghost" onClick={resetWorkout}>Back to Plan</button>
            <button className="btn btn-glow" onClick={saveWorkout}>
              <Trophy size={18} /> Save Workout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

function Repeat({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

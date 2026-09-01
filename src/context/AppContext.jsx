import { createContext, useContext, useReducer, useEffect } from 'react';
import { ACHIEVEMENTS, MOTIVATION_LEVELS, TRAINING_PHASES } from '../data/trainingData';

const AppContext = createContext(null);

const STORAGE_KEY = 'batcomputer_v1';

const initialState = {
  user: null,
  phase: 'BEGINNER',
  workouts: [],
  weightLog: [],
  nutritionLog: [],
  journalEntries: [],
  brainScores: [],
  achievements: [],
  settings: {
    notifications: true,
    darkMode: true,
    soundEffects: true,
    hapticFeedback: true,
    weeklyGoal: 4,
    targetWeight: 52,
    startWeight: 59,
    startDate: new Date().toISOString(),
  },
  currentWorkout: null,
  timerState: null,
  isLoading: true,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed, isLoading: false };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...initialState, isLoading: false };
}

function saveState(state) {
  try {
    const toSave = { ...state, isLoading: false, currentWorkout: null, timerState: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function getXPForLevel(totalXP) {
  const levels = [];
  let xp = 0;
  let level = 1;
  while (xp <= totalXP) {
    xp = Math.floor(500 * Math.pow(level, 1.5));
    levels.push({ level, xpRequired: xp, totalXPRequired: xp + (levels[levels.length - 1]?.totalXPRequired || 0) });
    level++;
  }
  return levels;
}

function calculateLevel(totalXP) {
  const levels = getXPForLevel(totalXP);
  let currentLevel = 1;
  for (const l of levels) {
    if (totalXP >= l.totalXPRequired) currentLevel = l.level;
    else break;
  }
  const currentLevelData = levels.find(l => l.level === currentLevel);
  const nextLevelData = levels.find(l => l.level === currentLevel + 1);
  const xpInCurrentLevel = totalXP - (currentLevelData?.totalXPRequired || 0);
  const xpForNextLevel = nextLevelData ? nextLevelData.totalXPRequired - currentLevelData.totalXPRequired : 1000;
  return {
    level: currentLevel,
    xp: xpInCurrentLevel,
    xpRequired: xpForNextLevel,
    progress: xpInCurrentLevel / xpForNextLevel,
  };
}

function calculateStreak(workouts) {
  if (!workouts.length) return 0;
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

function checkAchievements(state) {
  const earned = new Set(state.achievements.map(a => a.id));
  const newAchievements = [];
  const workouts = state.workouts;
  const streak = calculateStreak(workouts);
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const weeklyCalories = workouts
    .filter(w => {
      const d = new Date(w.date);
      const now = new Date();
      return (now - d) < 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, w) => sum + (w.calories || 0), 0);
  const brainPuzzles = state.brainScores.length;
  const perfectBrain = state.brainScores.some(s => s.percentage === 100);
  const journalStreak = calculateJournalStreak(state.journalEntries);
  const prs = workouts.filter(w => w.isPR).length;
  const weightProgress = state.weightLog.length > 1
    ? state.weightLog[0].weight - state.weightLog[state.weightLog.length - 1].weight
    : 0;

  ACHIEVEMENTS.forEach(achievement => {
    if (earned.has(achievement.id)) return;
    let earned_flag = false;
    const req = achievement.requirement;

    switch (req.type) {
      case 'workouts': earned_flag = totalWorkouts >= req.count; break;
      case 'streak': earned_flag = streak >= req.count; break;
      case 'prs': earned_flag = prs >= req.count; break;
      case 'brain_perfect': earned_flag = perfectBrain; break;
      case 'brain_puzzles': earned_flag = brainPuzzles >= req.count; break;
      case 'journal_streak': earned_flag = journalStreak >= req.count; break;
      case 'grind': earned_flag = workouts.filter(w => w.grind).length >= req.count; break;
      case 'weekly_calories': earned_flag = weeklyCalories >= req.count; break;
      case 'days_total': earned_flag = totalWorkouts >= req.count; break;
      case 'weight_log': earned_flag = weightProgress > 0; break;
      case 'early_workout': earned_flag = workouts.some(w => new Date(w.date).getHours() < 6); break;
      case 'late_workout': earned_flag = workouts.some(w => new Date(w.date).getHours() >= 22); break;
      case 'nutrition_streak': earned_flag = calculateNutritionStreak(state.nutritionLog) >= req.count; break;
      case 'workout_types': earned_flag = new Set(workouts.map(w => w.type)).size >= req.count; break;
      case 'perfect_attendance': earned_flag = checkPerfectAttendance(workouts) >= req.count; break;
    }

    if (earned_flag) {
      newAchievements.push({ ...achievement, earnedAt: new Date().toISOString() });
    }
  });

  if (newAchievements.length > 0) {
    return [...state.achievements, ...newAchievements];
  }
  return state.achievements;
}

function calculateJournalStreak(entries) {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
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

function calculateNutritionStreak(log) {
  if (!log.length) return 0;
  const sorted = [...log].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const d1 = new Date(sorted[i].date);
    const d2 = new Date(sorted[i + 1].date);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diff = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
    if (diff === 1 && sorted[i].followedPlan) streak++;
    else break;
  }
  return streak;
}

function checkPerfectAttendance(workouts) {
  // Check if no workout was missed in a consecutive period
  const today = new Date();
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const workoutDates = new Set(
    workouts
      .filter(w => new Date(w.date) >= twoWeeksAgo)
      .map(w => new Date(w.date).toDateString())
  );
  let current = new Date(twoWeeksAgo);
  let streak = 0;
  while (current <= today) {
    const dow = current.getDay();
    const expected = ![0, 3].includes(dow); // Mon, Tue, Thu, Fri, Sat
    if (expected) {
      if (workoutDates.has(current.toDateString())) streak++;
      else break;
    }
    current.setDate(current.getDate() + 1);
  }
  return streak;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'LOAD_STATE':
      return { ...action.payload, isLoading: false };

    case 'START_WORKOUT':
      return { ...state, currentWorkout: action.payload };

    case 'END_WORKOUT': {
      const workout = { ...action.payload, id: Date.now().toString(), date: new Date().toISOString() };
      const newAchievements = checkAchievements({ ...state, workouts: [...state.workouts, workout] });
      const xpGained = calculateWorkoutXP(workout);
      return {
        ...state,
        workouts: [...state.workouts, workout],
        achievements: newAchievements,
        currentWorkout: null,
        timerState: null,
        totalXP: (state.totalXP || 0) + xpGained,
      };
    }

    case 'LOG_WEIGHT': {
      const entry = { ...action.payload, id: Date.now().toString(), date: new Date().toISOString() };
      const newAchievements = checkAchievements({ ...state, weightLog: [...state.weightLog, entry] });
      return { ...state, weightLog: [...state.weightLog, entry], achievements: newAchievements };
    }

    case 'LOG_NUTRITION': {
      const entry = { ...action.payload, id: Date.now().toString(), date: new Date().toISOString() };
      return { ...state, nutritionLog: [...state.nutritionLog, entry] };
    }

    case 'ADD_JOURNAL': {
      const entry = { ...action.payload, id: Date.now().toString(), date: new Date().toISOString() };
      return { ...state, journalEntries: [...state.journalEntries, entry] };
    }

    case 'LOG_BRAIN_SCORE': {
      const entry = { ...action.payload, id: Date.now().toString(), date: new Date().toISOString() };
      const newAchievements = checkAchievements({ ...state, brainScores: [...state.brainScores, entry] });
      return { ...state, brainScores: [...state.brainScores, entry], achievements: newAchievements };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'SET_TIMER':
      return { ...state, timerState: action.payload };

    case 'CLEAR_TIMER':
      return { ...state, timerState: null };

    case 'RESET_DATA':
      return { ...initialState };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

function calculateWorkoutXP(workout) {
  let xp = 50; // Base XP for completing workout
  xp += (workout.calories || 0) * 0.5;
  if (workout.isPR) xp += 100;
  if (workout.grind) xp += 75;
  xp += workout.duration || 0;
  return Math.floor(xp);
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    if (!state.isLoading) {
      saveState(state);
    }
  }, [state.workouts, state.weightLog, state.nutritionLog, state.journalEntries, state.brainScores, state.achievements, state.settings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { calculateLevel, calculateStreak, MOTIVATION_LEVELS };

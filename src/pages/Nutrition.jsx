import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { NUTRITION_PLAN } from '../data/trainingData';
import { Plus, Check, ChevronDown, ChevronUp, Flame, Droplets } from 'lucide-react';
import './Nutrition.css';

export default function Nutrition() {
  const { state, dispatch } = useApp();
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [todayLog, setTodayLog] = useState({});
  const [waterIntake, setWaterIntake] = useState(0);
  const [showSupplement, setShowSupplement] = useState(false);

  const today = new Date().toDateString();
  const existingLog = state.nutritionLog.find(l => new Date(l.date).toDateString() === today);

  const totalConsumed = Object.values(todayLog).reduce((sum, items) => {
    return sum + items.reduce((s, item) => s + item.calories, 0);
  }, 0);

  const remaining = NUTRITION_PLAN.dailyCalories - totalConsumed;
  const progressPercent = Math.min((totalConsumed / NUTRITION_PLAN.dailyCalories) * 100, 100);

  const meals = NUTRITION_PLAN.meals;

  const toggleMeal = (mealId) => {
    setSelectedMeal(selectedMeal === mealId ? null : mealId);
  };

  const logFood = (mealId, food, mealCalories) => {
    const newLog = { ...todayLog };
    if (!newLog[mealId]) newLog[mealId] = [];
    const alreadyLogged = newLog[mealId].find(f => f.name === food.name);
    if (alreadyLogged) {
      newLog[mealId] = newLog[mealId].filter(f => f.name !== food.name);
    } else {
      newLog[mealId] = [...newLog[mealId], food];
    }
    setTodayLog(newLog);

    // Check if all meals are logged
    const allLogged = meals.every(m => newLog[m.id]?.length > 0);
    if (allLogged) {
      dispatch({
        type: 'LOG_NUTRITION',
        payload: {
          date: new Date().toISOString(),
          followedPlan: true,
          calories: totalConsumed,
        }
      });
    }
  };

  const addWater = () => {
    setWaterIntake(w => Math.min(w + 1, 10));
  };

  return (
    <div className="nutrition-page page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title glow-text">Alfred's Nutrition</h1>
        <p className="page-subtitle">Vegetarian Protocol — Winter Arc 2026</p>
      </motion.div>

      {/* Calorie Tracker */}
      <motion.div
        className="calorie-card card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="calorie-ring">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(0,180,216,0.1)" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="85" fill="none" stroke="url(#calorieGradient)" strokeWidth="12"
              strokeDasharray={`${(progressPercent / 100) * 534.07} 534.07`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00b4d8" />
                <stop offset="100%" stopColor="#06d6a0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="calorie-center">
            <span className="calorie-current">{totalConsumed}</span>
            <span className="calorie-max">/ {NUTRITION_PLAN.dailyCalories}</span>
            <span className="calorie-remaining">
              {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
            </span>
          </div>
        </div>

        <div className="calorie-macros">
          <div className="macro-item">
            <span className="macro-label">Protein</span>
            <span className="macro-value">{NUTRITION_PLAN.proteinTarget}g</span>
            <div className="macro-bar">
              <div className="macro-fill protein" style={{ width: '0%' }} />
            </div>
          </div>
          <div className="macro-item">
            <span className="macro-label">Water</span>
            <span className="macro-value">{waterIntake * 0.25}L / 3L</span>
            <div className="macro-bar">
              <div className="macro-fill water" style={{ width: `${(waterIntake / 12) * 100}%` }} />
            </div>
          </div>
        </div>

        <button className="water-btn" onClick={addWater}>
          <Droplets size={18} /> Add Glass (250ml)
        </button>
      </motion.div>

      {/* Meals */}
      <div className="meals-container">
        {meals.map((meal, i) => {
          const mealCalories = todayLog[meal.id]?.reduce((s, f) => s + f.calories, 0) || 0;
          const isExpanded = selectedMeal === meal.id;

          return (
            <motion.div
              key={meal.id}
              className="meal-card card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="meal-header" onClick={() => toggleMeal(meal.id)}>
                <div className="meal-info">
                  <span className="meal-time">{meal.time}</span>
                  <h3>{meal.name}</h3>
                  <p className="meal-desc">{meal.description}</p>
                </div>
                <div className="meal-summary">
                  <span className="meal-calories">{mealCalories}/{meal.calories} kcal</span>
                  <span className="meal-protein">{meal.protein}g protein</span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  className="meal-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="foods-list">
                    {meal.foods.map((food, j) => {
                      const isLogged = todayLog[meal.id]?.some(f => f.name === food.name);
                      return (
                        <motion.button
                          key={j}
                          className={`food-item ${isLogged ? 'logged' : ''}`}
                          onClick={() => logFood(meal.id, food, food.calories)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="food-check">{isLogged ? <Check size={16} /> : <Plus size={16} />}</span>
                          <span className="food-name">{food.name}</span>
                          <span className="food-serving">{food.serving}</span>
                          <span className="food-cal">{food.calories} cal</span>
                          <span className="food-protein">{food.protein}g P</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {meal.note && (
                    <div className="meal-note">
                      <span className="note-label">💡 Alfred's Note:</span>
                      <p>{meal.note}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Guidelines */}
      <motion.div
        className="guidelines-card card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Autobot Rations Guide</h3>
        <ul className="guidelines-list">
          {NUTRITION_PLAN.guidelines.map((g, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }}>
              {g}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Supplements */}
      <motion.div
        className="supplements-card card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <button className="supplements-header" onClick={() => setShowSupplement(!showSupplement)}>
          <h3>Supplements Protocol</h3>
          {showSupplement ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showSupplement && (
          <motion.div
            className="supplements-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
          >
            {NUTRITION_PLAN.supplements.map((sup, i) => (
              <div key={i} className="supplement-item">
                <span className="sup-name">{sup.name}</span>
                <span className="sup-purpose">{sup.purpose}</span>
                <span className="sup-timing">{sup.timing}</span>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import BatLogo from '../components/BatLogo';
import './Onboarding.css';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to the Batcomputer',
    subtitle: 'The Batcomputer Training Academy',
    description: 'Every great hero begins with a decision. Tonight, you chose to become more than you were. From September 1st, your transformation begins — the Winter Arc.',
    icon: '🦇',
    stat: { label: 'Your Mission', value: 'Transform body & mind', sub: 'Winter Arc 2026' },
  },
  {
    id: 'stats',
    title: 'Your Starting Data',
    subtitle: 'The Batcomputer needs your metrics',
    description: 'Bruce Wayne knows every detail about himself. So must you. Accurate data is the foundation of progress.',
    fields: [
      { key: 'weight', label: 'Current Weight (kg)', type: 'number', value: 59, placeholder: '59' },
      { key: 'height', label: 'Height (cm)', type: 'number', value: 160, placeholder: '160' },
      { key: 'targetWeight', label: 'Target Weight (kg)', type: 'number', value: 52, placeholder: '52' },
      { key: 'age', label: 'Age', type: 'number', value: 25, placeholder: '25' },
      { key: 'name', label: 'Your Alias', type: 'text', value: 'Harsh Saini', placeholder: 'Enter your alias' },
    ],
  },
  {
    id: 'mission',
    title: 'Your Mission Briefing',
    subtitle: 'Why are you here?',
    description: 'The Wayne family needs their protector. Every rep, every meal, every journal entry brings you closer.',
    goals: [
      { title: 'Eliminate Belly Fat', desc: 'Reduce body fat through disciplined training & nutrition', icon: '🎯' },
      { title: 'Build Functional Strength', desc: 'Strong enough to protect your family — single-handedly if needed', icon: '💪' },
      { title: 'Train Like Batman', desc: 'Master martial arts fundamentals, cardio, and combat readiness', icon: '🦇' },
      { title: 'Sharpen the Mind', desc: 'Become the world\'s greatest detective through brain training', icon: '🧠' },
      { title: 'Absolute Discipline', desc: 'No excuses. No shortcuts. Every single day.', icon: '⚡' },
    ],
  },
  {
    id: 'equipment',
    title: 'Available Equipment',
    subtitle: 'What gear do you have?',
    description: 'Batman doesn\'t need gadgets to be effective. Neither do you. But knowing what you have helps us build the right plan.',
    options: [
      { id: 'none', label: 'Bodyweight Only', icon: '🙌' },
      { id: 'chair', label: 'Chair/Surface', icon: '🪑' },
      { id: 'backpack', label: 'Backpack (for weight)', icon: '🎒' },
      { id: 'bottles', label: 'Water Bottles', icon: '💧' },
      { id: 'pullup-bar', label: 'Pull-Up Bar', icon: '🔗' },
    ],
  },
  {
    id: 'complete',
    title: 'You\'re Ready, Agent.',
    subtitle: 'The Batcave is open.',
    description: 'Your training program has been generated. The journey to becoming Gotham\'s greatest protector starts September 1st.',
    summary: [
      { label: 'Starting Weight', value: '59 kg' },
      { label: 'Target Weight', value: '52 kg' },
      { label: 'Training Phase', value: 'Recruit' },
      { label: 'Program Length', value: '8 weeks' },
      { label: 'Daily Calories', value: '~1,800 kcal' },
      { label: 'Training Days', value: '3-4 / week' },
    ],
  },
];

export default function Onboarding({ onComplete }) {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    weight: 59, height: 160, targetWeight: 52, age: 25, name: 'Harsh Saini',
    equipment: ['none'],
  });

  const step = steps[currentStep];
  const progress = ((currentStep) / (steps.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      dispatch({ type: 'SET_USER', payload: formData });
      dispatch({ type: 'SET_PHASE', payload: 'BEGINNER' });
      localStorage.setItem('batcomputer_onboarded', 'true');
      onComplete();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <div className="onboarding">
      {/* Background particles */}
      <div className="onboarding-bg">
        <div className="scanline-overlay" />
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      <div className="onboarding-container">
        {/* Progress bar */}
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="step-indicators">
            {steps.map((_, i) => (
              <div key={i} className={`step-dot ${i <= currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="onboarding-content"
          >
            {/* Step 0 – Welcome */}
            {currentStep === 0 && (
              <div className="step-welcome">
                <BatLogo size="large" animated />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h1 className="glow-text">{step.title}</h1>
                  <h2>{step.subtitle}</h2>
                  <p>{step.description}</p>
                </motion.div>
                <motion.div className="onboarding-stat" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                  <span className="stat-label">{step.stat.label}</span>
                  <span className="stat-value glow-text">{step.stat.value}</span>
                  <span className="stat-sub">{step.stat.sub}</span>
                </motion.div>
              </div>
            )}

            {/* Step 1 – Stats */}
            {currentStep === 1 && (
              <div className="step-form">
                <h1>{step.title}</h1>
                <p>{step.description}</p>
                <div className="form-grid">
                  {step.fields.map((field) => (
                    <div key={field.key} className="form-group">
                      <label>{field.label}</label>
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                        placeholder={field.placeholder}
                      />
                      {field.key === 'weight' && (
                        <span className="form-unit">kg</span>
                      )}
                      {field.key === 'height' && (
                        <span className="form-unit">cm</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bmi-display">
                  <span>BMI: <strong>{calculateBMI(formData.weight, formData.height).toFixed(1)}</strong></span>
                  <span className="bmi-category">({getBMICategory(calculateBMI(formData.weight, formData.height))})</span>
                </div>
              </div>
            )}

            {/* Step 2 – Mission */}
            {currentStep === 2 && (
              <div className="step-mission">
                <h1>{step.title}</h1>
                <p>{step.description}</p>
                <div className="goals-grid">
                  {step.goals.map((goal, i) => (
                    <motion.div
                      key={i}
                      className="goal-card card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="goal-icon">{goal.icon}</span>
                      <h3>{goal.title}</h3>
                      <p>{goal.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 – Equipment */}
            {currentStep === 3 && (
              <div className="step-equipment">
                <h1>{step.title}</h1>
                <p>{step.description}</p>
                <div className="equipment-grid">
                  {step.options.map((opt) => (
                    <motion.button
                      key={opt.id}
                      className={`equip-card ${formData.equipment.includes(opt.id) ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          equipment: formData.equipment.includes(opt.id)
                            ? formData.equipment.filter(e => e !== opt.id)
                            : [...formData.equipment, opt.id]
                        });
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="equip-icon">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 – Complete */}
            {currentStep === 4 && (
              <div className="step-complete">
                <BatLogo size="medium" animated />
                <h1 className="glow-text">{step.title}</h1>
                <p>{step.description}</p>
                <div className="summary-grid">
                  {step.summary.map((item, i) => (
                    <motion.div
                      key={i}
                      className="summary-item"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <span className="summary-label">{item.label}</span>
                      <span className="summary-value glow-text">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="onboarding-nav">
          {currentStep > 0 && (
            <button className="btn btn-ghost" onClick={handleBack}>
              ← Back
            </button>
          )}
          <div className="nav-spacer" />
          <button className="btn btn-glow" onClick={handleNext}>
            {currentStep === steps.length - 1 ? '🦇 Enter the Batcave' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Brain from './pages/Brain';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import './styles/global.css';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('[Autobot] Global error:', e.message, e.filename, e.lineno);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[Autobot] Unhandled rejection:', e.reason);
  });
}

function AppContent() {
  const { state } = useApp();
  const [onboarded, setOnboarded] = useState(null);

  useEffect(() => {
    const done = localStorage.getItem('autobot_arc_onboarded');
    setOnboarded(done === 'true');
  }, []);

  if (onboarded === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--prime-red)', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <PrimeLoader />
          <p style={{ fontFamily: 'var(--font-mono)', marginTop: '1rem', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
            Initializing Autobot Arc...
          </p>
        </div>
      </div>
    );
  }

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/brain" element={<Brain />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function PrimeLoader() {
  return (
    <motion.div
      animate={{ rotate: [0, -4, 4, -2, 2, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 12px rgba(201,26,37,0.6))' }}
    >
      🤖
    </motion.div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;

import { useState, useEffect } from 'react';
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

function AppContent() {
  const { state } = useApp();
  const [onboarded, setOnboarded] = useState(null);

  useEffect(() => {
    const done = localStorage.getItem('batcomputer_onboarded');
    setOnboarded(done === 'true');
  }, []);

  if (onboarded === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--blue-glow)' }}>
        <div style={{ textAlign: 'center' }}>
          <BatLoader />
          <p style={{ fontFamily: 'var(--font-mono)', marginTop: '1rem', color: 'var(--text-muted)' }}>
            Initializing Batcomputer...
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

function BatLoader() {
  return (
    <motion.div
      animate={{ rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: '4rem' }}
    >
      🦇
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

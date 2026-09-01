import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAIN_EXERCISES, BAT_QUOTES } from '../data/trainingData';
import { useApp } from '../context/AppContext';
import { Play, RotateCcw, Trophy, Clock, Zap, Brain as BrainIcon, X, Check, ChevronRight } from 'lucide-react';
import './Brain.css';

const GAME_TYPES = [
  { id: 'memory', name: 'Memory Matrix', icon: '🧩', desc: 'Memorize patterns', color: '#00b4d8' },
  { id: 'pattern', name: 'Pattern Detective', icon: '🔍', desc: 'Solve sequences', color: '#7b2cbf' },
  { id: 'math', name: 'Mental Math', icon: '🔢', desc: 'Speed arithmetic', color: '#f5c542' },
  { id: 'logic', name: 'Logic Gate', icon: '🔐', desc: 'Deduce the truth', color: '#ef233c' },
  { id: 'reflexes', name: 'Reflex Test', icon: '⚡', desc: 'Lightning fast', color: '#06d6a0' },
  { id: 'observation', name: 'Keen Eye', icon: '👁️', desc: 'Find the difference', color: '#48cae4' },
];

export default function Brain() {
  const { state, dispatch } = useApp();
  const [selectedGame, setSelectedGame] = useState(null);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('idle'); // idle, playing, result
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const gameTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  const exerciseConfig = BRAIN_EXERCISES[selectedGame];

  const initGame = useCallback((gameType, lvl = 1) => {
    setSelectedGame(gameType);
    setLevel(lvl);
    setGameState('playing');
    setScore(0);
    setTotalQuestions(0);
    setGameData(null);
    setFeedback(null);
    startTimeRef.current = Date.now();

    switch (gameType) {
      case 'memory': initMemoryGame(lvl); break;
      case 'pattern': initPatternGame(lvl); break;
      case 'math': initMathGame(lvl); break;
      case 'logic': initLogicGame(lvl); break;
      case 'reflexes': initReflexGame(lvl); break;
      case 'observation': initObservationGame(lvl); break;
    }
  }, []);

  // ─── MEMORY MATRIX ───
  const initMemoryGame = (lvl) => {
    const config = exerciseConfig.getLevel(lvl);
    const grid = Array(config.gridSize).fill(null).map(() => Array(config.gridSize).fill(false));
    const positions = [];
    while (positions.length < config.patternSize) {
      const r = Math.floor(Math.random() * config.gridSize);
      const c = Math.floor(Math.random() * config.gridSize);
      if (!positions.find(p => p.r === r && p.c === c)) {
        positions.push({ r, c });
        grid[r][c] = true;
      }
    }
    setGameData({
      type: 'memory',
      grid,
      positions,
      showTime: config.showTime,
      gridSize: config.gridSize,
      phase: 'memorize',
      userGrid: Array(config.gridSize).fill(null).map(() => Array(config.gridSize).fill(false)),
    });
  };

  const handleMemoryClick = (r, c) => {
    if (gameData?.phase !== 'recall') return;
    const newGrid = gameData.userGrid.map(row => [...row]);
    newGrid[r][c] = !newGrid[r][c];
    setGameData({ ...gameData, userGrid: newGrid });
  };

  const submitMemory = () => {
    let correct = 0;
    gameData.positions.forEach(p => {
      if (gameData.userGrid[p.r][p.c]) correct++;
    });
    // Penalize wrong selections
    let wrong = 0;
    gameData.userGrid.forEach((row, r) => row.forEach((val, c) => {
      if (val && !gameData.positions.find(p => p.r === r && p.c === c)) wrong++;
    }));
    const points = Math.max(0, correct - wrong);
    setScore(s => s + points);
    setTotalQuestions(t => t + 1);
    showFeedback(points >= gameData.positions.length ? 'Perfect!' : `${correct}/${gameData.positions.length} matched`);

    // Next level or finish
    setTimeout(() => {
      if (level < 10) {
        setLevel(l => l + 1);
        initMemoryGame(level + 1);
      } else {
        endGame();
      }
    }, 2000);
  };

  // ─── PATTERN DETECTIVE ───
  const initPatternGame = (lvl) => {
    const config = exerciseConfig.getLevel(lvl);
    const patterns = [
      () => { // Arithmetic
        const start = Math.floor(Math.random() * 20) + 1;
        const diff = Math.floor(Math.random() * 5) + 2;
        const seq = [];
        for (let i = 0; i < config.sequenceLength; i++) seq.push(start + diff * i);
        return { seq, answer: seq[seq.length - 1] + diff, options: generateOptions(seq[seq.length - 1] + diff) };
      },
      () => { // Fibonacci-like
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 2;
        const seq = [a, b];
        for (let i = 2; i < config.sequenceLength; i++) seq.push(seq[i-1] + seq[i-2]);
        return { seq, answer: seq[seq.length - 1] + seq[seq.length - 2], options: generateOptions(seq[seq.length - 1] + seq[seq.length - 2]) };
      },
      () => { // Geometric
        const start = Math.floor(Math.random() * 3) + 2;
        const mult = Math.floor(Math.random() * 2) + 2;
        const seq = [];
        for (let i = 0; i < config.sequenceLength; i++) seq.push(start * Math.pow(mult, i));
        return { seq, answer: seq[seq.length - 1] * mult, options: generateOptions(seq[seq.length - 1] * mult) };
      },
    ];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]();
    setGameData({ type: 'pattern', ...pattern });
  };

  const generateOptions = (answer) => {
    const opts = new Set([answer]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      opts.add(answer + offset);
    }
    return [...opts].sort(() => Math.random() - 0.5);
  };

  const handlePatternAnswer = (answer) => {
    const isCorrect = answer === gameData.answer;
    setScore(s => s + (isCorrect ? 1 : 0));
    setTotalQuestions(t => t + 1);
    showFeedback(isCorrect ? 'Correct!' : `Answer: ${gameData.answer}`);
    setTimeout(() => {
      if (level < 10) {
        setLevel(l => l + 1);
        initPatternGame(level + 1);
      } else {
        endGame();
      }
    }, 2000);
  };

  // ─── MENTAL MATH ───
  const initMathGame = (lvl) => {
    const config = exerciseConfig.getLevel(lvl);
    const ops = config.operations;
    const max = config.maxNumber;
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a, b, answer;
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * max) + 1;
        b = Math.floor(Math.random() * max) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * max) + 10;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
    }

    setGameData({
      type: 'math',
      question: `${a} ${op} ${b} = ?`,
      answer,
      options: generateOptions(answer),
      timeLimit: config.timeLimit,
      timeLeft: config.timeLimit,
    });

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setGameData(gd => {
        if (!gd || gd.type !== 'math') return gd;
        if (gd.timeLeft <= 1) {
          clearInterval(gameTimerRef.current);
          handleMathTimeout();
          return gd;
        }
        return { ...gd, timeLeft: gd.timeLeft - 1 };
      });
    }, 1000);
  };

  const handleMathTimeout = () => {
    setTotalQuestions(t => t + 1);
    showFeedback(`Time! Answer: ${gameData?.answer}`);
    setTimeout(() => {
      if (level < 10) initMathGame(level + 1);
      else endGame();
    }, 2000);
  };

  const handleMathAnswer = (answer) => {
    if (!gameTimerRef.current) return;
    clearInterval(gameTimerRef.current);
    const isCorrect = answer === gameData.answer;
    setScore(s => s + (isCorrect ? 1 : 0));
    setTotalQuestions(t => t + 1);
    showFeedback(isCorrect ? 'Correct!' : `Answer: ${gameData.answer}`);
    setTimeout(() => {
      if (level < 10) initMathGame(level + 1);
      else endGame();
    }, 2000);
  };

  // ─── LOGIC GATE ───
  const initLogicGame = (lvl) => {
    const config = exerciseConfig.getLevel(lvl);
    const names = ['Raven', 'Catwoman', 'Two-Face', 'Penguin', 'Riddler', 'Bane', 'Poison Ivy', 'Killer Croc'];
    const crimes = ['Jewelry Heist', 'Data Breach', 'Poisoning', 'Kidnapping', 'Arson', 'Smuggling', 'Bank Robbery', 'Blackmail'];
    const locations = ['Gotham Bank', 'Wayne Tower', 'Arkham Asylum', 'GCPD', 'Iceberg Lounge', 'Ace Chemicals', 'Gotham Port', 'Royal Hotel'];

    const numClues = config.clues;
    const numSuspects = Math.min(config.suspects + Math.floor(Math.random() * 2), names.length);

    const shuffledNames = [...names].sort(() => Math.random() - 0.5).slice(0, numSuspects);
    const shuffledCrimes = [...crimes].sort(() => Math.random() - 0.5).slice(0, numSuspects);
    const shuffledLocations = [...locations].sort(() => Math.random() - 0.5).slice(0, numSuspects);

    const culprit = shuffledNames[Math.floor(Math.random() * numSuspects)];

    const clues = [];
    for (let i = 0; i < numClues; i++) {
      const suspect = shuffledNames[Math.floor(Math.random() * numSuspects)];
      const isCulprit = suspect === culprit;
      const clueTypes = [
        `Witness saw someone matching ${suspect}'s description`,
        `${suspect} was seen near the crime scene`,
        `DNA evidence points to ${isCulprit ? suspect : shuffledNames[Math.floor(Math.random() * numSuspects)]}`,
        `${suspect} has a history of ${shuffledCrimes[shuffledNames.indexOf(suspect)]}`,
        `Security footage shows a figure matching ${suspect}`,
        `${suspect}'s alibi doesn't hold up`,
      ];
      clues.push(clueTypes[Math.floor(Math.random() * clueTypes.length)]);
    }

    setGameData({
      type: 'logic',
      suspects: shuffledNames.map((n, i) => ({ name: n, crime: shuffledCrimes[i], location: shuffledLocations[i] })),
      culprit,
      clues,
      selectedSuspect: null,
    });
  };

  const handleLogicAnswer = (suspect) => {
    const isCorrect = suspect === gameData.culprit;
    setScore(s => s + (isCorrect ? 1 : 0));
    setTotalQuestions(t => t + 1);
    setGameData({ ...gameData, selectedSuspect: suspect, revealCulprit: gameData.culprit });
    showFeedback(isCorrect ? 'Case Closed! You caught them!' : `Wrong! It was ${gameData.culprit}`);

    setTimeout(() => {
      if (level < 10) initLogicGame(level + 1);
      else endGame();
    }, 3000);
  };

  // ─── REFLEX TEST ───
  const initReflexGame = (lvl) => {
    const config = exerciseConfig.getLevel(lvl);
    const rounds = config.rounds;
    let currentRound = 0;
    const times = [];

    const runRound = () => {
      if (currentRound >= rounds) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const best = Math.min(...times);
        setGameData({ type: 'reflexes', times, avg, best, finished: true });
        setScore(Math.round(Math.max(0, 500 - avg) + Math.max(0, 300 - best)));
        setTotalQuestions(rounds);
        endGame();
        return;
      }

      setGameData(gd => ({
        ...gd,
        waiting: true,
        round: currentRound + 1,
        totalRounds: rounds,
      }));

      const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;
      setTimeout(() => {
        setGameData(gd => ({ ...gd, waiting: false, startTime: Date.now() }));
      }, delay);
    };

    runRound();

    return () => {
      currentRound = rounds;
    };
  };

  const handleReflexClick = () => {
    if (!gameData?.waiting && gameData?.startTime && !gameData?.finished) {
      const reactionTime = Date.now() - gameData.startTime;
      setGameData(gd => ({ ...gd, reactionTime, waiting: null, startTime: null }));
      // Store would need ref, simplified here
    } else if (gameData?.waiting) {
      // Too early!
      setGameData(gd => ({ ...gd, waiting: false, startTime: null }));
    }
  };

  // ─── OBSERVATION ───
  const initObservationGame = (lvl) => {
    const config = exerciseConfig.getLevel(lvl);
    const diff = config.differences;
    const grid = 5;
    const gridSize = Math.min(4 + Math.floor(lvl / 2), 8);

    const gridA = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({
        shape: ['●', '■', '▲', '◆', '★', '⬟'][Math.floor(Math.random() * 6)],
        color: ['#00b4d8', '#7b2cbf', '#f5c542', '#06d6a0', '#ef233c'][Math.floor(Math.random() * 5)],
      }))
    );

    const gridB = gridA.map(row => row.map(cell => ({ ...cell })));
    const diffPositions = [];
    for (let i = 0; i < diff; i++) {
      let r, c;
      do {
        r = Math.floor(Math.random() * gridSize);
        c = Math.floor(Math.random() * gridSize);
      } while (diffPositions.find(p => p.r === r && p.c === c));
      diffPositions.push({ r, c });
      const shapes = ['●', '■', '▲', '◆', '★', '⬟'];
      const shapeIdx = shapes.indexOf(gridB[r][c].shape);
      gridB[r][c].shape = shapes[(shapeIdx + 1) % shapes.length];
    }

    setGameData({
      type: 'observation',
      gridA,
      gridB,
      diffPositions,
      found: [],
      gridSize,
      timeLimit: config.timeLimit,
      timeLeft: config.timeLimit,
      phase: 'playing',
    });

    gameTimerRef.current = setInterval(() => {
      setGameData(gd => {
        if (!gd || gd.type !== 'observation') return gd;
        if (gd.timeLeft <= 1) {
          clearInterval(gameTimerRef.current);
          return { ...gd, timeLeft: 0, phase: 'result' };
        }
        return { ...gd, timeLeft: gd.timeLeft - 1 };
      });
    }, 1000);
  };

  const handleObservationClick = (r, c, grid) => {
    if (grid !== 'B') return;
    const isDiff = gameData.diffPositions.some(p => p.r === r && p.c === c);
    const alreadyFound = gameData.found.some(f => f.r === r && f.c === c);

    if (isDiff && !alreadyFound) {
      const newFound = [...gameData.found, { r, c }];
      setScore(s => s + 1);
      setGameData(gd => ({ ...gd, found: newFound }));

      if (newFound.length === gameData.diffPositions.length) {
        clearInterval(gameTimerRef.current);
        setTotalQuestions(t => t + 1);
        showFeedback('All differences found!');
        setTimeout(() => {
          if (level < 10) initObservationGame(level + 1);
          else endGame();
        }, 2000);
      }
    }
  };

  // ─── GAME LIFECYCLE ───
  const showFeedback = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2000);
  };

  const endGame = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setGameState('result');

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    dispatch({
      type: 'LOG_BRAIN_SCORE',
      payload: {
        game: selectedGame,
        score,
        totalQuestions,
        percentage,
        level,
      },
    });
  };

  const resetGame = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    setSelectedGame(null);
    setGameState('idle');
    setScore(0);
    setTotalQuestions(0);
    setGameData(null);
    setFeedback(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const avgScore = state.brainScores.length > 0
    ? Math.round(state.brainScores.reduce((s, b) => s + b.percentage, 0) / state.brainScores.length)
    : 0;

  // ─── GAME SELECTION ───
  if (!selectedGame) {
    return (
      <div className="brain-page page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title glow-text">Detective Training</h1>
          <p className="page-subtitle">Sharpen your mind. Batman's greatest weapon isn't his fists.</p>
        </motion.div>

        <motion.div
          className="brain-stats card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="brain-stat">
            <span className="bs-icon"><BrainIcon size={20} /></span>
            <span className="bs-value">{avgScore}%</span>
            <span className="bs-label">Avg Score</span>
          </div>
          <div className="brain-stat">
            <span className="bs-icon"><Trophy size={20} /></span>
            <span className="bs-value">{state.brainScores.length}</span>
            <span className="bs-label">Sessions</span>
          </div>
          <div className="brain-stat">
            <span className="bs-icon"><Zap size={20} /></span>
            <span className="bs-value">{state.brainScores.length > 0 ? Math.max(...state.brainScores.map(s => s.percentage)) : 0}%</span>
            <span className="bs-label">Best Score</span>
          </div>
        </motion.div>

        <div className="brain-games-grid">
          {GAME_TYPES.map((game, i) => (
            <motion.button
              key={game.id}
              className="brain-game-card"
              onClick={() => initGame(game.id, 1)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bgc-header" style={{ borderColor: game.color }}>
                <span className="bgc-icon">{game.icon}</span>
              </div>
              <h3>{game.name}</h3>
              <p>{game.desc}</p>
              <span className="bgc-play">Train →</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ─── PLAYING STATE ───
  return (
    <div className="brain-page brain-playing">
      {/* Header bar */}
      <div className="brain-playing-header">
        <button className="btn btn-ghost back-btn" onClick={resetGame}>
          ← Exit
        </button>
        <div className="bp-header-info">
          <span className="bp-game-name">{exerciseConfig.name}</span>
          <span className="bp-level">Level {level}/10</span>
        </div>
        <div className="bp-score">
          <span className="bp-score-value">{score}</span>
          <span className="bp-score-label">pts</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'result' ? (
          <motion.div
            key="result"
            className="brain-result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="result-icon">
              {totalQuestions > 0 && score / totalQuestions >= 0.8 ? '🏆' : score / totalQuestions >= 0.5 ? '👍' : '💪'}
            </div>
            <h2>Training Complete</h2>
            <div className="result-stats">
              <div className="result-stat">
                <span className="rs-value">{score}/{totalQuestions}</span>
                <span className="rs-label">Correct</span>
              </div>
              <div className="result-stat">
                <span className="rs-value">{totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</span>
                <span className="rs-label">Accuracy</span>
              </div>
            </div>
            <p className="result-message">
              {score / totalQuestions >= 0.9 ? 'Outstanding! Your mind is a weapon.' :
               score / totalQuestions >= 0.7 ? 'Well done. The Batcomputer is impressed.' :
               score / totalQuestions >= 0.5 ? 'Good effort. Every detective starts somewhere.' :
               'Keep training. Even Batman practiced.'}
            </p>
            <div className="result-actions">
              <button className="btn btn-ghost" onClick={resetGame}>Back</button>
              <button className="btn btn-glow" onClick={() => initGame(selectedGame, 1)}>
                <RotateCcw size={18} /> Retry
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedGame}-${level}`}
            className="brain-game-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* MEMORY MATRIX */}
            {gameData?.type === 'memory' && <MemoryGame gameData={gameData} onAction={gameData.phase === 'memorize' ? null : submitMemory} onCellClick={handleMemoryClick} />}
            {/* PATTERN DETECTIVE */}
            {gameData?.type === 'pattern' && <PatternGame gameData={gameData} onAnswer={handlePatternAnswer} />}
            {/* MENTAL MATH */}
            {gameData?.type === 'math' && <MathGame gameData={gameData} onAnswer={handleMathAnswer} />}
            {/* LOGIC GATE */}
            {gameData?.type === 'logic' && <LogicGame gameData={gameData} onAnswer={handleLogicAnswer} />}
            {/* REFLEX TEST */}
            {gameData?.type === 'reflexes' && <ReflexGame gameData={gameData} onAction={handleReflexClick} />}
            {/* OBSERVATION */}
            {gameData?.type === 'observation' && <ObservationGame gameData={gameData} onCellClick={handleObservationClick} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="feedback-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── GAME COMPONENTS ───

function MemoryGame({ gameData, onAction, onCellClick }) {
  if (!gameData) return null;
  return (
    <div className="game-container">
      {gameData.phase === 'memorize' ? (
        <>
          <p className="game-instruction">Memorize the pattern...</p>
          <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${gameData.gridSize}, 1fr)` }}>
            {gameData.grid.map((row, r) => row.map((cell, c) => (
              <motion.div
                key={`${r}-${c}`}
                className={`memory-cell ${cell ? 'active' : ''}`}
                animate={cell ? { scale: [1, 1.2, 1], boxShadow: '0 0 20px rgba(0,180,216,0.8)' } : {}}
                transition={{ duration: 0.3 }}
              />
            )))}
          </div>
        </>
      ) : (
        <>
          <p className="game-instruction">Now recreate the pattern. Tap cells to toggle.</p>
          <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${gameData.gridSize}, 1fr)` }}>
            {gameData.userGrid.map((row, r) => row.map((cell, c) => (
              <motion.div
                key={`${r}-${c}`}
                className={`memory-cell ${cell ? 'selected' : ''}`}
                onClick={() => onCellClick(r, c)}
                whileTap={{ scale: 0.9 }}
              />
            )))}
          </div>
          <button className="btn btn-glow submit-btn" onClick={onAction}>
            Submit Pattern
          </button>
        </>
      )}
    </div>
  );
}

function PatternGame({ gameData, onAnswer }) {
  if (!gameData) return null;
  return (
    <div className="game-container">
      <p className="game-instruction">What comes next?</p>
      <div className="pattern-display">
        {gameData.seq.map((n, i) => (
          <motion.span
            key={i}
            className="pattern-num"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {n}
            {i < gameData.seq.length - 1 && <span className="pattern-arrow">→</span>}
          </motion.span>
        ))}
        <span className="pattern-question">?</span>
      </div>
      <div className="options-grid">
        {gameData.options.map((opt, i) => (
          <motion.button
            key={i}
            className="option-btn"
            onClick={() => onAnswer(opt)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MathGame({ gameData, onAnswer }) {
  if (!gameData) return null;
  return (
    <div className="game-container">
      <p className="game-instruction">Solve as fast as you can!</p>
      <div className="math-display">
        <span className="math-time">{gameData.timeLeft}s</span>
        <span className="math-question">{gameData.question}</span>
      </div>
      <div className="options-grid">
        {gameData.options.map((opt, i) => (
          <motion.button
            key={i}
            className="option-btn"
            onClick={() => onAnswer(opt)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function LogicGame({ gameData, onAnswer }) {
  if (!gameData) return null;
  return (
    <div className="game-container">
      <p className="game-instruction">🕵️ Who is the culprit?</p>
      <div className="clues-box">
        <h4>Evidence</h4>
        {gameData.clues.map((clue, i) => (
          <motion.p key={i} className="clue" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
            {i + 1}. {clue}
          </motion.p>
        ))}
      </div>
      <div className="suspects-grid">
        {gameData.suspects.map((suspect, i) => (
          <motion.button
            key={i}
            className={`suspect-btn ${gameData.selectedSuspect === suspect.name ? (suspect.name === gameData.culprit ? 'correct' : 'wrong') : ''}`}
            onClick={() => !gameData.selectedSuspect && onAnswer(suspect.name)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!!gameData.selectedSuspect}
          >
            <span className="suspect-name">{suspect.name}</span>
            <span className="suspect-info">{suspect.crime}</span>
            {gameData.selectedSuspect === suspect.name && (
              <span className="suspect-result">{suspect.name === gameData.culprit ? '✓ Caught!' : '✗ Not them'}</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ReflexGame({ gameData, onAction }) {
  if (!gameData) return null;

  if (gameData.finished) {
    return (
      <div className="game-container">
        <div className="reflex-result">
          <h3>Reaction Test Complete</h3>
          <div className="reflex-stats">
            <div className="reflex-stat">
              <span className="rs-value">{Math.round(gameData.avg)}ms</span>
              <span className="rs-label">Average</span>
            </div>
            <div className="reflex-stat">
              <span className="rs-value">{Math.round(gameData.best)}ms</span>
              <span className="rs-label">Best</span>
            </div>
          </div>
          <button className="btn btn-glow" onClick={onAction}>
            <RotateCcw size={18} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div
        className={`reflex-area ${gameData.waiting === true ? 'waiting' : gameData.waiting === false ? 'react' : ''}`}
        onClick={onAction}
      >
        {gameData.waiting === null ? (
          <div className="reflex-idle">
            <p>Click when you see <span style={{ color: 'var(--green-success)' }}>GREEN</span></p>
            <p className="reflex-warn">Don't click too early!</p>
            <button className="btn btn-glow" onClick={onAction}>Start Test</button>
          </div>
        ) : gameData.waiting === true ? (
          <div className="reflex-wait">
            <p>Wait for green...</p>
            <div className="pulse-ring" />
          </div>
        ) : (
          <div className="reflex-go">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.5 }}
            >
              CLICK NOW!
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}

function ObservationGame({ gameData, onCellClick }) {
  if (!gameData) return null;
  const gridSize = gameData.gridSize;

  return (
    <div className="game-container">
      <p className="game-instruction">
        Find the {gameData.diffPositions.length} difference{gameData.diffPositions.length > 1 ? 's' : ''}
        <span className="obs-timer"><Clock size={14} /> {gameData.timeLeft}s</span>
      </p>
      <div className="observation-grids">
        <div className="obs-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {gameData.gridA.map((row, r) => row.map((cell, c) => (
            <div key={`a-${r}-${c}`} className="obs-cell">
              <span style={{ color: cell.color }}>{cell.shape}</span>
            </div>
          )))}
        </div>
        <span className="vs-text">VS</span>
        <div className="obs-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {gameData.gridB.map((row, r) => row.map((cell, c) => {
            const isFound = gameData.found.some(f => f.r === r && f.c === c);
            return (
              <motion.div
                key={`b-${r}-${c}`}
                className={`obs-cell ${isFound ? 'found' : ''}`}
                onClick={() => onCellClick(r, c, 'B')}
                whileTap={{ scale: 0.9 }}
              >
                <span style={{ color: cell.color }}>{cell.shape}</span>
              </motion.div>
            );
          }))}
        </div>
      </div>
      <p className="found-count">Found: {gameData.found.length}/{gameData.diffPositions.length}</p>
    </div>
  );
}

import { useEffect, useRef, useCallback, useReducer } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

let audioCtx = null;
let currentGain = null;
let currentOscillators = [];

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function stopAll() {
  currentOscillators.forEach(o => {
    try { o.stop(); } catch (e) { /* ignore */ }
  });
  currentOscillators = [];
  if (currentGain) {
    try { currentGain.disconnect(); } catch (e) { /* ignore */ }
    currentGain = null;
  }
}

function playPrimeTheme() {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  stopAll();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.12, ctx.currentTime);
  master.connect(ctx.destination);
  currentGain = master;

  const now = ctx.currentTime;
  const loopDuration = 6.0;

  // Iconic "BUM-BUM-BUM-BUM-BUM-BUM" bass motif
  const noteFreqs = [
    { f: 110, t: 0 },
    { f: 110, t: 0.35 },
    { f: 146.83, t: 0.7 },
    { f: 146.83, t: 1.05 },
    { f: 110, t: 1.4 },
    { f: 110, t: 1.75 },
    { f: 98, t: 2.1 },
    { f: 98, t: 2.45 },
    { f: 110, t: 2.8 },
    { f: 110, t: 3.15 },
    { f: 220, t: 3.5 },
    { f: 220, t: 3.85 },
    { f: 174.61, t: 4.2 },
    { f: 164.81, t: 4.55 },
    { f: 146.83, t: 4.9 },
    { f: 110, t: 5.25 },
  ];

  noteFreqs.forEach(({ f, t }) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, now + t);
    env.gain.setValueAtTime(0, now + t);
    env.gain.linearRampToValueAtTime(0.8, now + t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.4, now + t + 0.2);
    env.gain.linearRampToValueAtTime(0, now + t + 0.5);
    osc.connect(env);
    env.connect(master);
    osc.start(now + t);
    osc.stop(now + t + 0.6);
    currentOscillators.push(osc);
  });

  // Ambient pad layer
  [
    { f: 220, type: 'sine' },
    { f: 277.18, type: 'triangle' },
    { f: 329.63, type: 'sine' },
  ].forEach(({ f, type }) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, now);
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.06, now + 0.5);
    osc.connect(env);
    env.connect(master);
    osc.start(now);
    osc.stop(now + loopDuration);
    currentOscillators.push(osc);
  });

  // Loop
  const interval = setInterval(() => {
    if (!document.hidden) playPrimeTheme();
  }, loopDuration * 1000);
  window.__primeThemeInterval = interval;
}

function stopPrimeTheme() {
  stopAll();
  const interval = window.__primeThemeInterval;
  if (interval) {
    clearInterval(interval);
    window.__primeThemeInterval = null;
  }
}

export default function ThemeAudio() {
  const [muted, setMuted] = useReducer(s => s + 1, 0, () => localStorage.getItem('autobot_audio') === 'off' ? 1 : 0);

  useEffect(() => {
    localStorage.setItem('autobot_audio', muted === 1 ? 'off' : 'on');
  }, [muted]);

  useEffect(() => {
    if (muted === 0) {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      playPrimeTheme();
    } else {
      stopPrimeTheme();
    }
    return () => { stopPrimeTheme(); };
  }, [muted]);

  useEffect(() => {
    const onVisible = () => {
      if (muted === 0 && currentOscillators.length === 0) {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        playPrimeTheme();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [muted]);

  const toggle = useCallback(() => {
    setMuted(m => m === 0 ? 1 : 0);
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label={muted === 1 ? 'Unmute theme music' : 'Mute theme music'}
      style={{
        background: 'none',
        border: 'none',
        color: muted === 1 ? 'var(--text-muted)' : 'var(--prime-red)',
        padding: 8,
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease',
      }}
    >
      {muted === 1 ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}

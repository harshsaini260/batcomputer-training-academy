import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { JOURNAL_PROMPTS } from '../data/trainingData';
import { BookOpen, Plus, Calendar, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import './Journal.css';

export default function Journal() {
  const { state, dispatch } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({ content: '', prompt: '', mood: 5, energy: 5 });
  const [filterMood, setFilterMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const entries = [...state.journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = entries.filter(entry => {
    if (filterMood !== 'all') {
      if (filterMood === 'high' && entry.mood < 7) return false;
      if (filterMood === 'low' && entry.mood >= 7) return false;
    }
    if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase()) && !entry.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const saveEntry = () => {
    if (!newEntry.content.trim()) return;
    dispatch({
      type: 'ADD_JOURNAL',
      payload: {
        ...newEntry,
        prompt: newEntry.prompt || JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)],
      },
    });
    setNewEntry({ content: '', prompt: '', mood: 5, energy: 5 });
    setIsWriting(false);
  };

  const getRandomPrompt = () => {
    const random = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setNewEntry({ ...newEntry, prompt: random });
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 9) return '🔥';
    if (mood >= 7) return '😤';
    if (mood >= 5) return '💪';
    if (mood >= 3) return '😤';
    return '😔';
  };

  return (
    <div className="journal-page page-container">
      <motion.div
        className="journal-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="jh-top">
          <div>
            <h1 className="page-title glow-text">Bat-Journal</h1>
            <p className="page-subtitle">The Dark Knight's greatest weapon is his mind. Document your thoughts.</p>
          </div>
          <button className="btn btn-glow" onClick={() => setIsWriting(true)}>
            <Plus size={18} /> New Entry
          </button>
        </div>

        <div className="journal-stats">
          <div className="journal-stat">
            <span className="js-value">{entries.length}</span>
            <span className="js-label">Entries</span>
          </div>
          <div className="journal-stat">
            <span className="js-value">
              {entries.length > 0 ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1) : '—'}
            </span>
            <span className="js-label">Avg Mood</span>
          </div>
          <div className="journal-stat">
            <span className="js-value">
              {entries.length > 0 ? (entries.reduce((s, e) => s + e.energy, 0) / entries.length).toFixed(1) : '—'}
            </span>
            <span className="js-label">Avg Energy</span>
          </div>
        </div>
      </motion.div>

      {/* Writing Modal */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            className="journal-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="journal-modal-content">
              <div className="jmodal-header">
                <h2>New Journal Entry</h2>
                <button className="btn btn-ghost" onClick={() => setIsWriting(false)}>✕</button>
              </div>

              <div className="jmodal-body">
                <div className="prompt-section">
                  <p className="prompt-label">Today's Prompt</p>
                  <div className="prompt-display">
                    <p>{newEntry.prompt || 'Click below for a prompt...'}</p>
                    <button className="prompt-shuffle" onClick={getRandomPrompt}>
                      <Calendar size={16} /> Shuffle
                    </button>
                  </div>
                </div>

                <textarea
                  className="journal-textarea"
                  placeholder="Write your thoughts... What did you learn today? How did training change you?"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  autoFocus
                  rows={8}
                />

                <div className="journal-mood">
                  <div className="mood-slider">
                    <label>Mood: {getMoodEmoji(newEntry.mood)}</label>
                    <input
                      type="range" min="1" max="10"
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry({ ...newEntry, mood: parseInt(e.target.value) })}
                    />
                    <span>{newEntry.mood}/10</span>
                  </div>
                  <div className="mood-slider">
                    <label>Energy: {newEntry.energy >= 7 ? '⚡' : newEntry.energy >= 4 ? '🔋' : '🪫'}</label>
                    <input
                      type="range" min="1" max="10"
                      value={newEntry.energy}
                      onChange={(e) => setNewEntry({ ...newEntry, energy: parseInt(e.target.value) })}
                    />
                    <span>{newEntry.energy}/10</span>
                  </div>
                </div>
              </div>

              <div className="jmodal-footer">
                <button className="btn btn-ghost" onClick={() => setIsWriting(false)}>Cancel</button>
                <button className="btn btn-glow" onClick={saveEntry} disabled={!newEntry.content.trim()}>
                  <BookOpen size={18} /> Save Entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        className="journal-filters card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="jf-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} /> {showFilters ? 'Hide' : 'Filter'}
        </button>
      </motion.div>

      {/* Entries */}
      <div className="entries-container">
        {filtered.length === 0 ? (
          <motion.div
            className="empty-journal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="empty-icon">📔</span>
            <h3>No entries yet</h3>
            <p>Start documenting your journey. Even Batman kept a journal.</p>
            <button className="btn btn-glow" onClick={() => setIsWriting(true)}>
              <Plus size={18} /> Write First Entry
            </button>
          </motion.div>
        ) : (
          filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              className="journal-entry card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="je-header">
                <div className="je-date">
                  <Calendar size={14} />
                  <span>{formatDate(entry.date)}</span>
                  <span className="je-time">{formatTime(entry.date)}</span>
                </div>
                <div className="je-ratings">
                  <span className="je-mood">{getMoodEmoji(entry.mood)} {entry.mood}/10</span>
                  <span className="je-energy">⚡ {entry.energy}/10</span>
                </div>
              </div>
              {entry.prompt && (
                <div className="je-prompt">
                  <span className="prompt-label-small">Prompt:</span> {entry.prompt}
                </div>
              )}
              <p className="je-content">{entry.content}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

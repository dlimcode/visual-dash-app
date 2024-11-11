import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import MusicHappiness from './pages/music_happiness';
import MHQAnalysis from './pages/mhq_analysis';
import Demographics from './pages/demographics';
import Explore from './pages/explore';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <AnimatePresence mode='wait'>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/music-happiness" element={<MusicHappiness />} />
            <Route path="/mhq-analysis" element={<MHQAnalysis />} />
            <Route path="/demographics" element={<Demographics />} />
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
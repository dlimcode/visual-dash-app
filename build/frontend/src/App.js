// src/App.js
import React, { useState } from 'react';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="App">
      <AnimatePresence mode='wait'>
        {!showDashboard ? (
          <Hero key="hero" onExplore={() => setShowDashboard(true)} />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
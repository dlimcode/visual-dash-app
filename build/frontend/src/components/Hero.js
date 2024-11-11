// src/components/Hero.js
import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ onExplore }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="text-center px-4">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold mb-6"
        >
          <span className="text-blue-600">Music</span> and{' '}
          <span className="text-indigo-600">Well-being</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          Explore the fascinating connections between musical preferences,
          happiness levels, and mental well-being across different cultures.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExplore}
          className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Exploring
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Hero;
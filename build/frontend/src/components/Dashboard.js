// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  GlobeAltIcon, 
  MusicalNoteIcon, 
  UserGroupIcon, 
  ShareIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import { fetchStats } from '../services/api';

// Statistic Card Component
const StatCard = ({ icon: Icon, title, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center space-x-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// Hero Section Component
const Hero = ({ onStart }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -100 }}
    className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white"
  >
    <motion.h1 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-5xl md:text-6xl font-bold text-center mb-8 max-w-4xl px-4"
    >
      <span className="text-gray-900">Ever wondered how </span>
      <span className="text-blue-600">music</span>
      <span className="text-gray-900"> impacts </span>
      <span className="text-blue-600">happiness</span>
      <span className="text-gray-900"> and well-being?</span>
    </motion.h1>
    
    <motion.button
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onStart}
      className="px-8 py-4 bg-blue-600 text-white rounded-full text-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
    >
      Start the Journey
    </motion.button>
  </motion.div>
);

// Navigation Card Component
const NavigationCard = ({ title, description, icon: Icon, path }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-sm p-8 cursor-pointer"
      onClick={() => navigate(path)}
    >
      <div className="flex items-start space-x-4">
        <div className="bg-blue-50 p-3 rounded-xl">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Overview Section Component
const OverviewSection = ({ stats }) => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Music, Happiness, and Mental Well-being
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Exploring the intricate relationships between musical preferences, 
          happiness levels, and psychological well-being across different cultures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Research Focus</h3>
          <p className="text-blue-800">
            Understanding how music consumption correlates with happiness and psychological well-being 
            across different regions and cultures.
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Data Coverage</h3>
          <p className="text-green-800">
            Analysis of {stats?.total_countries || '...'} countries, {' '}
            {stats?.music_features || '...'} music features, and {' '}
            {stats?.wellbeing_metrics || '...'} well-being metrics.
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Key Insights</h3>
          <p className="text-purple-800">
            Discover patterns in how musical preferences relate to mental health 
            and happiness across different demographics.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Main Dashboard Component
const Dashboard = () => {
  const [showHero, setShowHero] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const statsData = await fetchStats();
        if (!statsData) throw new Error('Failed to load dashboard data');
        setStats(statsData);
      } catch (err) {
        setError(err.message);
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (showHero) {
    return <Hero onStart={() => setShowHero(false)} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <OverviewSection stats={stats} />
          
          {/* Stats Overview */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                  icon={GlobeAltIcon}
                  title="Countries Analyzed"
                  value={stats?.total_countries || 0}
                />
                <StatCard 
                  icon={MusicalNoteIcon}
                  title="Music Features"
                  value={stats?.music_features || 0}
                />
                <StatCard 
                  icon={ChartBarIcon}
                  title="Well-being Metrics"
                  value={stats?.wellbeing_metrics || 0}
                />
              </div>
            </div>
          </section>

          {/* Navigation Cards */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Explore the Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <NavigationCard
                  title="Music & Happiness"
                  description="Explore the relationships between musical preferences and well-being metrics."
                  icon={MusicalNoteIcon}
                  path="/music-happiness"
                />
                <NavigationCard
                  title="MHQ Analysis"
                  description="Dive deep into Mental Health Quotient dimensions and their correlations."
                  icon={ChartBarIcon}
                  path="/mhq-analysis"
                />
                <NavigationCard
                  title="Demographics"
                  description="Understand how age, education, and other factors influence well-being."
                  icon={UserGroupIcon}
                  path="/demographics"
                />
                <NavigationCard
                  title="Interactive Explorer"
                  description="Create custom visualizations and explore the data your way."
                  icon={GlobeAltIcon}
                  path="/explore"
                />
              </div>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
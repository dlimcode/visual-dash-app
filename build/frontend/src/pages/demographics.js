// pages/demographics.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { BoxPlot } from '@nivo/boxplot';
import { fetchOverviewData } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const Demographics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Average MHQ Score');

  useEffect(() => {
    const loadData = async () => {
      try {
        const overviewData = await fetchOverviewData();
        setData(overviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderAgeAnalysis = () => {
    if (!data?.regional_averages) return null;

    const ageColumns = ['18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'];
    const chartData = Object.entries(data.regional_averages).map(([region, values]) => ({
      region,
      ...ageColumns.reduce((acc, age) => ({
        ...acc,
        [age]: values[age] || 0
      }), {}),
      mhqScore: values['Average MHQ Score'],
      valence: values.valence,
      energy: values.energy
    }));

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Age Group Analysis</h3>
          <p className="text-gray-600 mb-4">
            Explore how mental well-being and musical preferences vary across different age groups.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              {ageColumns.map((age, index) => (
                <Line
                  key={age}
                  type="monotone"
                  dataKey={age}
                  stroke={`hsl(${(index * 360) / ageColumns.length}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ fill: `hsl(${(index * 360) / ageColumns.length}, 70%, 50%)` }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderEducationImpact = () => {
    if (!data?.regional_averages) return null;

    const educationCols = [
      'Primary Education', 'Some High School', 'High School',
      "Associate's Degree", 'Vocational certification',
      "Bachelor's Degree", "Master's Degree", 'PhD or Doctorate'
    ];

    const chartData = Object.entries(data.regional_averages).map(([region, values]) => ({
      region,
      education: educationCols.map(edu => ({
        level: edu,
        value: values[edu] || 0,
        mhqScore: values['Average MHQ Score'],
        musicFeatures: {
          valence: values.valence,
          energy: values.energy,
          danceability: values.danceability
        }
      }))
    }));

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Education Level Impact</h3>
          <p className="text-gray-600 mb-4">
            Analyze how education levels relate to mental well-being and music preferences.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="value" 
                name="Education Level Score"
                label={{ value: 'Education Level Score', position: 'bottom' }}
              />
              <YAxis 
                dataKey="mhqScore" 
                name="MHQ Score"
                label={{ value: 'Mental Well-being Score', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis 
                dataKey="musicFeatures.valence" 
                range={[50, 400]} 
                name="Musical Valence"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded shadow-lg border">
                      <p className="font-semibold">{data.level}</p>
                      <p>{`MHQ Score: ${data.mhqScore?.toFixed(2)}`}</p>
                      <p>{`Education Score: ${data.value?.toFixed(2)}`}</p>
                      <p>{`Valence: ${data.musicFeatures?.valence?.toFixed(2)}`}</p>
                      <p>{`Energy: ${data.musicFeatures?.energy?.toFixed(2)}`}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              {educationCols.map((edu, index) => (
                <Scatter
                  key={edu}
                  name={edu}
                  data={chartData.flatMap(region => 
                    region.education.filter(e => e.level === edu)
                  )}
                  fill={`hsl(${(index * 360) / educationCols.length}, 70%, 50%)`}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderEmploymentAnalysis = () => {
    if (!data?.regional_averages) return null;

    const employmentCategories = [
      'Employed / Self employed', 'Unemployed', 'Homemaker',
      'Studying', 'Retired', 'Not able to work'
    ];

    const chartData = Object.entries(data.regional_averages).flatMap(([region, values]) =>
      employmentCategories.map(category => ({
        region,
        category,
        value: values[category] || 0,
        mhqScore: values['Average MHQ Score'],
        valence: values.valence,
        energy: values.energy,
        danceability: values.danceability
      }))
    );

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Employment Status Impact</h3>
          <p className="text-gray-600 mb-4">
            Understand how employment status relates to mental well-being and musical preferences.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Population %" fill="#8884d8" />
              <Bar dataKey="mhqScore" name="MHQ Score" fill="#82ca9d" />
              <Bar dataKey="valence" name="Musical Valence" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demographic Influences</h1>
          <p className="mt-2 text-lg text-gray-600">
            Understanding how age, education, and employment status influence mental well-being and musical preferences.
          </p>
        </div>

        {error && <ErrorMessage error={error} />}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {renderAgeAnalysis()}
            {renderEducationImpact()}
            {renderEmploymentAnalysis()}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Demographics;
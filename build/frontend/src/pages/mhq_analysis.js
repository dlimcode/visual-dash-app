// pages/mhq_analysis.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { fetchOverviewData } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

// Add these constants
const MUSIC_FEATURES = [
  'valence',
  'energy',
  'danceability',
  'tempo',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness'
];

const WELLBEING_METRICS = [
  'Life Ladder',
  'Average MHQ Score',
  'Average Cognition Score',
  'Average Drive & Motivation Score',
  'Average Social Self Score',
  'Average Mind-Body Connection Score',
  'Average Adaptability & Resilence Score',
  'Average Mood & Outlook Score'
];

const MHQAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const overviewData = await fetchOverviewData();
        console.log('MHQ Analysis data:', overviewData); // Debug log
        setData(overviewData);
        // Set initial selection
        if (overviewData.regional_averages) {
          setSelectedCountries(Object.keys(overviewData.regional_averages).slice(0, 3));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderRadarChart = () => {
    if (!data?.regional_averages || selectedCountries.length === 0) return null;

    const dimensions = [
      'Average Cognition Score',
      'Average Adaptability & Resilence Score',
      'Average Drive & Motivation Score',
      'Average Mood & Outlook Score',
      'Average Social Self Score',
      'Average Mind-Body Connection Score'
    ];

    const chartData = dimensions.map(dim => ({
      dimension: dim.replace('Average ', '').replace(' Score', ''),
      ...selectedCountries.reduce((acc, country) => ({
        ...acc,
        [country]: data.regional_averages[country][dim] || 0
      }), {})
    }));

    console.log('Radar chart data:', chartData); // Debug log

    return (
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          {selectedCountries.map((country, idx) => (
            <Radar
              key={country}
              name={country}
              dataKey={country}
              stroke={`hsl(${(idx * 360) / selectedCountries.length}, 70%, 50%)`}
              fill={`hsl(${(idx * 360) / selectedCountries.length}, 70%, 50%)`}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderDistributionChart = () => {
    if (!data) return null;

    const categories = [
      '% Distressed', '% Struggling', '% Enduring',
      '% Managing', '% Succeeding', '% Thriving'
    ];

    const distributionData = Object.entries(data.regional_averages || {}).map(([region, values]) => ({
      region,
      ...categories.reduce((acc, category) => ({
        ...acc,
        [category]: values[category] || 0
      }), {})
    }));

    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={distributionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="region" />
          <YAxis />
          <Tooltip />
          <Legend />
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={`hsl(${(index * 360) / categories.length}, 70%, 50%)`}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderCorrelationHeatmap = () => {
    if (!data?.correlations) return null;

    const heatmapData = MUSIC_FEATURES.flatMap(feature => 
      WELLBEING_METRICS.map(metric => ({
        feature,
        metric,
        correlation: data.correlations[`${feature}__${metric}`] || 0,
        z: 1 // Size factor for scatter points
      }))
    );

    console.log('Heatmap data:', heatmapData);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        >
          <XAxis 
            dataKey="metric" 
            type="category"
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            dataKey="feature" 
            type="category"
          />
          <ZAxis 
            dataKey="z" 
            range={[50, 50]} 
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-2 rounded shadow border">
                  <p className="font-semibold">{`${data.feature} vs ${data.metric}`}</p>
                  <p>{`Correlation: ${data.correlation.toFixed(3)}`}</p>
                </div>
              );
            }}
          />
          <Scatter
            data={heatmapData}
            fill={(entry) => {
              const value = entry.correlation;
              const r = 255 * (1 - Math.abs(value));
              const g = 255 * (1 + value) / 2;
              const b = 255 * (1 - Math.abs(value));
              return `rgb(${r}, ${g}, ${b})`;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderMusicPreferencesByMHQCategory = () => {
    if (!data?.regional_averages) return null;

    const mhqCategories = [
      '% Distressed', '% Struggling', '% Enduring',
      '% Managing', '% Succeeding', '% Thriving'
    ];

    const musicFeatures = ['valence', 'energy', 'danceability'];
    
    // Calculate average music features for each MHQ category
    const chartData = Object.entries(data.regional_averages).flatMap(([region, values]) => 
      mhqCategories.map(category => ({
        region,
        category: category.replace('% ', ''),
        percentage: values[category] || 0,
        ...musicFeatures.reduce((acc, feature) => ({
          ...acc,
          [feature]: values[feature] || 0
        }), {})
      }))
    );

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Music Preferences by Mental Well-being Category</h3>
          <p className="text-gray-600 mb-4">
            Explore how musical preferences vary across different mental well-being categories.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="valence" 
                name="Valence"
                label={{ value: 'Valence', position: 'bottom' }}
              />
              <YAxis 
                dataKey="energy" 
                name="Energy"
                label={{ value: 'Energy', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis 
                dataKey="percentage" 
                range={[50, 400]} 
                name="Population Percentage"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded shadow-lg border">
                      <p className="font-semibold">{data.region}</p>
                      <p>{`Category: ${data.category}`}</p>
                      <p>{`Population: ${data.percentage.toFixed(1)}%`}</p>
                      <p>{`Valence: ${data.valence.toFixed(2)}`}</p>
                      <p>{`Energy: ${data.energy.toFixed(2)}`}</p>
                      <p>{`Danceability: ${data.danceability.toFixed(2)}`}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              {mhqCategories.map((category, index) => (
                <Scatter
                  key={category}
                  name={category.replace('% ', '')}
                  data={chartData.filter(d => d.category === category.replace('% ', ''))}
                  fill={`hsl(${(index * 360) / mhqCategories.length}, 70%, 50%)`}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-500">
            <p>* Bubble size represents percentage of population in each category</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMHQMusicCorrelations = () => {
    if (!data?.correlations) return null;

    const mhqDimensions = [
      'Average Cognition Score',
      'Average Drive & Motivation Score',
      'Average Social Self Score',
      'Average Mind-Body Connection Score',
      'Average Adaptability & Resilence Score',
      'Average Mood & Outlook Score'
    ];

    // Calculate correlations between MHQ dimensions and music features
    const correlationData = MUSIC_FEATURES.flatMap(feature => 
      mhqDimensions.map(dimension => ({
        feature,
        dimension: dimension.replace('Average ', '').replace(' Score', ''),
        correlation: data.correlations[`${feature}__${dimension}`] || 0
      }))
    );

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">MHQ Dimensions and Music Feature Correlations</h3>
          <p className="text-gray-600 mb-4">
            Explore how different MHQ dimensions correlate with musical characteristics.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={correlationData}
              layout="vertical"
              margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[-1, 1]} />
              <YAxis dataKey="dimension" type="category" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded shadow-lg border">
                      <p className="font-semibold">{data.dimension}</p>
                      <p>{`${data.feature}: ${data.correlation.toFixed(3)}`}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar 
                dataKey="correlation" 
                fill="#8884d8"
                name="Correlation Strength"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-500">
            <p>* Values range from -1 (strong negative correlation) to 1 (strong positive correlation)</p>
          </div>
        </div>
      </div>
    );
  };

  // Add new feature: Analysis of Music Impact on MHQ Scores
  const renderMusicImpactAnalysis = () => {
    if (!data?.regional_averages) return null;

    // Group regions by high/medium/low MHQ scores
    const regions = Object.entries(data.regional_averages)
      .map(([region, values]) => ({
        region,
        mhqScore: values['Average MHQ Score'],
        valence: values.valence,
        energy: values.energy,
        danceability: values.danceability,
        category: values['Average MHQ Score'] >= 75 ? 'High MHQ' :
                 values['Average MHQ Score'] >= 50 ? 'Medium MHQ' : 'Low MHQ'
      }))
      .sort((a, b) => b.mhqScore - a.mhqScore);

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Music Features Impact on Mental Well-being</h3>
          <p className="text-gray-600 mb-4">
            Analysis of how different music characteristics relate to overall mental well-being scores.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="valence" 
                name="Musical Positivity"
                label={{ value: 'Musical Positivity (Valence)', position: 'bottom' }}
              />
              <YAxis 
                dataKey="mhqScore" 
                name="MHQ Score"
                label={{ value: 'Mental Well-being Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 rounded shadow-lg border">
                      <p className="font-semibold">{data.region}</p>
                      <p>{`MHQ Score: ${data.mhqScore.toFixed(1)}`}</p>
                      <p>{`Valence: ${data.valence.toFixed(2)}`}</p>
                      <p>{`Energy: ${data.energy.toFixed(2)}`}</p>
                      <p>{`Danceability: ${data.danceability.toFixed(2)}`}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              {['High MHQ', 'Medium MHQ', 'Low MHQ'].map((category, index) => (
                <Scatter
                  key={category}
                  name={category}
                  data={regions.filter(r => r.category === category)}
                  fill={`hsl(${index * 120}, 70%, 50%)`}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Add new feature: MHQ Dimension Patterns
  const renderMHQPatternAnalysis = () => {
    if (!data?.regional_averages) return null;

    const mhqDimensions = [
      'Cognition',
      'Adaptability & Resilence',
      'Drive & Motivation',
      'Mood & Outlook',
      'Social Self',
      'Mind-Body Connection'
    ];

    const musicFeatures = ['valence', 'energy', 'danceability'];
    
    // Calculate correlations between dimensions and music features
    const patternData = mhqDimensions.map(dimension => {
      const dimensionKey = `Average ${dimension} Score`;
      return {
        dimension,
        ...musicFeatures.reduce((acc, feature) => ({
          ...acc,
          [feature]: Object.values(data.regional_averages)
            .reduce((sum, region) => sum + (
              region[feature] * region[dimensionKey]
            ), 0) / Object.keys(data.regional_averages).length
        }), {})
      };
    });

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">MHQ Dimension Patterns</h3>
          <p className="text-gray-600 mb-4">
            Patterns showing how different aspects of mental well-being relate to music characteristics.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={patternData}
              layout="vertical"
              margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 1]} />
              <YAxis dataKey="dimension" type="category" />
              <Tooltip />
              <Legend />
              {musicFeatures.map((feature, index) => (
                <Bar
                  key={feature}
                  dataKey={feature}
                  name={feature.charAt(0).toUpperCase() + feature.slice(1)}
                  fill={`hsl(${index * 120}, 70%, 50%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-500">
            <p>* Values show average relationship strength between music features and MHQ dimensions</p>
          </div>
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
        <h1 className="text-3xl font-bold mb-8">Mental Health Quotient Analysis</h1>
        
        {error && <ErrorMessage error={error} />}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">MHQ Dimensions Comparison</h2>
              {renderRadarChart()}
            </section>

            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">MHQ Distribution by Region</h2>
              {renderDistributionChart()}
            </section>

            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">Music Preferences by MHQ Category</h2>
              {renderMusicPreferencesByMHQCategory()}
            </section>

            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">MHQ and Music Correlations</h2>
              {renderMHQMusicCorrelations()}
            </section>

            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">Music Impact Analysis</h2>
              {renderMusicImpactAnalysis()}
            </section>

            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">MHQ Pattern Analysis</h2>
              {renderMHQPatternAnalysis()}
            </section>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MHQAnalysis;
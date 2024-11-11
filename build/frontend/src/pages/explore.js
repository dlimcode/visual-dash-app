// pages/explore.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { fetchFeatureData } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

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

// Add preset analysis configurations
const PRESET_ANALYSES = {
  musicHappiness: {
    title: "Music Features vs Happiness",
    description: "Explore how musical characteristics correlate with happiness levels",
    xAxis: "valence",
    yAxis: "Life Ladder",
    colorBy: "region"
  },
  mhqMusic: {
    title: "Music Impact on Mental Well-being",
    description: "Analyze relationships between music features and MHQ scores",
    xAxis: "energy",
    yAxis: "Average MHQ Score",
    colorBy: "region"
  },
  regionalPatterns: {
    title: "Regional Music Patterns",
    description: "Compare musical preferences across different regions",
    xAxis: "danceability",
    yAxis: "Average Social Self Score",
    colorBy: "region"
  }
};

const Explore = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [xAxis, setXAxis] = useState('valence');
  const [yAxis, setYAxis] = useState('Life Ladder');
  const [colorBy, setColorBy] = useState('region');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showTrendline, setShowTrendline] = useState(false);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [statisticalSummary, setStatisticalSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFeatureData();
        
        if (!response) {
          throw new Error('No data received');
        }

        setData(response);
        setFilteredRegions(Array.from(new Set(response.region)));
      } catch (err) {
        console.error('Data fetching error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data && data[xAxis] && data[yAxis]) {
      calculateStatistics();
    }
  }, [data, xAxis, yAxis, filteredRegions]);

  const calculateStatistics = () => {
    const filteredIndices = data.region
      .map((r, i) => filteredRegions.includes(r) ? i : -1)
      .filter(i => i !== -1);

    const xValues = filteredIndices.map(i => data[xAxis][i]);
    const yValues = filteredIndices.map(i => data[yAxis][i]);

    // Calculate correlation
    const correlation = calculateCorrelation(xValues, yValues);
    
    // Calculate means
    const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;

    setStatisticalSummary({
      correlation,
      xMean,
      yMean,
      sampleSize: filteredIndices.length
    });
  };

  const calculateCorrelation = (x, y) => {
    const n = x.length;
    const sum1 = x.reduce((a, b) => a + b, 0);
    const sum2 = y.reduce((a, b) => a + b, 0);
    const sum1Sq = x.reduce((a, b) => a + b * b, 0);
    const sum2Sq = y.reduce((a, b) => a + b * b, 0);
    const pSum = x.map((x, i) => x * y[i]).reduce((a, b) => a + b, 0);
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    return num / den;
  };

  const handlePresetSelect = (presetKey) => {
    const preset = PRESET_ANALYSES[presetKey];
    setSelectedPreset(presetKey);
    setXAxis(preset.xAxis);
    setYAxis(preset.yAxis);
    setColorBy(preset.colorBy);
  };

  const renderControls = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Preset Analysis Selection */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Preset Analyses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PRESET_ANALYSES).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedPreset === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-medium">{preset.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Analysis Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis Feature
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {MUSIC_FEATURES.map(feature => (
                <option key={feature} value={feature}>
                  {feature.charAt(0).toUpperCase() + feature.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis Metric
            </label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {WELLBEING_METRICS.map(metric => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color By
            </label>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="region">Region</option>
              <option value="track_genre">Genre</option>
            </select>
          </div>
        </div>

        {/* Analysis Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showTrendline}
              onChange={(e) => setShowTrendline(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Show Trendline</span>
          </label>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Regions
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from(new Set(data.region)).map(region => (
              <label key={region} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filteredRegions.includes(region)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilteredRegions([...filteredRegions, region]);
                    } else {
                      setFilteredRegions(filteredRegions.filter(r => r !== region));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">{region}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVisualization = () => {
    if (!data || !data[xAxis] || !data[yAxis]) return null;

    // Filter data based on selected regions
    const filteredData = data[xAxis].map((value, index) => {
      if (filteredRegions.includes(data.region[index])) {
        return {
          [xAxis]: value,
          [yAxis]: data[yAxis][index],
          [colorBy]: data[colorBy][index],
          region: data.region[index]
        };
      }
      return null;
    }).filter(Boolean);

    return (
      <div className="space-y-4">
        {/* Statistical Summary */}
        {statisticalSummary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Statistical Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Correlation</p>
                <p className="font-medium">{statisticalSummary.correlation.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{xAxis} Mean</p>
                <p className="font-medium">{statisticalSummary.xMean.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{yAxis} Mean</p>
                <p className="font-medium">{statisticalSummary.yMean.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sample Size</p>
                <p className="font-medium">{statisticalSummary.sampleSize}</p>
              </div>
            </div>
          </div>
        )}

        {/* Visualization */}
        <ResponsiveContainer width="100%" height={600}>
          <ComposedChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxis} 
              name={xAxis}
              label={{ 
                value: xAxis.charAt(0).toUpperCase() + xAxis.slice(1), 
                position: 'bottom',
                offset: 40
              }}
            />
            <YAxis 
              dataKey={yAxis} 
              name={yAxis}
              label={{ 
                value: yAxis, 
                angle: -90, 
                position: 'insideLeft',
                offset: 40
              }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-4 rounded shadow-lg border">
                    <p className="font-semibold">{data.region}</p>
                    <p>{`${xAxis}: ${data[xAxis]?.toFixed(2)}`}</p>
                    <p>{`${yAxis}: ${data[yAxis]?.toFixed(2)}`}</p>
                    <p>{`${colorBy}: ${data[colorBy]}`}</p>
                  </div>
                );
              }}
            />
            <Legend />
            <Scatter
              data={filteredData}
              fill="#8884d8"
            />
            {showTrendline && (
              <Line
                type="monotone"
                data={filteredData}
                dataKey={yAxis}
                stroke="#ff7300"
                dot={false}
                activeDot={false}
                legendType="none"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
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
        <h1 className="text-3xl font-bold mb-8">Interactive Data Exploration</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Controls</h2>
              {renderControls()}
            </section>

            <section className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-xl font-semibold mb-4">Visualization</h2>
              {renderVisualization()}
            </section>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Explore;
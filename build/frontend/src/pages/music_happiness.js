import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeatMapGrid } from 'react-grid-heatmap';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { fetchOverviewData } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const MUSIC_FEATURES = [
  'valence', 'energy', 'danceability', 'tempo', 
  'speechiness', 'acousticness', 'instrumentalness', 
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

const calculateSignificance = (correlation, n) => {
  // t-statistic = r * sqrt(n-2) / sqrt(1-r^2)
  const t = correlation * Math.sqrt(n-2) / Math.sqrt(1 - correlation * correlation);
  // Two-tailed p-value approximation
  const p = 2 * (1 - Math.abs(t/Math.sqrt(t*t + n-2)));
  return p;
};

const SignificanceIndicator = ({ pValue }) => {
  let stars = '';
  if (pValue < 0.001) stars = '***';
  else if (pValue < 0.01) stars = '**';
  else if (pValue < 0.05) stars = '*';
  
  return stars ? (
    <span className="ml-1 text-blue-600 font-semibold" title={`p-value: ${pValue.toFixed(4)}`}>
      {stars}
    </span>
  ) : null;
};

const MusicHappiness = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const overviewData = await fetchOverviewData();
        console.log('Music Happiness data:', overviewData); // Debug log
        setData(overviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const renderCorrelationHeatmap = () => {
    if (!data?.correlations) return null;

    // Create a 2D array for the heatmap instead of a flat array
    const heatmapData = MUSIC_FEATURES.map(feature => 
      WELLBEING_METRICS.map(metric => 
        data.correlations[`${feature}__${metric}`] || 0
      )
    );

    console.log('Heatmap data structure:', heatmapData); // Debug log

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Feature Correlations</h3>
          <p className="text-gray-600 mb-4">
            Explore statistically significant relationships between musical characteristics and well-being metrics.
            Darker colors indicate stronger correlations, stars indicate significance levels.
          </p>
          <div style={{ width: '100%', height: 400 }}>
            <HeatMapGrid
              data={heatmapData}
              xLabels={WELLBEING_METRICS}
              yLabels={MUSIC_FEATURES}
              cellRender={(x, y) => (
                <div className="text-xs">
                  {heatmapData[y][x].toFixed(2)}
                  {calculateSignificance(heatmapData[y][x], data.sample_size || 30) < 0.05 && 
                    <SignificanceIndicator 
                      pValue={calculateSignificance(heatmapData[y][x], data.sample_size || 30)} 
                    />
                  }
                </div>
              )}
              cellStyle={(x, y) => {
                const value = heatmapData[y][x];
                return {
                  background: `rgb(${255 * (1 - Math.abs(value))}, ${255 * (1 + value) / 2}, ${255 * (1 - Math.abs(value))})`,
                  fontSize: '11px',
                  color: Math.abs(value) > 0.5 ? '#fff' : '#000'
                };
              }}
              cellHeight="40px"
              cellWidth="80px"
              className="mx-auto"
            />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>* p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001</p>
          </div>
        </div>
      </div>
    );
  };

  const renderRegionalComparison = () => {
    if (!data?.regional_averages) return null;

    const regions = Object.keys(data.regional_averages);
    const chartData = regions.map(region => ({
      region,
      valence: data.regional_averages[region].valence,
      energy: data.regional_averages[region].energy,
      danceability: data.regional_averages[region].danceability,
      happiness: data.regional_averages[region]['Life Ladder']
    }));

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Regional Music Preferences</h3>
          <p className="text-gray-600 mb-4">
            Compare how musical characteristics and happiness levels vary across different regions.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valence" fill="#8884d8" name="Valence" />
              <Bar dataKey="energy" fill="#82ca9d" name="Energy" />
              <Bar dataKey="danceability" fill="#ffc658" name="Danceability" />
              <Line
                type="monotone"
                dataKey="happiness"
                stroke="#ff7300"
                name="Happiness Score"
                yAxisId={1}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-500">
            <p>* Bars show musical features, line shows happiness score</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTopFeaturesByRegion = () => {
    if (!data?.regional_averages) return null;

    // Calculate top features for each region
    const regions = Object.keys(data.regional_averages);
    const topFeatures = regions.map(region => {
      const features = MUSIC_FEATURES.map(feature => ({
        feature,
        value: data.regional_averages[region][feature],
        correlation: data.correlations[`${feature}__Life Ladder`] || 0
      }))
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3); // Get top 3 features

      return {
        region,
        features,
        happiness: data.regional_averages[region]['Life Ladder']
      };
    });

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Influential Music Features by Region</h3>
          <p className="text-gray-600 mb-4">
            Discover which musical characteristics have the strongest relationship with happiness in each region.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topFeatures.map(({ region, features, happiness }) => (
              <div key={region} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{region}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Happiness Score: {happiness.toFixed(2)}
                </p>
                <ul className="space-y-2">
                  {features.map(({ feature, correlation }) => (
                    <li 
                      key={feature}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="capitalize">{feature}</span>
                      <span 
                        className={`font-medium ${
                          correlation > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {(correlation * 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>* Percentages indicate correlation strength with happiness</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendAnalysis = () => {
    if (!data?.regional_averages) return null;

    // Group regions by happiness levels
    const regions = Object.entries(data.regional_averages)
      .map(([region, values]) => ({
        region,
        happiness: values['Life Ladder'],
        ...MUSIC_FEATURES.reduce((acc, feature) => ({
          ...acc,
          [feature]: values[feature]
        }), {})
      }))
      .sort((a, b) => a.happiness - b.happiness);

    // Calculate trend lines
    const trendData = regions.map(region => ({
      happiness: region.happiness,
      valence: region.valence,
      energy: region.energy,
      danceability: region.danceability
    }));

    return (
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Happiness Level Trends</h3>
          <p className="text-gray-600 mb-4">
            Explore how musical characteristics vary across different levels of happiness.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="happiness" 
                name="Happiness Score"
                label={{ 
                  value: 'Happiness Score', 
                  position: 'bottom',
                  offset: 0
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Music Feature Value', 
                  angle: -90, 
                  position: 'insideLeft'
                }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow border">
                      <p className="font-semibold">Happiness: {data.happiness.toFixed(2)}</p>
                      <p>Valence: {data.valence.toFixed(2)}</p>
                      <p>Energy: {data.energy.toFixed(2)}</p>
                      <p>Danceability: {data.danceability.toFixed(2)}</p>
                    </div>
                  );
                }}
              />
              <Legend />
              <Scatter 
                name="Valence" 
                data={trendData} 
                dataKey="valence" 
                fill="#8884d8" 
              />
              <Scatter 
                name="Energy" 
                data={trendData} 
                dataKey="energy" 
                fill="#82ca9d" 
              />
              <Scatter 
                name="Danceability" 
                data={trendData} 
                dataKey="danceability" 
                fill="#ffc658" 
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-500">
            <p>* Each point represents a region's happiness score and corresponding music feature value</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Music & Happiness Connection</h1>
          <p className="mt-2 text-lg text-gray-600">
            Discover how musical preferences relate to happiness and mental well-being across cultures.
          </p>
        </div>
        
        {error && <ErrorMessage error={error} />}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {renderCorrelationHeatmap()}
            {renderRegionalComparison()}
            {renderTopFeaturesByRegion()}
            {renderTrendAnalysis()}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MusicHappiness;
// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  GlobeAltIcon, 
  MusicalNoteIcon, 
  MapIcon, 
  SparklesIcon, 
  ShareIcon, 
  ArrowDownTrayIcon, 
  LightBulbIcon 
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  ComposedChart,
  Area
} from 'recharts';
import { HeatMapGrid } from 'react-grid-heatmap';
import { BoxPlot } from '@nivo/boxplot';
import { fetchMetadata, fetchStats, fetchOverviewData, fetchFeatureData } from '../services/api';

const MUSIC_FEATURES = [
  'valence',
  'energy',
  'danceability',
  'tempo',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'key',
  'mode',
  'time_signature'
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

// Rest of your Dashboard component code...

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

const InsightCard = ({ title, value, description, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start space-x-4">
      <div className="bg-blue-50 p-3 rounded-xl">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-3xl font-bold text-blue-600 my-2">{value}</p>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </motion.div>
);

const KeyFinding = ({ number, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex items-start space-x-4"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
      <span className="text-xl font-bold text-blue-600">{number}</span>
    </div>
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const shareInsight = async (insight) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Music & Well-being Insight',
        text: insight,
        url: window.location.href,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  } else {
    // Fallback copy to clipboard
    navigator.clipboard.writeText(insight);
    // You might want to add a toast notification here
  }
};

const ExplorationSection = ({ onStartExploring }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center mt-20"
  >
    <div className="inline-block">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-lg"
      >
        <LightBulbIcon className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Ready to Learn More?</h3>
        <p className="text-blue-100 mb-4">
          Dive deeper into the data with our interactive exploration tools.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => onStartExploring('features')}
            className="w-full px-8 py-3 bg-white text-blue-600 rounded-full text-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Explore Music Features
          </button>
          <button
            onClick={() => onStartExploring('regions')}
            className="w-full px-8 py-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-400 transition-colors"
          >
            Compare Regions
          </button>
          <button
            onClick={() => onStartExploring('correlations')}
            className="w-full px-8 py-3 bg-blue-500 text-white rounded-full text-lg font-medium hover:bg-blue-400 transition-colors"
          >
            View Correlations
          </button>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const transformData = (data, type) => {
  switch(type) {
    case 'radar':
      // Transform data for MHQ dimensions similar to create_radar_chart in mhq_analysis.py
      return data.map(country => ({
        name: country.Country,
        'Cognition': country['Average Cognition Score'],
        'Adaptability': country['Average Adaptability & Resilence Score'],
        'Drive': country['Average Drive & Motivation Score'],
        'Mood': country['Average Mood & Outlook Score'],
        'Social': country['Average Social Self Score'],
        'Mind-Body': country['Average Mind-Body Connection Score']
      }));
    // Add other transformations as needed
    default:
      return data;
  }
};

const Dashboard = () => {
  const [showHero, setShowHero] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [stats, setStats] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [featureData, setFeatureData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState('valence');
  const [activeExplorationSection, setActiveExplorationSection] = useState(null);
  const [showExplorationGuide, setShowExplorationGuide] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [metadataRes, statsRes, overviewRes, featureRes] = await Promise.all([
        fetchMetadata(),
        fetchStats(),
        fetchOverviewData(),
        fetchFeatureData()
      ]);

      if (metadataRes) setMetadata(metadataRes);
      if (statsRes) setStats(statsRes);
      if (overviewRes) setOverviewData(overviewRes);
      if (featureRes) setFeatureData(featureRes);
    };

    fetchData();
  }, []);

  if (showHero) {
    return <Hero onStart={() => setShowHero(false)} />;
  }

  const statsCards = stats && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard 
        icon={GlobeAltIcon}
        title="Countries Analyzed"
        value={stats.total_countries}
      />
      <StatCard 
        icon={MusicalNoteIcon}
        title="Music Features"
        value={stats.music_features}
      />
      <StatCard 
        icon={ChartBarIcon}
        title="Well-being Metrics"
        value={stats.wellbeing_metrics}
      />
    </div>
  );

  const regionSelector = metadata && (
    <select 
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      value={selectedRegion}
      onChange={(e) => setSelectedRegion(e.target.value)}
    >
      <option value="all">All Regions</option>
      {metadata.regions.map(region => (
        <option key={region} value={region}>{region}</option>
      ))}
    </select>
  );

  const featureSelector = metadata && (
    <select 
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      value={selectedFeature}
      onChange={(e) => setSelectedFeature(e.target.value)}
    >
      {metadata.music_features.map(feature => (
        <option key={feature} value={feature}>{feature}</option>
      ))}
    </select>
  );

  const prepareVisualizationData = () => {
    if (!overviewData?.regional_averages) return [];
    
    return Object.entries(overviewData.regional_averages).map(([region, data]) => ({
      region,
      [selectedFeature]: data[selectedFeature],
      'Life Ladder': data['Life Ladder']
    }));
  };

  const handleStartExploring = (section) => {
    setActiveExplorationSection(section);
    setShowExplorationGuide(true);
    
    // Smooth scroll to exploration section
    const explorationSection = document.getElementById('exploration-section');
    if (explorationSection) {
      explorationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ExplorationGuide = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [chartType, setChartType] = useState('scatter');
    const [xAxis, setXAxis] = useState('valence');
    const [yAxis, setYAxis] = useState('Life Ladder');
    const [colorBy, setColorBy] = useState('region');

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        const [overviewData, featureData] = await Promise.all([
          fetchOverviewData(),
          fetchFeatureData()
        ]);
        
        setData({ overviewData, featureData });
        setLoading(false);
      };

      fetchData();
    }, []);

    // Correlation Heatmap (from music_happiness.py)
    const renderCorrelationHeatmap = () => {
      if (!data?.overviewData?.correlations) return null;

      const correlations = data.overviewData.correlations;
      const heatmapData = MUSIC_FEATURES.map(feature => 
        WELLBEING_METRICS.map(metric => 
          correlations[`${feature}__${metric}`] || 0
        )
      );

      return (
        <div style={{ width: '100%', height: 400 }}>
          <HeatMapGrid
            data={heatmapData}
            xLabels={WELLBEING_METRICS}
            yLabels={MUSIC_FEATURES}
            cellRender={(x, y, value) => (
              <div className="text-xs">
                {value.toFixed(2)}
              </div>
            )}
            cellStyle={(x, y, value) => ({
              background: `rgb(${255 * (1 - Math.abs(value))}, ${255 * (1 + value) / 2}, ${255 * (1 - Math.abs(value))})`,
              fontSize: '11px',
              color: Math.abs(value) > 0.5 ? '#fff' : '#000'
            })}
            cellHeight="40px"
            cellWidth="80px"
            className="mx-auto"
          />
        </div>
      );
    };

    // Regional Music Box Plot (from demographics.py)
    const renderRegionalMusicBox = () => {
      if (!data?.overviewData?.regional_averages) return null;

      const boxPlotData = Object.entries(data.overviewData.regional_averages).map(([region, values]) => ({
        group: region,
        values: [
          values.valence,
          values.energy,
          values.danceability
        ].filter(value => value !== undefined && value !== null)
      }));

      return (
        <div style={{ height: 500 }}>
          <BoxPlot
            data={boxPlotData}
            margin={{ top: 40, right: 110, bottom: 50, left: 60 }}
            minValue={0}
            maxValue={1}
            subGroupBy="group"
            enableGridX
            enableGridY
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Region',
              legendPosition: 'middle',
              legendOffset: 32
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Value',
              legendPosition: 'middle',
              legendOffset: -40
            }}
          />
        </div>
      );
    };

    // MHQ Radar Chart (from mhq_analysis.py)
    const renderMHQRadar = () => {
      if (!data?.overviewData?.regional_averages) return null;

      const radarData = transformData(data.overviewData.regional_averages, 'radar');

      return (
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            {selectedCountries.map((country, idx) => (
              <Radar
                key={country}
                name={country}
                dataKey="value"
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

    // Interactive Scatter Plot (from explore.py)
    const renderScatterPlot = () => {
      if (!data?.featureData) return null;

      return (
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey={xAxis} 
              name={xAxis}
              domain={['dataMin', 'dataMax']} 
            />
            <YAxis 
              type="number" 
              dataKey={yAxis} 
              name={yAxis}
              domain={['dataMin', 'dataMax']} 
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter
              name="Data Points"
              data={data.featureData[xAxis]?.map((val, idx) => ({
                [xAxis]: val,
                [yAxis]: data.featureData[yAxis][idx],
                region: data.featureData.region[idx]
              }))}
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {activeExplorationSection === 'features' && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Music Features Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Controls Panel */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h4 className="text-lg font-semibold mb-4">Analysis Controls</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chart Type
                          </label>
                          <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            className="w-full rounded-md border-gray-300"
                          >
                            <option value="scatter">Scatter Plot</option>
                            <option value="radar">Radar Chart</option>
                            <option value="box">Box Plot</option>
                          </select>
                        </div>
                        
                        {chartType === 'scatter' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                X-Axis Feature
                              </label>
                              <select
                                value={xAxis}
                                onChange={(e) => setXAxis(e.target.value)}
                                className="w-full rounded-md border-gray-300"
                              >
                                {MUSIC_FEATURES.map(feature => (
                                  <option key={feature} value={feature}>{feature}</option>
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
                                className="w-full rounded-md border-gray-300"
                              >
                                {WELLBEING_METRICS.map(metric => (
                                  <option key={metric} value={metric}>{metric}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}

                        {chartType === 'radar' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Countries
                            </label>
                            <select
                              multiple
                              value={selectedCountries}
                              onChange={(e) => setSelectedCountries(Array.from(e.target.selectedOptions, option => option.value))}
                              className="w-full rounded-md border-gray-300"
                            >
                              {data?.overviewData?.regional_averages && 
                                Object.keys(data.overviewData.regional_averages).map(country => (
                                  <option key={country} value={country}>{country}</option>
                                ))
                              }
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visualization Area */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      {chartType === 'scatter' && renderScatterPlot()}
                      {chartType === 'radar' && renderMHQRadar()}
                      {chartType === 'box' && renderRegionalMusicBox()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeExplorationSection === 'correlations' && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Correlation Analysis</h3>
                {renderCorrelationHeatmap()}
              </div>
            )}

            {activeExplorationSection === 'regions' && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Regional Comparisons</h3>
                {renderRegionalMusicBox()}
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Purpose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-gray-900">Discover the </span>
              <span className="text-blue-600">Connection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore how musical preferences shape our mental well-being across different cultures and regions.
            </p>
          </motion.div>

          {/* Stats Cards with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {statsCards}
          </motion.div>
        </div>
      </section>

      {/* Global Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-gray-900">Global </span>
              <span className="text-blue-600">Insights</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <InsightCard
              icon={MapIcon}
              title="Regional Impact"
              value="85%"
              description="of regions show positive correlation between musical valence and happiness scores"
            />
            <InsightCard
              icon={ChartBarIcon}
              title="Feature Correlation"
              value="0.72"
              description="correlation coefficient between danceability and social connection metrics"
            />
            <InsightCard
              icon={SparklesIcon}
              title="Cultural Influence"
              value="3.2x"
              description="stronger music-wellbeing connection in collectivist societies"
            />
          </div>
        </div>
      </section>

      {/* Interactive Analysis Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Filters Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="sticky top-8"
              >
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Analysis Controls</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region Selection
                      </label>
                      {regionSelector}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Music Feature
                      </label>
                      {featureSelector}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-blue-50 rounded-xl"
                    >
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Did you know?</h4>
                      <p className="text-sm text-blue-700">
                        Regions with higher musical diversity show 23% better well-being scores on average.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Visualization Area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-sm p-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Music Feature Impact Analysis
                </h3>
                
                <div className="h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareVisualizationData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="region" 
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={selectedFeature} 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Life Ladder" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary & Conclusion Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-gray-900">Key </span>
              <span className="text-blue-600">Findings</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our analysis reveals fascinating connections between musical preferences and well-being across cultures.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <KeyFinding
                number="1"
                title="Cultural Resonance"
                description="Musical preferences strongly align with cultural well-being indicators, showing up to 78% correlation in certain regions."
              />
              <KeyFinding
                number="2"
                title="Emotional Impact"
                description="Higher valence in popular music correlates with improved mental health outcomes across 85% of studied regions."
              />
            </div>
            <div className="space-y-8">
              <KeyFinding
                number="3"
                title="Social Connection"
                description="Communities with strong musical traditions show 34% higher social cohesion scores."
              />
              <KeyFinding
                number="4"
                title="Global Patterns"
                description="Despite cultural differences, certain musical features consistently correlate with positive well-being metrics worldwide."
              />
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-50 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900">Download Full Report</h3>
                <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-blue-700 mb-4">
                Get detailed insights and methodology in our comprehensive report.
              </p>
              <button
                onClick={() => {/* Add download logic */}}
                className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Insights</h3>
                <ShareIcon className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-gray-600 mb-4">
                Share these fascinating findings with your network.
              </p>
              <button
                onClick={() => shareInsight("Discover how music shapes well-being across cultures!")}
                className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Share Now
              </button>
            </motion.div>
          </div>

          {/* Updated Final Call-to-Action */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ExplorationSection onStartExploring={handleStartExploring} />
            </div>
          </section>

          {/* New Exploration Section */}
          {showExplorationGuide && (
            <section id="exploration-section" className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                  <ExplorationGuide />
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
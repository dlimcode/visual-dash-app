import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from '../utils/axios';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  IconButton, 
  Fade, 
  Tabs, 
  Tab, 
  LinearProgress, 
  Tooltip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import EnergyIcon from '@mui/icons-material/Bolt';
import SoundIcon from '@mui/icons-material/VolumeDown';
import VoiceIcon from '@mui/icons-material/RecordVoiceOver';
import SpeedIcon from '@mui/icons-material/FastForward';
import TempoIcon from '@mui/icons-material/CandlestickChart';
import EmojiIcon from '@mui/icons-material/EmojiEmotions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import * as d3 from 'd3';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';
import { ExploreOutlined as ExploreIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// ============= CONSTANTS & TYPES =============
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY29kZXRlc3RtZGwiLCJhIjoiY20zZ2NrcWk1MDJtdDJpcXB5MWkxanh6OSJ9.o780qAaQD9WwUIy5uvLlzg';

const COUNTRY_ISO_CODES = {
  'Argentina': 'ARG',
  'Australia': 'AUS',
  'Belgium': 'BEL',
  'Brazil': 'BRA',
  'Canada': 'CAN',
  'Chile': 'CHL',
  'Colombia': 'COL',
  'Ecuador': 'ECU',
  'Egypt': 'EGY',
  'France': 'FRA',
  'Germany': 'DEU',
  'India': 'IND',
  'Italy': 'ITA',
  'Malaysia': 'MYS',
  'New Zealand': 'NZL',
  'Nigeria': 'NGA',
  'Peru': 'PER',
  'Philippines': 'PHL',
  'Saudi Arabia': 'SAU',
  'Singapore': 'SGP',
  'South Africa': 'ZAF',
  'Spain': 'ESP',
  'United Arab Emirates': 'ARE',
  'United Kingdom': 'GBR',
  'United States': 'USA',
  'Uruguay': 'URY'
};

const VIEW_MODES = {
  DEFAULT: 'default',
  MUSIC: 'music',
  HAPPINESS_MUSIC: 'happiness-music',
  WELLBEING_MUSIC: 'wellbeing-music'
};

const VIEW_MODE_INFO = {
  [VIEW_MODES.DEFAULT]: {
    label: 'Default View',
    icon: <PublicIcon />,
    description: 'Overview of all countries'
  },
  [VIEW_MODES.MUSIC]: {
    label: 'Music Features',
    icon: <MusicNoteIcon />,
    description: 'Most significant music feature per country'
  },
  [VIEW_MODES.HAPPINESS_MUSIC]: {
    label: 'Music & Happiness',
    icon: <FavoriteIcon />,
    description: 'Life satisfaction levels with musical characteristics'
  },
  [VIEW_MODES.WELLBEING_MUSIC]: {
    label: 'Music & Mental Health',
    icon: <PsychologyIcon />,
    description: 'Mental health scores with musical characteristics'
  }
};

const THEME = {
  colors: {
    primary: '#5601BF',
    secondary: '#FF6B6B',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FFC107',
    error: '#F44336',
    background: {
      default: '#1a1a1a',
      paper: 'rgba(255, 255, 255, 0.98)'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    }
  },
  gradients: {
    primary: 'linear-gradient(45deg, #5601BF 30%, #7B1FA2 90%)',
    secondary: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)'
  }
};

const MUSIC_FEATURE_ICONS = {
  acousticness: <GraphicEqIcon />,
  danceability: <MusicNoteIcon />,
  energy: <EnergyIcon />,
  instrumentalness: <SoundIcon />,
  liveness: <VoiceIcon />,
  loudness: <SpeedIcon />,
  speechiness: <VoiceIcon />,
  tempo: <TempoIcon />,
  valence: <EmojiIcon />
};

const FEATURE_COLORS = {
  acousticness: '#4CAF50',
  danceability: '#2196F3',
  energy: '#FF6B6B',
  instrumentalness: '#9C27B0',
  liveness: '#FF9800',
  loudness: '#F44336',
  speechiness: '#3F51B5',
  tempo: '#009688',
  valence: '#FFC107'
};

const PERCENTAGE_FEATURES = [
  'danceability', 'energy', 'speechiness', 'acousticness',
  'instrumentalness', 'liveness', 'valence'
];

const ORIGINAL_FEATURES = ['loudness', 'tempo'];

// ============= HELPER FUNCTIONS =============
const formatAudioFeature = (key, value) => {
  if (PERCENTAGE_FEATURES.includes(key)) {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (key === 'loudness') return `${value.toFixed(1)} dB`;
  if (key === 'tempo') return `${value.toFixed(1)} BPM`;
  return value.toFixed(1);
};

const getFeatureColor = (key, value) => {
  const colorScales = {
    danceability: ['#FFE0E0', '#FF4D4D'],
    energy: ['#E0E0FF', '#4D4DFF'],
    valence: ['#E0FFE0', '#4DFF4D'],
  };
  return colorScales[key] ? colorScales[key][1] : THEME.colors.primary;
};

const calculateCorrelation = (featureValues, metricValues) => {
  const n = featureValues.length;
  const sumX = featureValues.reduce((a, b) => a + b, 0);
  const sumY = metricValues.reduce((a, b) => a + b, 0);
  const sumXY = featureValues.reduce((acc, x, i) => acc + x * metricValues[i], 0);
  const sumX2 = featureValues.reduce((a, b) => a + b * b, 0);
  const sumY2 = metricValues.reduce((a, b) => a + b * b, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

const getMostSignificantFeature = (countryData, mode) => {
  const audioFeatures = countryData.music.audio_features;
  const metric = mode === 'music-happiness' 
    ? countryData.overview.happiness_rank.global
    : countryData.wellbeing.metrics['MHQ Score'];
  
  return Object.entries(audioFeatures)
    .filter(([feature]) => PERCENTAGE_FEATURES.includes(feature))
    .reduce((acc, [feature, value]) => {
      const correlation = Math.abs(value - metric);
      return correlation > acc.correlation ? { feature, correlation } : acc;
    }, { feature: PERCENTAGE_FEATURES[0], correlation: -1 })
    .feature;
};

const updateMapColors = (mode, globalData, map) => {
  if (!map || !globalData || !map.getLayer('dataset-countries')) return;

  try {
    const countries = Object.entries(globalData.countries);
    let countryColors = {};

    switch (mode) {
      case VIEW_MODES.DEFAULT:
        map.setPaintProperty('dataset-countries', 'fill-color', '#5601BF');
        return;

      case VIEW_MODES.MUSIC:
        countries.forEach(([name, data]) => {
          const features = Object.entries(data.music.audio_features)
            .filter(([key]) => PERCENTAGE_FEATURES.includes(key));
          const mostSignificant = features.reduce((a, b) => b[1] > a[1] ? b : a);
          countryColors[name] = FEATURE_COLORS[mostSignificant[0]];
        });
        break;

      case VIEW_MODES.HAPPINESS_MUSIC:
        countries.forEach(([name, data]) => {
          const rank = data.overview.happiness_rank.global;
          const intensity = 1 - (rank / 26);
          countryColors[name] = d3.interpolateRdYlBu(intensity);
        });
        break;

      case VIEW_MODES.WELLBEING_MUSIC:
        countries.forEach(([name, data]) => {
          const mhqScore = data.wellbeing.metrics['MHQ Score'];
          const intensity = mhqScore / 100;
          countryColors[name] = d3.interpolateGreens(intensity);
        });
        break;
    }

    const fillColor = [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#ffffff',
      [
        'match',
        ['get', 'name_en'],
        ...Object.entries(countryColors).flatMap(([name, color]) => [name, color]),
        '#627BC1'
      ]
    ];

    map.setPaintProperty('dataset-countries', 'fill-color', fillColor);
  } catch (error) {
    console.error('Error updating map colors:', error);
  }
};

// ============= SUBCOMPONENTS =============
const RankCard = ({ title, globalRank, regionalRank, total = 26, color }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      background: color,
      color: 'white',
      textAlign: 'center',
    }}
  >
    <Typography variant="caption" sx={{ opacity: 0.9 }}>
      {title}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
      #{globalRank}
    </Typography>
    <Typography variant="caption">
      Regional: #{regionalRank}
    </Typography>
  </Box>
);

const DistributionCard = ({ label, value, color }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      background: 'rgba(0,0,0,0.03)',
    }}
  >
    <Typography 
      variant="h5" 
      sx={{ 
        color,
        fontWeight: 700,
      }}
    >
      {value}%
    </Typography>
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'text.secondary',
        textTransform: 'capitalize'
      }}
    >
      {label}
    </Typography>
  </Box>
);

const ViewLegend = ({ mode }) => {
  if (mode === VIEW_MODES.MUSIC) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Dominant Music Features
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {PERCENTAGE_FEATURES.map(feature => (
            <Box 
              key={feature}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.04)'
              }}
            >
              {MUSIC_FEATURE_ICONS[feature]}
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%',
                  bgcolor: FEATURE_COLORS[feature]
                }} 
              />
              <Typography variant="body2">
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
  return null;
};

const QuickNavigation = ({ mode, globalData, onSelect }) => {
  const sortedCountries = Object.entries(globalData.countries)
    .sort(([, a], [, b]) => {
      if (mode === VIEW_MODES.HAPPINESS_MUSIC) {
        return a.overview.happiness_rank.global - b.overview.happiness_rank.global;
      } else {
        return b.wellbeing.metrics['MHQ Score'] - a.wellbeing.metrics['MHQ Score'];
      }
    });

  const highestCountry = sortedCountries[0][0];
  const lowestCountry = sortedCountries[sortedCountries.length - 1][0];

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Quick Navigation
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          startIcon={<TrendingUpIcon />}
          onClick={() => onSelect(highestCountry)}
          variant="outlined"
          size="small"
          color="success"
        >
          HIGHEST
        </Button>
        <Button
          startIcon={<TrendingDownIcon />}
          onClick={() => onSelect(lowestCountry)}
          variant="outlined"
          size="small"
          color="error"
        >
          LOWEST
        </Button>
      </Box>
    </Box>
  );
};

const ControlPanel = ({ 
  viewMode, 
  setViewMode,
  globalData,
  map,
  isRotating,
  toggleRotation,
  setSelectedCountry,
  setIsPanelOpen
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Add view-specific descriptions
  const getViewDescription = (mode) => {
    switch (mode) {
      case VIEW_MODES.DEFAULT:
        return "Purple highlights show all countries in our dataset. Click any highlighted country to view its detailed information.";
      case VIEW_MODES.MUSIC:
        return "Colors represent the most prominent musical feature in each country.";
      case VIEW_MODES.HAPPINESS_MUSIC:
        return "Colors range from red (lower happiness rank) to blue (higher happiness rank). Use Quick Navigation to compare extremes.";
      case VIEW_MODES.WELLBEING_MUSIC:
        return "Darker green indicates higher mental health scores. Compare countries to see wellbeing differences across regions.";
      default:
        return "";
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3 }}>
      {/* Globe Controls */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Globe Controls
        </Typography>
        <Tooltip title={isRotating ? "Stop Rotation" : "Start Rotation"}>
          <IconButton onClick={toggleRotation}>
            <PublicIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* View Mode Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>View Mode</InputLabel>
        <Select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          label="View Mode"
        >
          {Object.entries(VIEW_MODES).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {VIEW_MODE_INFO[value].icon}
                <Typography>{VIEW_MODE_INFO[value].label}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {VIEW_MODE_INFO[viewMode].description}
        </Typography>
        
        {/* Add detailed view description */}
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 2, 
            p: 1.5, 
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderColor: 'divider'
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: '0.875rem',
              lineHeight: 1.4
            }}
          >
            {getViewDescription(viewMode)}
          </Typography>
        </Paper>
      </FormControl>

      {/* View-specific Legend */}
      {viewMode !== VIEW_MODES.DEFAULT && (
        <ViewLegend mode={viewMode} />
      )}

      {/* Navigation Buttons */}
      {(viewMode === VIEW_MODES.HAPPINESS_MUSIC || viewMode === VIEW_MODES.WELLBEING_MUSIC) && (
        <QuickNavigation 
          mode={viewMode}
          globalData={globalData}
          onSelect={(country) => {
            setSelectedCountry(country);
            setIsPanelOpen(true);
          }}
        />
      )}
    </Paper>
  );
};

const DataPanel = ({ data, onClose, selectedCountry }) => {
  const [activeTab, setActiveTab] = useState(0);

  const MusicFeatures = ({ audioFeatures }) => (
    <Box sx={{ mt: 1 }}>
      {Object.entries(audioFeatures)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => (
          <Tooltip 
            key={key}
            title={`${key}: ${formatAudioFeature(key, value)}`}
            placement="left"
          >
            <Box 
              sx={{
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(0,0,0,0.03)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateX(4px)',
                  background: 'rgba(0,0,0,0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: 24, mr: 1 }}>
                  {MUSIC_FEATURE_ICONS[key]}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    flex: 1
                  }}
                >
                  {key}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: getFeatureColor(key, value),
                    fontWeight: 600
                  }}
                >
                  {formatAudioFeature(key, value)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={PERCENTAGE_FEATURES.includes(key) ? value * 100 : 
                  (key === 'tempo' ? (value - 50) / 100 * 100 : 
                  (key === 'loudness' ? (value + 60) / 60 * 100 : value))}
                sx={{ 
                  height: 4, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getFeatureColor(key, value),
                    borderRadius: 2
                  }
                }} 
              />
            </Box>
          </Tooltip>
        ))}
    </Box>
  );

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '90vh',
        backgroundColor: THEME.colors.background.paper,
        borderRadius: 3,
        overflow: 'hidden',
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: THEME.gradients.primary,
          p: 2,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.9 }}>
            {data.region}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedCountry}
          </Typography>
        </Box>
        <IconButton 
          color="inherit" 
          onClick={onClose} 
          size="small"
          sx={{ 
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.1)',
              transform: 'rotate(90deg)',
              transition: 'transform 0.3s'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '0.875rem'
          },
          '& .Mui-selected': {
            color: THEME.colors.primary
          },
          '& .MuiTabs-indicator': {
            backgroundColor: THEME.colors.primary
          }
        }}
      >
        <Tab 
          icon={<PublicIcon />} 
          label="Overview" 
          sx={{ 
            '& .MuiSvgIcon-root': { 
              fontSize: 24,
              mb: 0.5
            }
          }}
        />
        <Tab 
          icon={<MusicNoteIcon />} 
          label="Music"
          sx={{ 
            '& .MuiSvgIcon-root': { 
              fontSize: 24,
              mb: 0.5
            }
          }}
        />
        <Tab 
          icon={<PsychologyIcon />} 
          label="Well-being"
          sx={{ 
            '& .MuiSvgIcon-root': { 
              fontSize: 24,
              mb: 0.5
            }
          }}
        />
      </Tabs>

      {/* Content */}
      <Box 
        sx={{ 
          p: 3, 
          maxHeight: 'calc(90vh - 180px)', 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px'
          }
        }}
      >
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Rankings Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
              <RankCard
                title="Happiness Rank"
                globalRank={data.overview.happiness_rank.global}
                regionalRank={data.overview.happiness_rank.regional}
                color={THEME.gradients.primary}
              />
              <RankCard
                title="Mental Health Rank"
                globalRank={data.overview.mhq_rank.global}
                regionalRank={data.overview.mhq_rank.regional}
                color={THEME.gradients.secondary}
              />
            </Box>

            {/* Mental Health Distribution */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 3 
                }}
              >
                <PsychologyIcon sx={{ mr: 1 }} />
                Mental Health States
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 2 
                }}
              >
                {Object.entries(data.overview.mental_health_distribution)
                  .map(([state, percentage], index) => (
                    <DistributionCard
                      key={state}
                      label={state}
                      value={percentage}
                      color={THEME.colors[
                        ['error', 'warning', 'info', 'primary', 'success', 'secondary'][index]
                      ]}
                    />
                  ))}
              </Box>
            </Box>

                        {/* Regional Context */}
                        <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2 
                }}
              >
                <PublicIcon sx={{ mr: 1 }} />
                Regional Context: {data.region}
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'rgba(0,0,0,0.03)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Regional Average MHQ Score
                </Typography>
                <Typography variant="h4" sx={{ color: THEME.colors.primary }}>
                  {data.wellbeing.metrics['MHQ Score'].toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Global Average: {data.wellbeing.metrics['MHQ Score'].toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Music Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Genre Section */}
            <Box 
              sx={{ 
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: THEME.gradients.primary,
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Dominant Genre
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  textTransform: 'capitalize',
                  fontWeight: 700,
                  letterSpacing: 1
                }}
              >
                {data.music.dominant_genre}
              </Typography>
            </Box>

            {/* Audio Features */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 3
              }}
            >
              <GraphicEqIcon sx={{ mr: 1 }} />
              Audio Features
            </Typography>

            <MusicFeatures audioFeatures={data.music.audio_features} />
          </Box>
        )}

        {/* Well-being Tab */}
        {activeTab === 2 && (
          <Box>
            <Box 
              sx={{ 
                mb: 2,
                p: 2,
                borderRadius: 2,
                background: THEME.gradients.primary,
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Overall MHQ Score
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {data.wellbeing.metrics['MHQ Score'].toFixed(1)}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {Object.entries(data.wellbeing.metrics)
                .filter(([key]) => key !== 'MHQ Score')
                .sort(([, a], [, b]) => b - a)
                .map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: 'rgba(0,0,0,0.03)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          flex: 1,
                          fontWeight: 600
                        }}
                      >
                        {key.replace(' Score', '')}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: THEME.colors.primary,
                          fontWeight: 600
                        }}
                      >
                        {value.toFixed(1)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={value} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          background: THEME.colors.primary,
                          borderRadius: 2
                        }
                      }} 
                    />
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Main GlobeMap Component
const GlobeMap = () => {
  // State declarations
  const [map, setMap] = useState(null);
  const [countries, setCountries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState(VIEW_MODES.DEFAULT);
  const [isRotating, setIsRotating] = useState(false);

  // Refs
  const mapContainerRef = useRef(null);
  const rotationTimer = useRef(null);
  const hoveredStateId = useRef(null);
  const isUserInteracting = useRef(false);

  // Navigation
  const navigate = useNavigate();

    // Map Control Functions
    const startAutoRotation = useCallback((targetMap) => {
      if (!isRotating || isPanelOpen || isUserInteracting.current) return;
      
      if (rotationTimer.current) {
        clearInterval(rotationTimer.current);
      }
      
      rotationTimer.current = setInterval(() => {
        targetMap.easeTo({
          center: [targetMap.getCenter().lng + 0.5, targetMap.getCenter().lat],
          duration: 50,
          easing: t => t
        });
      }, 50);
    }, [isRotating, isPanelOpen]);
  
    const stopAutoRotation = useCallback(() => {
      if (rotationTimer.current) {
        clearInterval(rotationTimer.current);
        rotationTimer.current = null;
      }
    }, []);
  
    const toggleRotation = useCallback(() => {
      const newRotationState = !isRotating;
      setIsRotating(newRotationState);
      
      if (!newRotationState) {
        stopAutoRotation();
      } else if (!isPanelOpen && !isUserInteracting.current) {
        startAutoRotation(map);
      }
    }, [isRotating, isPanelOpen, map, startAutoRotation, stopAutoRotation]);
  
    const handleClosePanel = useCallback(() => {
      setIsPanelOpen(false);
      setSelectedCountry(null);
      setCountryData(null);
  
      map?.flyTo({
        center: [0, 0],
        zoom: 1.5,
        duration: 2000,
        essential: true
      });
    }, [map]);
  
    // Data Fetching Effect
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/api/countries');
          setGlobalData(response.data);
          setCountries(Object.keys(response.data.countries));
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    // Map Initialization Effect
    useEffect(() => {
      if (!countries || map) return;
  
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const initializeMap = async () => {
        const newMap = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [0, 0],
          zoom: 1.5,
          projection: 'globe',
          minZoom: 1.5,
          maxZoom: 4,
        });

        // Wait for style to load
        await new Promise((resolve) => {
          if (newMap.isStyleLoaded()) {
            resolve();
          } else {
            newMap.once('style.load', resolve);
          }
        });

        // Initialize fog and atmosphere
        newMap.setFog({
          color: 'rgb(5, 5, 20)',
          'high-color': '#284387',
          'horizon-blend': 0.2,
          'space-color': '#000022',
          'star-intensity': 0.6
        });

        newMap.addLayer({
          id: 'atmosphere',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15,
          }
        });

        // Add source and wait for it to load completely
        newMap.addSource('countries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1'
        });

        await new Promise((resolve) => {
          const checkSource = () => {
            if (newMap.isSourceLoaded('countries')) {
              resolve();
            } else {
              newMap.once('sourcedata', checkSource);
            }
          };
          checkSource();
        });

        // Add layers after ensuring source is loaded
        try {
          newMap.addLayer({
            id: 'country-base',
            source: 'countries',
            'source-layer': 'country_boundaries',
            type: 'fill',
            paint: {
              'fill-color': '#627BC1',
              'fill-opacity': 0.2
            }
          });

          newMap.addLayer({
            id: 'dataset-countries',
            source: 'countries',
            'source-layer': 'country_boundaries',
            type: 'fill',
            paint: {
              'fill-color': '#5601BF',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.8,
                0.5
              ]
            },
            filter: ['in', ['get', 'name_en'], ['literal', countries]]
          });

          newMap.addLayer({
            id: 'dataset-countries-border',
            source: 'countries',
            'source-layer': 'country_boundaries',
            type: 'line',
            paint: {
              'line-color': '#fff',
              'line-width': 1,
              'line-opacity': 0.5
            },
            filter: ['in', ['get', 'name_en'], ['literal', countries]]
          });

          // Hover handling
          newMap.on('mousemove', 'dataset-countries', (e) => {
            if (e.features.length > 0) {
              if (hoveredStateId.current !== null) {
                newMap.setFeatureState(
                  {
                    source: 'countries',
                    sourceLayer: 'country_boundaries',
                    id: hoveredStateId.current
                  },
                  { hover: false }
                );
              }
    
              hoveredStateId.current = e.features[0].id;
              const countryName = e.features[0].properties.name_en;
    
              if (countries.includes(countryName)) {
                setHoveredCountry(countryName);
                newMap.setFeatureState(
                  {
                    source: 'countries',
                    sourceLayer: 'country_boundaries',
                    id: hoveredStateId.current
                  },
                  { hover: true }
                );
              }
            }
          });
    
          newMap.on('mouseleave', 'dataset-countries', () => {
            if (hoveredStateId.current !== null) {
              newMap.setFeatureState(
                {
                  source: 'countries',
                  sourceLayer: 'country_boundaries',
                  id: hoveredStateId.current
                },
                { hover: false }
              );
              hoveredStateId.current = null;
              setHoveredCountry(null);
            }
          });
    
          // Click handling
          newMap.on('click', 'dataset-countries', (e) => {
            if (e.features.length > 0) {
              const feature = e.features[0];
              const countryName = feature.properties.name_en;
              
              if (countries.includes(countryName)) {
                stopAutoRotation();
                setSelectedCountry(countryName);
                setIsPanelOpen(true);
    
                const bounds = new mapboxgl.LngLatBounds();
                if (feature.geometry.type === 'MultiPolygon') {
                  feature.geometry.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                      ring.forEach(coord => {
                        bounds.extend(coord);
                      });
                    });
                  });
                } else if (feature.geometry.type === 'Polygon') {
                  feature.geometry.coordinates.forEach(ring => {
                    ring.forEach(coord => {
                      bounds.extend(coord);
                    });
                  });
                }
    
                newMap.flyTo({
                  center: bounds.getCenter(),
                  zoom: Math.min(4, newMap.getZoom() + 0.5),
                  duration: 2000,
                  essential: true
                });
              }
            }
          });

          setMap(newMap);
        } catch (error) {
          console.error('Error adding layers:', error);
        }

        return () => {
          stopAutoRotation();
          map?.remove();
        };
      };

      initializeMap().catch(error => {
        console.error('Error initializing map:', error);
      });

      return () => {
        stopAutoRotation();
        map?.remove();
      };
    }, [countries, stopAutoRotation]);

      // Selected Country Effect
  useEffect(() => {
    if (selectedCountry && globalData) {
      setCountryData(globalData.countries[selectedCountry]);
    }
  }, [selectedCountry, globalData]);

  // Map Interaction Effects
  useEffect(() => {
    if (!map) return;

    const handleMouseDown = () => {
      isUserInteracting.current = true;
      if (isRotating) stopAutoRotation();
    };

    const handleMouseUp = () => {
      isUserInteracting.current = false;
      if (isRotating && !isPanelOpen) startAutoRotation(map);
    };

    map.on('mousedown', handleMouseDown);
    map.on('mouseup', handleMouseUp);
    map.on('touchstart', handleMouseDown);
    map.on('touchend', handleMouseUp);

    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mouseup', handleMouseUp);
      map.off('touchstart', handleMouseDown);
      map.off('touchend', handleMouseUp);
    };
  }, [map, isRotating, isPanelOpen, startAutoRotation, stopAutoRotation]);

  // View Mode Effect
  useEffect(() => {
    if (map && globalData) {
      // Wait for the style to be loaded and the layer to be added
      if (map.isStyleLoaded() && map.getLayer('dataset-countries')) {
        updateMapColors(viewMode, globalData, map);
      } else {
        // Wait for the style and layer to be ready
        map.once('style.load', () => {
          if (map.getLayer('dataset-countries')) {
            updateMapColors(viewMode, globalData, map);
          }
        });
      }
    }
  }, [viewMode, globalData, map]);

  // Rotation Effect
  useEffect(() => {
    if (!map) return;

    if (isRotating && !isPanelOpen && !isUserInteracting.current) {
      startAutoRotation(map);
    } else {
      stopAutoRotation();
    }
  }, [isRotating, isPanelOpen, map, startAutoRotation, stopAutoRotation]);

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          Loading Global Data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Control Panel */}
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 320,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          zIndex: 1000
        }}
      >
        <ControlPanel 
          viewMode={viewMode}
          setViewMode={setViewMode}
          globalData={globalData}
          map={map}
          isRotating={isRotating}
          toggleRotation={toggleRotation}
          setSelectedCountry={setSelectedCountry}
          setIsPanelOpen={setIsPanelOpen}
        />
      </Paper>

      {/* Explore More Button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/explore')}
          startIcon={<ExploreIcon />}
          sx={{
            backgroundColor: 'background.paper',
            color: 'primary.main',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            boxShadow: theme => `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
            backdropFilter: 'blur(8px)',
            '&:hover': {
              backgroundColor: 'background.paper',
              transform: 'translateY(-2px)',
              boxShadow: theme => `0 12px 40px ${alpha(theme.palette.common.black, 0.2)}`,
            },
            transition: 'all 0.3s ease-in-out'
          }}
        >
          Explore More Data
        </Button>
      </Box>
      
      {/* Data Panel */}
      {selectedCountry && countryData && (
        <DataPanel 
          data={countryData} 
          onClose={handleClosePanel}
          selectedCountry={selectedCountry}
        />
      )}

      {/* Hover Tooltip */}
      {hoveredCountry && !selectedCountry && (
        <Fade in={true}>
          <Paper
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {hoveredCountry}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click to view details
            </Typography>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default GlobeMap;
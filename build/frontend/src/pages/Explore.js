import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Fade,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Collapse,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  MusicNote as MusicIcon,
  Psychology as PsychologyIcon,
  Compare as CompareIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Public as PublicIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { mean, sum } from 'd3-array';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { Circle } from '@visx/shape';
import { defaultStyles } from '@visx/tooltip';
import { LinearGradient } from '@visx/gradient';
import { LegendOrdinal } from '@visx/legend';
import axios from '../utils/axios';
import { LoadingDisplay } from '../components/LoadingDisplay';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { DataGrid } from '@mui/x-data-grid';
import { Select, MenuItem } from '@mui/material';


// Utility function for getting region colors
const getRegionColor = (region, theme) => {
  const colorMap = {
    'Asia': theme.palette.primary.main,
    'Europe': theme.palette.secondary.main,
    'North America': theme.palette.success.main,
    'Africa': theme.palette.error.main,
    'Oceania': theme.palette.info.main,
    'Middle East': theme.palette.secondary.dark,
    'Latin America': theme.palette.warning.dark
  };
  return colorMap[region] || theme.palette.grey[500];
};

// Shared styles for charts
const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: '4px'
};

// Utility function for margin
const defaultMargin = { top: 40, right: 30, bottom: 50, left: 40 };

const ChartContainer = ({ children, height = 400 }) => (
  <Box sx={{ width: '100%', height }}>
    <ParentSize>
      {({ width, height }) => children({ width, height })}
    </ParentSize>
  </Box>
);

const ScatterPlot = ({ 
  data, 
  width, 
  height, 
  xLabel, 
  yLabel,
  colorByRegion = false,
  showTrendline = false,
  showConfidenceInterval = false,
  interactive = false,
  highlightRegion = null
}) => {
  const theme = useTheme();
  const margin = defaultMargin;
  const [tooltip, setTooltip] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleLinear({
    domain: [Math.min(...data.map(d => d.x)), Math.max(...data.map(d => d.x))],
    range: [0, xMax],
    nice: true
  });

  const yScale = scaleLinear({
    domain: [Math.min(...data.map(d => d.y)), Math.max(...data.map(d => d.y))],
    range: [yMax, 0],
    nice: true
  });

  // Calculate trendline if needed
  const trendline = useMemo(() => {
    if (!showTrendline) return null;

    const xMean = mean(data, d => d.x);
    const yMean = mean(data, d => d.y);
    const slope = sum(data.map(d => (d.x - xMean) * (d.y - yMean))) / 
                 sum(data.map(d => Math.pow(d.x - xMean, 2)));
    const intercept = yMean - slope * xMean;

    return {
      slope,
      intercept,
      points: [
        { x: Math.min(...data.map(d => d.x)), y: slope * Math.min(...data.map(d => d.x)) + intercept },
        { x: Math.max(...data.map(d => d.x)), y: slope * Math.max(...data.map(d => d.x)) + intercept }
      ]
    };
  }, [data, showTrendline]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={xMax}
          strokeDasharray="3,3"
          stroke={alpha(theme.palette.text.primary, 0.1)}
        />
        <GridColumns
          scale={xScale}
          height={yMax}
          strokeDasharray="3,3"
          stroke={alpha(theme.palette.text.primary, 0.1)}
        />
        
        {/* Confidence Interval */}
        {showConfidenceInterval && trendline && (
          <path
            d={`M ${xScale(trendline.points[0].x)} ${yScale(trendline.points[0].y + 1.96 * trendline.standardError)}
               L ${xScale(trendline.points[1].x)} ${yScale(trendline.points[1].y + 1.96 * trendline.standardError)}
               L ${xScale(trendline.points[1].x)} ${yScale(trendline.points[1].y - 1.96 * trendline.standardError)}
               L ${xScale(trendline.points[0].x)} ${yScale(trendline.points[0].y - 1.96 * trendline.standardError)}
               Z`}
            fill={alpha(theme.palette.primary.main, 0.1)}
          />
        )}

        {/* Trendline */}
        {showTrendline && trendline && (
          <line
            x1={xScale(trendline.points[0].x)}
            y1={yScale(trendline.points[0].y)}
            x2={xScale(trendline.points[1].x)}
            y2={yScale(trendline.points[1].y)}
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}

        {/* Data Points */}
        {data.map((d, i) => (
          <Circle
            key={i}
            cx={xScale(d.x)}
            cy={yScale(d.y)}
            r={hoveredPoint === i ? 6 : 4}
            fill={colorByRegion ? getRegionColor(d.region, theme) : theme.palette.primary.main}
            opacity={
              highlightRegion 
                ? d.region === highlightRegion ? 0.8 : 0.2
                : hoveredPoint === i ? 1 : 0.6
            }
            stroke={hoveredPoint === i ? theme.palette.background.paper : 'none'}
            strokeWidth={2}
            onMouseEnter={() => {
              setHoveredPoint(i);
              setTooltip({
                data: d,
                x: xScale(d.x),
                y: yScale(d.y)
              });
            }}
            onMouseLeave={() => {
              setHoveredPoint(null);
              setTooltip(null);
            }}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
        ))}

        <AxisBottom
          top={yMax}
          scale={xScale}
          label={xLabel}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          tickLabelProps={() => ({
            fill: theme.palette.text.primary,
            fontSize: 12,
            textAnchor: 'middle'
          })}
        />
        <AxisLeft
          scale={yScale}
          label={yLabel}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          tickLabelProps={() => ({
            fill: theme.palette.text.primary,
            fontSize: 12,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
      </Group>

      {/* Enhanced Tooltip */}
      {tooltip && (
        <Tooltip
          top={tooltip.y + margin.top}
          left={tooltip.x + margin.left}
          style={{
            ...tooltipStyles,
            background: alpha(theme.palette.background.paper, 0.95),
            boxShadow: theme.shadows[3]
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {tooltip.data.country}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {xLabel}: {tooltip.data.x.toFixed(3)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              MHQ Score: {tooltip.data.y.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Region: {tooltip.data.region}
            </Typography>
          </Box>
        </Tooltip>
      )}
    </svg>
  );
};

const BarChartComponent = ({ 
  data, 
  width, 
  height, 
  xLabel, 
  yLabel, 
  showSecondary = false,
  tooltipContent 
}) => {
  const theme = useTheme();
  const margin = { ...defaultMargin, left: 120 };
  const [tooltip, setTooltip] = useState(null);

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0)))],
    range: [0, xMax],
    nice: true
  });

  const yScale = scaleOrdinal({
    domain: data.map(d => d.name),
    range: Array.from({ length: data.length }, (_, i) => i * (yMax / data.length))
  });

  const barHeight = Math.min(20, (yMax / data.length) - 5);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={xMax}
          strokeDasharray="3,3"
          stroke={alpha(theme.palette.text.primary, 0.1)}
        />
        <GridColumns
          scale={xScale}
          height={yMax}
          strokeDasharray="3,3"
          stroke={alpha(theme.palette.text.primary, 0.1)}
        />
        {data.map((d, i) => {
          const y = yScale(d.name) + (yMax / data.length - barHeight) / 2;
          return (
            <Group 
              key={`bar-${i}`}
              onMouseEnter={() => setTooltip({ data: d, x: xScale(d.value), y })}
              onMouseLeave={() => setTooltip(null)}
            >
              <rect
                y={y}
                width={xScale(d.value)}
                height={barHeight}
                fill={theme.palette.primary.main}
                opacity={0.8}
                rx={2}
              />
              {showSecondary && (
                <rect
                  y={y + barHeight + 2}
                  width={xScale(d.secondaryValue)}
                  height={barHeight / 2}
                  fill={theme.palette.secondary.main}
                  opacity={0.6}
                  rx={1}
                />
              )}
            </Group>
          );
        })}
        <AxisLeft
          scale={yScale}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          label={yLabel}
          tickLabelProps={() => ({
            fill: theme.palette.text.primary,
            fontSize: 12,
            textAnchor: 'end',
            dy: '0.33em'
          })}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          label={xLabel}
        />
      </Group>
      {tooltip && tooltipContent && (
        <Tooltip
          top={tooltip.y + margin.top}
          left={tooltip.x + margin.left + 10}
          style={tooltipStyles}
        >
          {tooltipContent({ data: tooltip.data })}
        </Tooltip>
      )}
    </svg>
  );
};

const BoxPlot = ({ data, width, height }) => {
  const theme = useTheme();
  const margin = { ...defaultMargin, left: 100 }; // Extra space for region names

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, 100], // MHQ scores range
    range: [0, xMax],
    nice: true
  });

  const yScale = scaleOrdinal({
    domain: Object.keys(data),
    range: Array.from({ length: Object.keys(data).length }, (_, i) => i * (yMax / Object.keys(data).length))
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <AxisLeft
          scale={yScale}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke={theme.palette.text.primary}
          tickStroke={theme.palette.text.primary}
          label="MHQ Score"
        />
        {Object.entries(data).map(([region, stats], i) => {
          const y = yScale(region) + (yMax / Object.keys(data).length) / 2;
          return (
            <Group key={region}>
              {/* Box */}
              <rect
                x={xScale(stats.q1)}
                y={y - 10}
                width={xScale(stats.q3) - xScale(stats.q1)}
                height={20}
                fill={theme.palette.primary.main}
                opacity={0.3}
              />
              {/* Median line */}
              <line
                x1={xScale(stats.median)}
                x2={xScale(stats.median)}
                y1={y - 10}
                y2={y + 10}
                stroke={theme.palette.primary.main}
                strokeWidth={2}
              />
              {/* Whiskers */}
              <line
                x1={xScale(stats.min)}
                x2={xScale(stats.max)}
                y1={y}
                y2={y}
                stroke={theme.palette.text.primary}
                strokeWidth={1}
              />
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};

const RegionalInsights = ({ data, metric }) => {
  const theme = useTheme();

  if (!data) return null;

  return (
    <Box>
      {Object.entries(data).map(([region, insights]) => (
        <Box key={region} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {region}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={(insights[metric].score / insights[metric].max) * 100}
              sx={{
                height: 8,
                borderRadius: 1,
                flexGrow: 1,
                bgcolor: alpha(getRegionColor(region, theme), 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getRegionColor(region, theme)
                }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {insights[metric].score.toFixed(1)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip
              size="small"
              icon={<TrendingUpIcon />}
              label={`Top: ${insights[metric].topCountry}`}
              sx={{ 
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                borderColor: theme.palette.success.main
              }}
              variant="outlined"
            />
            {insights[metric].trend > 0 ? (
              <Chip
                size="small"
                icon={<TrendingUpIcon />}
                label={`${insights[metric].trend.toFixed(1)}% growth`}
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main 
                }}
              />
            ) : (
              <Chip
                size="small"
                icon={<TrendingDownIcon />}
                label={`${Math.abs(insights[metric].trend).toFixed(1)}% decline`}
                sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main 
                }}
              />
            )}
          </Box>
        </Box>
      ))}

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Key Takeaways
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {data.insights?.[metric]?.map((insight, index) => (
            <Typography 
              key={index} 
              component="li" 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {insight}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

function OverviewSection({ data }) {
  const theme = useTheme();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('happiness');

  const summaryData = useMemo(() => {
    if (!data?.summary?.global_stats || !data?.music?.feature_ranges) return {
      regions: [],
      metrics: {
        happiness: { label: 'Happiness Score', max: 10 },
        mhq: { label: 'Mental Health Score', max: 100 },
        musicEngagement: { label: 'Music Engagement', max: 100 }
      }
    };

    // Calculate music engagement as an aggregate of key music features
    const musicFeatures = data.music.regional_features;
    const musicEngagementByRegion = Object.entries(musicFeatures).reduce((acc, [region, data]) => {
      acc[region] = (
        (data.features.energy * 100) +
        (data.features.danceability * 100) +
        (data.features.valence * 100)
      ) / 3;
      return acc;
    }, {});

    return {
      regions: data.rankings.summary.regions || [],
      metrics: {
        happiness: { 
          label: 'Happiness Score', 
          max: 10,
          value: data.summary.global_stats.avg_happiness
        },
        mhq: { 
          label: 'Mental Health Score', 
          max: 100,
          value: data.summary.global_stats.avg_mhq
        },
        musicEngagement: { 
          label: 'Music Engagement', 
          max: 100,
          value: mean(Object.values(musicEngagementByRegion)),
          regionalAverages: musicEngagementByRegion
        }
      }
    };
  }, [data]);

  const rankings = useMemo(() => {
    if (!data?.rankings?.rankings || !data?.music?.country_features) return [];
    
    const metricData = {
      happiness: {
        scores: data.rankings.rankings.happiness_scores,
        ranks: data.rankings.rankings.happiness_ranks
      },
      mhq: {
        scores: data.rankings.rankings.mhq_scores,
        ranks: data.rankings.rankings.mhq_ranks
      },
      musicEngagement: {
        scores: data.rankings.rankings.countries.map(country => {
          const features = data.music.country_features[country]?.features;
          return features ? 
            ((features.energy * 100) + (features.danceability * 100) + (features.valence * 100)) / 3 
            : 0;
        })
      }
    };
    
    // Calculate ranks for music engagement
    metricData.musicEngagement.ranks = metricData.musicEngagement.scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .reduce((ranks, item, index) => {
        ranks[item.index] = index + 1;
        return ranks;
      }, []);

    return data.rankings.rankings.countries.map((country, index) => ({
      country,
      rank: metricData[selectedMetric].ranks[index],
      score: metricData[selectedMetric].scores[index],
      region: data.rankings.rankings.regions[index]
    }))
    .filter(item => selectedRegion === 'all' || item.region === selectedRegion)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10);
  }, [data, selectedRegion, selectedMetric]);

  const regionalInsights = useMemo(() => {
    if (!data?.rankings?.regional_averages) return [];
    
    const getRegionalData = () => {
      switch(selectedMetric) {
        case 'happiness':
          return data.rankings.regional_averages.happiness;
        case 'mhq':
          return data.rankings.regional_averages.mhq;
        case 'musicEngagement':
          return summaryData.metrics.musicEngagement.regionalAverages;
        default:
          return {};
      }
    };

    return Object.entries(getRegionalData())
      .map(([region, score]) => ({
        region,
        score,
        topCountry: rankings.find(r => r.region === region)?.country || ''
      }))
      .sort((a, b) => b.score - a.score);
  }, [data, selectedMetric, rankings, summaryData.metrics]);

  // Add metric descriptions
  const metricDescriptions = {
    happiness: {
      title: "Happiness Score",
      description: "World Happiness Report score based on life evaluations",
      details: "Scale of 0-10 measuring how happy citizens evaluate their own lives"
    },
    mhq: {
      title: "Mental Health Score",
      description: "Mental Health Quotient measuring overall mental wellbeing",
      details: "Comprehensive score from 0-100 based on multiple mental health dimensions"
    },
    musicEngagement: {
      title: "Music Engagement",
      description: "Composite score of musical characteristics",
      details: [
        "Musical Energy: intensity and activity level",
        "Danceability: rhythm and beat strength",
        "Musical Positivity: emotional tone of music"
      ]
    }
  };

  if (!data?.summary || !data?.rankings) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {Object.entries(summaryData.metrics).map(([key, info]) => (
            <Grid item xs={12} md={4} key={key}>
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {metricDescriptions[key].title}
                    </Typography>
                    <Typography variant="body2">
                      {metricDescriptions[key].description}
                    </Typography>
                    {key === 'musicEngagement' ? (
                      <>
                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                          Components:
                        </Typography>
                        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                          {metricDescriptions[key].details.map((detail, i) => (
                            <li key={i}>
                              <Typography variant="caption">{detail}</Typography>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {metricDescriptions[key].details}
                      </Typography>
                    )}
                  </Box>
                }
                placement="bottom"
                arrow
                enterDelay={200}
                leaveDelay={200}
              >
                <Paper
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    bgcolor: selectedMetric === key ? 
                      alpha(theme.palette.primary.main, 0.1) : 
                      'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onClick={() => setSelectedMetric(key)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{info.label}</Typography>
                    <InfoOutlinedIcon sx={{ ml: 1, color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {(info.value || 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Global Average (Max: {info.max})
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Rankings Table with Info Icon */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">Top Performing Countries</Typography>
              <Tooltip title={`Shows top countries ranked by ${selectedMetric === 'happiness' ? 'Happiness Score' : 
                selectedMetric === 'mhq' ? 'Mental Health Score' : 'Music Engagement'}`}>
                <InfoOutlinedIcon sx={{ ml: 1, color: 'text.secondary', fontSize: 20 }} />
              </Tooltip>
            </Box>
            <Select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Regions</MenuItem>
              {summaryData.regions.map(region => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </Select>
          </Box>
          
          {rankings.map((item, index) => (
            <Box
              key={item.country}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                mb: 1,
                borderRadius: 1,
                bgcolor: hoveredCountry === item.country ? 
                  alpha(theme.palette.primary.main, 0.1) : 
                  'transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={() => setHoveredCountry(item.country)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              <Typography variant="h4" sx={{ 
                width: 50,
                color: index < 3 ? theme.palette.primary.main : 'text.secondary',
                fontWeight: index < 3 ? 'bold' : 'normal'
              }}>
                #{index + 1}
              </Typography>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {item.country}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.region}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {item.score.toFixed(1)}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Grid>

      {/* Regional Insights with Info Icon */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Regional Insights</Typography>
            <Tooltip title="Compare performance across different regions">
              <InfoOutlinedIcon sx={{ ml: 1, color: 'text.secondary', fontSize: 20 }} />
            </Tooltip>
          </Box>
          {regionalInsights.map(region => (
            <Box key={region.region} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{region.region}</Typography>
              <LinearProgress
                variant="determinate"
                value={(region.score / summaryData.metrics[selectedMetric].max) * 100}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: alpha(getRegionColor(region.region, theme), 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getRegionColor(region.region, theme)
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Average: {region.score.toFixed(1)}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
}


function MusicHappinessSection({ data }) {
  const theme = useTheme();
  const [selectedFeature, setSelectedFeature] = useState('energy');
  const [activeRegion, setActiveRegion] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  const musicHappinessData = useMemo(() => {
    if (!data?.music?.country_features || !data?.rankings?.rankings) return {
      correlations: {},
      features: [],
      scatterData: {},
      allGenreStats: []
    };

    // Get all available features
    const features = ['energy', 'danceability', 'valence', 'acousticness', 'instrumentalness', 'liveness'];
    
    // Calculate correlations and prepare scatter data for all features
    const correlations = {};
    const scatterData = {};
    
    features.forEach(feature => {
      const featureData = data.rankings.rankings.countries.map((country, idx) => {
        const musicFeature = data.music.country_features[country]?.features[feature] || 0;
        return {
          x: musicFeature,
          y: data.rankings.rankings.happiness_scores[idx] || 0,
          country,
          region: data.rankings.rankings.regions[idx]
        };
      }).filter(d => d.x !== 0 && d.y !== 0);

      correlations[feature] = calculateCorrelation(
        featureData.map(d => d.x),
        featureData.map(d => d.y)
      );
      
      scatterData[feature] = featureData;
    });

    // Enhanced genre statistics calculation
    const genreStats = Object.entries(data.music.country_features)
      .reduce((acc, [country, info]) => {
        const genre = info.genre;
        const happinessIdx = data.rankings.rankings.countries.indexOf(country);
        const happiness = data.rankings.rankings.happiness_scores[happinessIdx];
        const region = data.rankings.rankings.regions[happinessIdx];

        if (!acc[genre]) {
          acc[genre] = {
            genre,
            countries: [],
            countryDetails: [],
            totalHappiness: 0,
            count: 0,
            regionCounts: {}
          };
        }
        
        if (happiness) {
          acc[genre].countries.push(country);
          acc[genre].countryDetails.push({
            country,
            happiness,
            region
          });
          acc[genre].totalHappiness += happiness;
          acc[genre].count++;
          acc[genre].regionCounts[region] = (acc[genre].regionCounts[region] || 0) + 1;
        }
        
        return acc;
      }, {});

    return {
      correlations,
      features,
      scatterData,
      allGenreStats: Object.values(genreStats)
        .map(g => ({
          ...g,
          avgHappiness: g.totalHappiness / g.count,
          dominantRegions: Object.entries(g.regionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([region]) => region)
        }))
        .filter(g => g.count >= 1)
        .sort((a, b) => b.avgHappiness - a.avgHappiness)
    };
  }, [data]);

  // Calculate total pages for carousel
  const totalPages = Math.ceil(musicHappinessData.allGenreStats.length / ITEMS_PER_PAGE);

  // Add tooltip descriptions
  const tooltipDescriptions = {
    genres: {
      title: "Musical Genre Impact",
      description: "Average happiness scores for countries where each genre dominates"
    },
    features: {
      energy: "Musical intensity and activity level",
      danceability: "How suitable the music is for dancing based on tempo, rhythm stability, beat strength",
      valence: "Musical positiveness conveyed by the track (happiness, cheerfulness)",
      acousticness: "Musical richness and presence of acoustic instruments",
      instrumentalness: "Musical presence of instruments played artificially",
      liveness: "Musical presence of a live audience"
    }
  };

  // Add feature selection controls
  const renderScatterPlot = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">Music Features vs Happiness</Typography>
          <Tooltip 
            title={
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Feature Analysis
                </Typography>
                <Typography variant="body2">
                  Explore how different musical characteristics correlate with happiness scores
                </Typography>
              </Box>
            }
            placement="top"
            arrow
          >
            <InfoOutlinedIcon sx={{ ml: 1, color: 'text.secondary', fontSize: 20 }} />
          </Tooltip>
        </Box>
        <Select
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {musicHappinessData.features.map(feature => (
            <MenuItem key={feature} value={feature}>
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Correlation: {musicHappinessData.correlations[selectedFeature]?.toFixed(2) || 'N/A'}
        </Typography>
        <Tooltip title={tooltipDescriptions.features[selectedFeature]} arrow>
          <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
        </Tooltip>
      </Box>

      <ChartContainer height={400}>
        {({ width, height }) => (
          <ScatterPlot
            data={activeRegion === 'all' 
              ? musicHappinessData.scatterData[selectedFeature]
              : musicHappinessData.scatterData[selectedFeature]?.filter(d => d.region === activeRegion)
            }
            width={width}
            height={height}
            xLabel={selectedFeature}
            yLabel="Happiness Score"
            colorByRegion
            showTrendline
            theme={theme}
            tooltipContent={({ data }) => (
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {data.country}
                </Typography>
                <Typography variant="body2">
                  {selectedFeature}: {data.x.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Happiness: {data.y.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Region: {data.region}
                </Typography>
              </Box>
            )}
          />
        )}
      </ChartContainer>
    </Paper>
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})` }}>
        <Typography variant="h5" gutterBottom>
          Music Features & Happiness
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Explore how different musical characteristics relate to national happiness scores across regions.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All Regions"
            onClick={() => setActiveRegion('all')}
            color={activeRegion === 'all' ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
          />
          {['Asia', 'Europe', 'North America', 'Africa', 'Oceania', 'Middle East', 'Latin America'].map(region => (
            <Chip
              key={region}
              label={region}
              onClick={() => setActiveRegion(region)}
              color={activeRegion === region ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* Genre Analysis with Carousel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">Musical Genres & Happiness</Typography>
            <Tooltip 
              title={
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Musical Genre Impact
                  </Typography>
                  <Typography variant="body2">
                    Average happiness scores for countries where each genre dominates
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Click on a genre to see detailed country information
                  </Typography>
                </Box>
              }
              placement="top"
              arrow
            >
              <InfoOutlinedIcon sx={{ ml: 1, color: 'text.secondary', fontSize: 20 }} />
            </Tooltip>
          </Box>
          <Box>
            <IconButton 
              onClick={() => setCarouselPage(p => Math.max(0, p - 1))}
              disabled={carouselPage === 0}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton 
              onClick={() => setCarouselPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={carouselPage === totalPages - 1}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {musicHappinessData.allGenreStats
            .slice(carouselPage * ITEMS_PER_PAGE, (carouselPage + 1) * ITEMS_PER_PAGE)
            .map((genreData) => (
              <Grid item xs={12} sm={6} md={3} key={genreData.genre}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {genreData.genre}
                      </Typography>
                      <Typography variant="body2">
                        Average happiness: {genreData.avgHappiness.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Prevalent in: {genreData.dominantRegions.join(', ')}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Countries: {genreData.countryDetails
                          .sort((a, b) => b.happiness - a.happiness)
                          .slice(0, 3)
                          .map(c => `${c.country} (${c.happiness.toFixed(1)})`)
                          .join(', ')}
                        {genreData.countries.length > 3 ? ` +${genreData.countries.length - 3} more` : ''}
                      </Typography>
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: selectedGenre === genreData.genre ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => setSelectedGenre(genreData.genre)}
                  >
                    <Typography variant="h6" color="primary">
                      {genreData.genre}
                    </Typography>
                    <Typography variant="h4">
                      {genreData.avgHappiness.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {genreData.count} {genreData.count === 1 ? 'country' : 'countries'}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {[...Array(totalPages)].map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                mx: 0.5,
                bgcolor: idx === carouselPage ? 'primary.main' : 'grey.300',
                cursor: 'pointer'
              }}
              onClick={() => setCarouselPage(idx)}
            />
          ))}
        </Box>
      </Paper>

      {renderScatterPlot()}
    </Box>
  );
}

const calculateCorrelation = (array1, array2) => {
  const n = array1.length;
  const mean1 = mean(array1);
  const mean2 = mean(array2);
  
  const numerator = sum(array1.map((x, i) => (x - mean1) * (array2[i] - mean2)));
  const denominator = Math.sqrt(
    sum(array1.map(x => Math.pow(x - mean1, 2))) *
    sum(array2.map(x => Math.pow(x - mean2, 2)))
  );
  
  return numerator / denominator;
};

const CorrelationMatrix = ({ data, dimensions, width, height, onCellClick }) => {
  const theme = useTheme();
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const size = Math.min(width, height) - margin.left - margin.right;
  const cellSize = size / dimensions.length;

  const colorScale = scaleLinear({
    domain: [-1, 0, 1],
    range: [theme.palette.error.main, theme.palette.grey[300], theme.palette.success.main]
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {dimensions.map((dim1, i) => 
          dimensions.map((dim2, j) => {
            if (i === j) return null;
            const correlation = data[dim1][dim2];
            return (
              <g
                key={`${dim1}-${dim2}`}
                transform={`translate(${i * cellSize}, ${j * cellSize})`}
                onClick={() => onCellClick(dim1, dim2)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width={cellSize}
                  height={cellSize}
                  fill={colorScale(correlation)}
                  opacity={0.8}
                />
                <text
                  x={cellSize / 2}
                  y={cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={theme.palette.background.paper}
                  fontSize={12}
                >
                  {correlation.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
        
        {/* Dimension Labels */}
        {dimensions.map((dim, i) => (
          <React.Fragment key={dim}>
            <text
              transform={`translate(${i * cellSize + cellSize / 2}, -10) rotate(-45)`}
              textAnchor="end"
              fontSize={12}
            >
              {dim}
            </text>
            <text
              transform={`translate(-10, ${i * cellSize + cellSize / 2})`}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
            >
              {dim}
            </text>
          </React.Fragment>
        ))}
      </Group>
    </svg>
  );
};

function MentalHealthSection({ data }) {
  const theme = useTheme();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDimensions, setSelectedDimensions] = useState(['MHQ Score', 'Mood & Outlook Score']);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [showInsights, setShowInsights] = useState(true);

  const mentalHealthData = useMemo(() => {
    if (!data?.wellbeing?.country_data || !data?.distribution) return null;

    // Get dimension data with proper formatting
    const dimensions = Object.keys(Object.values(data.wellbeing.country_data)[0]?.dimensions || {})
      .map(dim => dim.replace('Average ', ''));

    // Process country data for visualizations
    const countryData = Object.entries(data.wellbeing.country_data)
      .map(([country, info]) => ({
        country,
        region: info.region,
        dimensions: info.dimensions,
        mhqScore: info.dimensions['Average MHQ Score'] || 0
      }))
      .filter(d => d.mhqScore > 0);

    // Calculate regional statistics
    const regionalStats = Object.entries(data.distribution.by_region)
      .map(([region, stats]) => ({
        region,
        mean: stats.mean || 0,
        median: stats.median || 0,
        q1: stats.q1 || 0,
        q3: stats.q3 || 0,
        countries: stats.countries || [],
        topScore: Math.max(...(stats.countries?.map(c => c['Average MHQ Score']) || [0]))
      }))
      .filter(stat => stat.mean > 0)
      .sort((a, b) => b.mean - a.mean);

    return {
      countryData,
      regionalStats,
      dimensions,
      topPerformers: countryData
        .sort((a, b) => b.mhqScore - a.mhqScore)
        .slice(0, 5)
    };
  }, [data]);

  if (!mentalHealthData) return null;

  return (
    <Box>
      {/* Region Selection Bar */}
      <Paper sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})` }}>
        <Typography variant="h5" gutterBottom>
          Mental Health Across Regions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All Regions"
            onClick={() => setSelectedRegion('all')}
            color={selectedRegion === 'all' ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
          />
          {mentalHealthData.regionalStats.map(({ region }) => (
            <Chip
              key={region}
              label={region}
              onClick={() => setSelectedRegion(region)}
              color={selectedRegion === region ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Visualization Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Dimension Relationships</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Select
                  size="small"
                  value={selectedDimensions[0]}
                  onChange={(e) => setSelectedDimensions([e.target.value, selectedDimensions[1]])}
                >
                  {mentalHealthData.dimensions.map(dim => (
                    <MenuItem key={dim} value={dim}>{dim}</MenuItem>
                  ))}
                </Select>
                <Typography variant="body1" sx={{ alignSelf: 'center' }}>vs</Typography>
                <Select
                  size="small"
                  value={selectedDimensions[1]}
                  onChange={(e) => setSelectedDimensions([selectedDimensions[0], e.target.value])}
                >
                  {mentalHealthData.dimensions.map(dim => (
                    <MenuItem key={dim} value={dim}>{dim}</MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>

            <Box sx={{ height: 400 }}>
              <ChartContainer height={400}>
                {({ width, height }) => (
                  <ScatterPlot
                    data={mentalHealthData.countryData
                      .filter(d => selectedRegion === 'all' || d.region === selectedRegion)
                      .map(d => ({
                        country: d.country,
                        region: d.region,
                        x: d.dimensions[`Average ${selectedDimensions[0]}`] || 0,
                        y: d.dimensions[`Average ${selectedDimensions[1]}`] || 0
                      }))
                      .filter(d => d.x > 0 && d.y > 0)}
                    width={width}
                    height={height}
                    xLabel={selectedDimensions[0]}
                    yLabel={selectedDimensions[1]}
                    colorByRegion={true}
                    showTrendline={true}
                    interactive={true}
                    highlightRegion={selectedRegion !== 'all' ? selectedRegion : null}
                    onHover={setHoveredCountry}
                  />
                )}
              </ChartContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Regional Rankings & Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Regional Performance
            </Typography>
            {mentalHealthData.regionalStats.map((region) => (
              <Box
                key={region.region}
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: hoveredCountry === region.region ? 
                    alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedRegion(region.region === selectedRegion ? 'all' : region.region)}
              >
                <Typography variant="subtitle1">{region.region}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(region.mean / 100) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      flexGrow: 1,
                      bgcolor: alpha(getRegionColor(region.region, theme), 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getRegionColor(region.region, theme)
                      }
                    }}
                  />
                  <Typography variant="caption">
                    {region.mean.toFixed(1)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Top: {region.countries[0]?.Country} ({region.topScore.toFixed(1)})
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}


function Explore() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          globalRankings,
          wellbeingDimensions,
          mhqDistribution,
          musicFeatures,
          musicWellbeingCorrelation,
          explorationSummary
        ] = await Promise.all([
          axios.get('/api/viz/global-rankings'),
          axios.get('/api/viz/wellbeing-dimensions'),
          axios.get('/api/viz/mhq-distribution'),
          axios.get('/api/viz/music-features'),
          axios.get('/api/viz/music-wellbeing-correlation'),
          axios.get('/api/viz/exploration-summary')
        ]);

        setData({
          rankings: globalRankings.data,
          wellbeing: wellbeingDimensions.data,
          distribution: mhqDistribution.data,
          music: musicFeatures.data,
          correlation: musicWellbeingCorrelation.data,
          summary: explorationSummary.data
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sections = [
    { 
      label: 'Overview', 
      icon: <TimelineIcon />, 
      component: OverviewSection 
    },
    { 
      label: 'Music & Happiness', 
      icon: <MusicIcon />, 
      component: MusicHappinessSection 
    },
    { 
      label: 'Mental Health', 
      icon: <PsychologyIcon />, 
      component: MentalHealthSection 
    }
  ];
  if (loading) return <LoadingDisplay />;
  if (error) return <ErrorDisplay message={error} />;

  const ActiveSection = sections[activeSection].component;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.default, 0.95)})`
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Data Explorer
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Dive deep into the relationships between music, happiness, and mental well-being
          </Typography>
        </Box>

        <Tabs
          value={activeSection}
          onChange={(e, newValue) => setActiveSection(newValue)}
          sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
        >
          {sections.map((section, index) => (
            <Tab
              key={index}
              icon={section.icon}
              label={section.label}
              sx={{
                minHeight: 72,
                '& .MuiSvgIcon-root': {
                  fontSize: 24,
                  mb: 1
                }
              }}
            />
          ))}
        </Tabs>

        <Fade in timeout={500}>
          <Box>
            <ActiveSection data={data} />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default Explore;
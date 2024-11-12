// src/services/api.js
const BASE_URL = 'http://localhost:8050/api';

export const fetchMetadata = async () => {
  try {
    const response = await fetch(`${BASE_URL}/metadata`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

export const fetchStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/stats`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

export const fetchOverviewData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/overview_data`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return null;
  }
};

export const fetchFeatureData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/feature_data`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching feature data:', error);
    return null;
  }
};
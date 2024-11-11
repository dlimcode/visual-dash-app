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
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();
    console.log('Stats data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

export const fetchOverviewData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/overview_data`);
    if (!response.ok) {
      throw new Error('Failed to fetch overview data');
    }
    const data = await response.json();
    console.log('Fetched overview data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching overview data:', error);
    throw error;
  }
};

export const fetchFeatureData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/feature_data`);
    if (!response.ok) {
      throw new Error('Failed to fetch feature data');
    }
    const data = await response.json();
    console.log('Fetched feature data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching feature data:', error);
    throw error;
  }
};
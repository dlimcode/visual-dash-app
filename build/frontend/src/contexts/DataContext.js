import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchStats, fetchOverviewData, fetchFeatureData } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    stats: null,
    overview: null,
    features: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [stats, overview, features] = await Promise.all([
          fetchStats(),
          fetchOverviewData(),
          fetchFeatureData()
        ]);
        setData({ stats, overview, features });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext); 
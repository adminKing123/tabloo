import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching API data
 */
export const useApiData = (apiConfig) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiConfig?.url) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiConfig.url, {
          method: apiConfig.method || 'GET',
          headers: apiConfig.headers || {}
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        
        // Extract data from response using path if provided
        let extractedData = result;
        if (apiConfig.responsePath) {
          const paths = apiConfig.responsePath.split('.');
          for (const path of paths) {
            extractedData = extractedData[path];
          }
        }

        setData(Array.isArray(extractedData) ? extractedData : []);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiConfig]);

  return { data, loading, error };
};

/**
 * Custom hook for debouncing values
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

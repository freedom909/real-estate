import { useState, useEffect } from 'react';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';

export default function useListingOptions() {
  const [amenities, setAmenities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
      const results = await Promise.allSettled([
        fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ query: `query GetAmenities { amenities { id name } }` }),
        }),
        fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ query: `query GetCategories { categories { id name type featured_title } }` }),
        }),
        fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ query: `query GetLocations { locations { id name city country } }` }),
        }),
      ]);

      const errors = [];
      const processResult = async (result, name, setData) => {
        if (result.status === 'rejected') {
          errors.push(`Failed to fetch ${name}: ${result.reason.message}`);
          return;
        }
        const response = result.value;
        if (!response.ok) {
          errors.push(`Failed to fetch ${name}: Server responded with status ${response.status}`);
          return;
        }
        const json = await response.json();
        if (json.errors) {
          errors.push(`GraphQL error fetching ${name}: ${json.errors.map(e => e.message).join(', ')}`);
        } else {
          setData(json.data?.[name.toLowerCase()] || []);
        }
      };

      await Promise.all([
        processResult(results[0], 'Amenities', setAmenities),
        processResult(results[1], 'Categories', setCategories),
        processResult(results[2], 'Locations', setLocations),
      ]);

      if (errors.length > 0) {
        setError(new Error(errors.join('\n')));
      }
    } catch (err) {
      console.error('Failed to load options:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return { amenities, categories, locations, loading, error, refetchOptions: fetchOptions };
}
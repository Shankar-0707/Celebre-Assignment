import { useState, useEffect, useCallback } from 'react';

const DEFAULT_API_URL =
  import.meta.env.VITE_PICSUM_API_URL || 'https://picsum.photos/v2/list?limit=30';

/**
 * Custom Hook: useFetchPhotos
 * Fetches photos from Picsum API and manages loading, error, and photos state.
 *
 * @param {string} [apiUrl] - Optional custom API endpoint URL.
 * @returns {{ photos: Array, loading: boolean, error: string|null, refetch: Function, fetchPhotos: Function }}
 */
export const useFetchPhotos = (apiUrl = DEFAULT_API_URL) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPhotos = useCallback(
    async (isSimulatedError = false) => {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      try {
        if (isSimulatedError) {
          throw new Error('Simulated network error: Failed to fetch photos from Picsum API.');
        }

        const response = await fetch(apiUrl, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Received invalid data format from Picsum API');
        }

        setPhotos(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timed out. The server took too long to respond.');
        } else {
          setError(err.message || 'An unexpected error occurred while fetching photos.');
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    loading,
    error,
    refetch: fetchPhotos,
    fetchPhotos,
    // Support both object destructuring { photos, loading, error } and array destructuring [photos, loading, error]
    [Symbol.iterator]: function* () {
      yield photos;
      yield loading;
      yield error;
      yield fetchPhotos;
    },
  };
};

export default useFetchPhotos;

import { useEffect, useState } from 'react';
import axios from 'axios';

export interface LiveStream {
  channel_name: string;
  logo: string;
  catagory: string;
  url: string;
  license_key?: string;
}

const API_BASE = 'https://sub.cinepapa.com';

/**
 * Custom hook to fetch live streams for a given category.
 * @param category The category string (e.g., "dangal", "epic")
 */
export function useLiveStreams(category: string) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;

    const fetchStreams = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get<LiveStream[]>(
          `${API_BASE}/?${encodeURIComponent(category)}`
        );
        setStreams(data);
      } catch (err) {
        console.error('Failed to fetch streams:', err);
        setError('Failed to load streams.');
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, [category]);

  return { streams, loading, error };
}

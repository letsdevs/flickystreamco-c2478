import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// API Base URL
export const CATEGORIES_API = 'https://sub.cinepapa.com';

export interface Channel {
  channel_name: string;
  logo: string;
  catagory: string; // note: typo kept because API sends it this way
  url: string;
  license_key: string;
}

// Fetch all categories
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const { data } = await axios.get<string[]>(CATEGORIES_API);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching categories');
  }
};

// Fetch channels for a specific category
export const fetchChannelsByCategory = async (category: string): Promise<Channel[]> => {
  try {
    const { data } = await axios.get<Channel[]>(`${CATEGORIES_API}/?${category}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch channels for ${category}: ${error.message}`);
    }
    throw new Error(`An unexpected error occurred while fetching ${category} channels`);
  }
};

// React Query hook for categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

// React Query hook for channels by category
export const useChannels = (category: string) => {
  return useQuery({
    queryKey: ['channels', category],
    queryFn: () => fetchChannelsByCategory(category),
    enabled: !!category, // only fetch when category is provided
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

import { useMemo } from 'react';

/**
 * Utility function to extract the short name (last word) from a full name string.
 */
export const getShortName = (fullName?: string | null): string => {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/).pop() || '';
};

/**
 * Hook wrapper to extract the short name with memoization.
 */
export const useShortName = (fullName?: string | null): string => {
  return useMemo(() => getShortName(fullName), [fullName]);
};

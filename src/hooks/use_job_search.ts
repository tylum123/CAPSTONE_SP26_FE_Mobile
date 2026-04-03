/* AI CONTEXT:
 * Action: Manages state and logic for advanced job searching and filtering.
 * Inputs: Initial filter parameters, search keywords.
 * Outputs: Filter state, search results, loading/error status, and search handlers.
 * Dependencies: jobService, JobSearchFilterRequest, JobDiscoveryDTO. */

import { useState, useCallback, useEffect } from "react";
import { jobService } from "../services/export_services";
import { 
  JobSearchFilterRequest, 
  JobDiscoveryDTO, 
  PaginatedJobDiscoveryResponse 
} from "../types/export_type_definitions";

// Extend local filter request to include excludeApplied
export interface ExtendedJobFilter extends JobSearchFilterRequest {
  excludeApplied?: boolean;
}

const INITIAL_FILTERS: ExtendedJobFilter = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: "distance",
  excludeApplied: false,
};

export function useJobSearch() {
  const [filters, setFilters] = useState<ExtendedJobFilter>(INITIAL_FILTERS);
  const [results, setResults] = useState<JobDiscoveryDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedJobPostIds, setAppliedJobPostIds] = useState<Set<string>>(new Set());

  /**
   * Partially updates the filter state and resets pagination to page 1.
   */
  const updateFilter = useCallback((updates: Partial<JobSearchFilterRequest>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      pageNumber: 1, // Reset page when filters change
    }));
  }, []);

  /**
   * Resets filters to the initial state and clears results.
   */
  const reset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setResults([]);
    setTotalCount(0);
    setError(null);
  }, []);

  /**
   * Fetches the user's application history to track which jobs are already applied.
   */
  const refreshAppliedStatus = useCallback(async () => {
    try {
      const apps = await jobService.getApplications();
      const ids = new Set(apps.map((a) => a.jobPostId));
      setAppliedJobPostIds(ids);
    } catch (err) {
      console.error("Failed to fetch application status for filtering", err);
    }
  }, []);

  /**
   * Executes the search request using current or custom filters.
   */
  const search = useCallback(async (customFilters?: JobSearchFilterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchData = customFilters || filters;
      const response: PaginatedJobDiscoveryResponse = await jobService.searchJobs(searchData);
      
      setResults(response.jobs || []);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error("Advanced search error:", err);
      setError(err.message || "Đã xảy ra lỗi khi tìm kiếm công việc.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Loads the next page of results and appends them to the current list.
   */
  const loadMore = useCallback(async () => {
    if (isLoading || results.length >= (totalCount || 0)) return;

    setIsLoading(true);
    try {
      const nextPage = (filters.pageNumber || 1) + 1;
      const nextFilters = { ...filters, pageNumber: nextPage };
      
      const response: PaginatedJobDiscoveryResponse = await jobService.searchJobs(nextFilters);
      
      setResults((prev) => [...prev, ...(response.jobs || [])]);
      setFilters(nextFilters);
    } catch (err: any) {
      console.error("Load more search error:", err);
      setError("Không thể tải thêm kết quả.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, isLoading, results.length, totalCount]);

  /**
   * Executes a specialized search using GET endpoints for better performance on specific criteria.
   */
  const specializedSearch = useCallback(async (type: 'urgent' | 'today' | 'tomorrow' | 'weekend', location?: { latitude: number, longitude: number }) => {
    setResults([]); // Immediate clear for instant feedback
    setIsLoading(true);
    setError(null);
    try {
      let data: JobDiscoveryDTO[] = [];
      if (type === 'urgent' && location) {
        data = await jobService.getUrgentJobs({ ...location, maxDistanceKm: filters.maxDistanceKm || 50 });
      } else if (['today', 'tomorrow', 'weekend'].includes(type)) {
        data = await jobService.getJobsByDate(type);
      }
      
      setResults(data);
      setTotalCount(data.length);
      setFilters(prev => ({ ...prev, pageNumber: 1, dateFilter: type !== 'urgent' ? type : undefined, onlyUrgent: type === 'urgent' }));
    } catch (err: any) {
      console.error("Specialized search error:", err);
      setError(err.message || "Đã xảy ra lỗi khi tìm kiếm.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.maxDistanceKm]);

  return {
    filters,
    results,
    totalCount,
    isLoading,
    error,
    updateFilter,
    reset,
    search,
    specializedSearch,
    loadMore,
    appliedJobPostIds,
    refreshAppliedStatus,
  };
}

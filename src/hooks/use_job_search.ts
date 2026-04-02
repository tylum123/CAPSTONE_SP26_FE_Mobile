/* AI CONTEXT:
 * Action: Manages state and logic for advanced job searching and filtering.
 * Inputs: Initial filter parameters, search keywords.
 * Outputs: Filter state, search results, loading/error status, and search handlers.
 * Dependencies: jobService, JobSearchFilterRequest, JobDiscoveryDTO. */

import { useState, useCallback } from "react";
import { jobService } from "../services/export_services";
import { 
  JobSearchFilterRequest, 
  JobDiscoveryDTO, 
  PaginatedJobDiscoveryResponse 
} from "../types/export_type_definitions";

const INITIAL_FILTERS: JobSearchFilterRequest = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: "distance",
};

export function useJobSearch() {
  const [filters, setFilters] = useState<JobSearchFilterRequest>(INITIAL_FILTERS);
  const [results, setResults] = useState<JobDiscoveryDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    filters,
    results,
    totalCount,
    isLoading,
    error,
    updateFilter,
    reset,
    search,
    loadMore,
  };
}

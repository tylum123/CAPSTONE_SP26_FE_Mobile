/* AI CONTEXT:
 * Action: Manages state and logic for advanced job searching and filtering.
 * Inputs: Initial filter parameters, search keywords.
 * Outputs: Filter state, search results, loading/error status, and search handlers.
 * Dependencies: jobService, JobSearchFilterRequest, JobDiscoveryDTO. */

import { useState, useCallback } from "react";
import { jobService, nominatimService } from "../services/export_services";
import { 
  JobSearchFilterRequest, 
  JobDiscoveryDTO, 
} from "../types/export_type_definitions";

// Extend local filter request to include excludeApplied
export interface ExtendedJobFilter extends JobSearchFilterRequest {
  excludeApplied?: boolean;
}

const INITIAL_FILTERS: ExtendedJobFilter = {
  pageNumber: 1,
  pageSize: 20,
  excludeApplied: false,
};

import { DEMO_JOB_POSTS } from "../constants/demoData";
import { mapJobPostToUI } from "../utils/mapperUtils";
import { handleError } from "../utils/errorHandler";


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
      const ids = new Set(apps.filter(a => a.statusId !== 3 && a.statusId !== 4).map((a) => a.jobPostId));
      setAppliedJobPostIds(ids);
    } catch (err) {
      // Silently ignore application fetch error here
    }
  }, []);

  /**
   * Executes the search request using current or custom filters.
   * @returns The number of jobs found.
   */
  const search = useCallback(async (customFilters?: Partial<ExtendedJobFilter>, isDemo: boolean = false) => {
    setIsLoading(true);
    setError(null);
    let resultCount = 0;
    try {
      if (isDemo) {

        // DEMO MODE: Local filtering
        let filtered = [...DEMO_JOB_POSTS];
        
        const keyword = (customFilters?.searchKeyword || filters.searchKeyword)?.toLowerCase();
        if (keyword) {
          filtered = filtered.filter(j => 
            j.title.toLowerCase().includes(keyword) || 
            j.description.toLowerCase().includes(keyword) ||
            j.address.toLowerCase().includes(keyword)
          );
        }

        const typeId = customFilters?.jobTypeId || filters.jobTypeId;
        if (typeId) {
          filtered = filtered.filter(j => j.jobTypeId === Number(typeId));
        }

        const catId = customFilters?.jobCategoryId || filters.jobCategoryId;
        if (catId) {
          filtered = filtered.filter(j => j.jobCategoryId === catId);
        }

        const urgent = customFilters?.onlyUrgent ?? filters.onlyUrgent;
        if (urgent !== undefined) {
          filtered = filtered.filter(j => j.isUrgent === urgent);
        }

        // Map to JobDiscoveryDTO ensuring no fields are missing for UI
        const mappedResults = filtered.map(j => ({
          ...mapJobPostToUI(j),
          distanceKm: Math.random() * 10,
          matchScore: 0.8 + Math.random() * 0.2
        })) as unknown as JobDiscoveryDTO[];

        setResults(mappedResults);
        setTotalCount(mappedResults.length);
        setIsLoading(false);
        return mappedResults.length;
      }


      // Merge with existing filters but reset page to 1 for new searches
      // IMPORTANT: Preserve coordinates from current filters if not provided in customFilters
      const mergedFilters = { 
        ...filters, 
        ...customFilters, 
        pageNumber: customFilters?.pageNumber || 1,
        workerLatitude: customFilters?.workerLatitude !== undefined ? customFilters.workerLatitude : filters.workerLatitude,
        workerLongitude: customFilters?.workerLongitude !== undefined ? customFilters.workerLongitude : filters.workerLongitude,
      };

      // Ensure maxDistanceKm is at least 3000 (Toàn quốc) if NO specific distance is provided but location exists
      // This allows the backend to return results without strict filtering unless requested
      if (mergedFilters.workerLatitude && mergedFilters.workerLongitude && mergedFilters.maxDistanceKm === undefined) {
        mergedFilters.maxDistanceKm = 3000;
      }

      const response: any = await jobService.searchJobs(mergedFilters);

      // ULTIMATE DEFENSIVE DECODING: 
      // Handle PascalCase, camelCase, direct Array, or any object property that is an array
      let jobs: JobDiscoveryDTO[] = [];
      let total: number = 0;

      if (Array.isArray(response)) {
        jobs = response;
      } else if (response && typeof response === 'object') {
        // 1. Try common property names
        jobs = response.jobs || response.Jobs || response.items || response.Items || response.data || response.Data || [];
        total = response.totalCount || response.TotalCount || response.total || 0;

        // 2. Fallback: If jobs is still empty, find the first property that is an array
        if (jobs.length === 0) {
          const firstArray = Object.values(response).find(val => Array.isArray(val)) as JobDiscoveryDTO[];
          if (firstArray) jobs = firstArray;
        }

        // 3. Fallback total
        if (total === 0) total = jobs.length;
      }
      // Map results to UI-friendly format immediately to show results as fast as possible
      const mappedJobs = jobs.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      setResults(mappedJobs);
      setTotalCount(total);
      resultCount = total;

      // PERFORM GEOCODING & DISTANCE CALCULATION IN BACKGROUND
      // Parallelized for maximum speed
      (async () => {
        let hasChanges = false;
        await Promise.all(mappedJobs.map(async (job) => {
          if (!job.latitude || !job.longitude) {
            const coords = await nominatimService.geocodeAddress(job.address);
            if (coords) {
              job.latitude = coords.latitude;
              job.longitude = coords.longitude;
              hasChanges = true;
            }
          }
          
          if (mergedFilters.workerLatitude && mergedFilters.workerLongitude && job.latitude && job.longitude) {
            const oldDist = job.distanceKm;
            job.distanceKm = nominatimService.calculateDistanceKm(
              mergedFilters.workerLatitude,
              mergedFilters.workerLongitude,
              job.latitude,
              job.longitude
            );
            if (oldDist !== job.distanceKm) hasChanges = true;
          }
        }));
        
        if (hasChanges) {
          setResults([...mappedJobs]);
        }
      })();

      // Refresh applied status whenever we search to ensure "Exclude Applied" is accurate
      refreshAppliedStatus();
    } catch (err: any) {
      handleError(err, "Đã xảy ra lỗi khi tìm kiếm công việc.");
      const errorMsg = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tìm kiếm công việc.";
      setError(errorMsg);
      setResults([]);
      resultCount = 0;
    } finally {
      setIsLoading(false);
    }
    return resultCount;
  }, [filters, refreshAppliedStatus]);


  /**
   * Loads the next page of results and appends them to the current list.
   */
  const loadMore = useCallback(async () => {
    if (isLoading || results.length >= (totalCount || 0)) return;

    setIsLoading(true);
    try {
      const nextPage = (filters.pageNumber || 1) + 1;
      const nextFilters = { ...filters, pageNumber: nextPage };
      
      const response: any = await jobService.searchJobs(nextFilters);
      
      // Use SAME robust decoding for pagination
      let newJobs: JobDiscoveryDTO[] = [];
      if (Array.isArray(response)) {
        newJobs = response;
      } else if (response && typeof response === 'object') {
        newJobs = response.jobs || response.Jobs || response.items || response.Items || response.data || response.Data || [];
        if (newJobs.length === 0) {
          const firstArray = Object.values(response).find(val => Array.isArray(val)) as JobDiscoveryDTO[];
          if (firstArray) newJobs = firstArray;
        }
      }
      
      const mappedNewJobs = newJobs.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      setResults((prev) => [...prev, ...mappedNewJobs]);
      setFilters(nextFilters);

      // PERFORM GEOCODING & DISTANCE CALCULATION FOR NEW RESULTS IN BACKGROUND
      (async () => {
        let hasChanges = false;
        await Promise.all(mappedNewJobs.map(async (job) => {
          if (!job.latitude || !job.longitude) {
            const coords = await nominatimService.geocodeAddress(job.address);
            if (coords) {
              job.latitude = coords.latitude;
              job.longitude = coords.longitude;
              hasChanges = true;
            }
          }

          if (filters.workerLatitude && filters.workerLongitude && job.latitude && job.longitude) {
            const oldDist = job.distanceKm;
            job.distanceKm = nominatimService.calculateDistanceKm(
              filters.workerLatitude,
              filters.workerLongitude,
              job.latitude,
              job.longitude
            );
            if (oldDist !== job.distanceKm) hasChanges = true;
          }
        }));
        
        if (hasChanges) {
          setResults((prev) => [...prev]);
        }
      })();
    } catch (err: any) {
      handleError(err, "Không thể tải thêm kết quả.");
      setError("Không thể tải thêm kết quả.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, isLoading, results.length, totalCount]);

  /**
   * Executes a specialized search using GET endpoints for better performance on specific criteria.
   */
  const specializedSearch = useCallback(async (type: 'urgent' | 'today' | 'tomorrow' | 'upcoming', location?: { latitude: number, longitude: number }) => {
    setResults([]); // Immediate clear for instant feedback
    setIsLoading(true);
    setError(null);
    try {
      let data: JobDiscoveryDTO[] = [];
      if (type === 'urgent' && location) {
        data = await jobService.getUrgentJobs({ ...location, maxDistanceKm: filters.maxDistanceKm || 50 });
      } else if (['today', 'tomorrow', 'upcoming'].includes(type)) {
        data = await jobService.getJobsByDate(type as any);
      }
      
      // Parallel geocoding and distance calculation
      await Promise.all(data.map(async (job) => {
        if (!job.latitude || !job.longitude) {
          const coords = await nominatimService.geocodeAddress(job.address);
          if (coords) {
            job.latitude = coords.latitude;
            job.longitude = coords.longitude;
          }
        }

        const currentLat = location?.latitude || filters.workerLatitude;
        const currentLon = location?.longitude || filters.workerLongitude;

        if (currentLat && currentLon && job.latitude && job.longitude) {
          job.distanceKm = nominatimService.calculateDistanceKm(
            currentLat,
            currentLon,
            job.latitude,
            job.longitude
          );
        }
      }));

      const mappedData = data.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      setResults(mappedData);
      setTotalCount(data.length);
      setFilters(prev => ({ 
        ...prev, 
        pageNumber: 1, 
        dateFilter: type !== 'urgent' ? type : undefined, 
        onlyUrgent: type === 'urgent',
        workerLatitude: location?.latitude || prev.workerLatitude,
        workerLongitude: location?.longitude || prev.workerLongitude
      }));
    } catch (err: any) {
      handleError(err, "Đã xảy ra lỗi khi tìm kiếm.");
      setError(err.message || "Đã xảy ra lỗi khi tìm kiếm.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.maxDistanceKm]);

  /**
   * Executes a specialized search by job type using the new GET endpoint.
   */
  const searchByType = useCallback(async (typeId: string | number) => {
    setResults([]);
    setIsLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobsByType(Number(typeId));
      
      // Parallel geocoding and distance calculation
      await Promise.all(data.map(async (job) => {
        if (!job.latitude || !job.longitude) {
          const coords = await nominatimService.geocodeAddress(job.address);
          if (coords) {
            job.latitude = coords.latitude;
            job.longitude = coords.longitude;
          }
        }

        if (filters.workerLatitude && filters.workerLongitude && job.latitude && job.longitude) {
          job.distanceKm = nominatimService.calculateDistanceKm(
            filters.workerLatitude,
            filters.workerLongitude,
            job.latitude,
            job.longitude
          );
        }
      }));

      const mappedData = data.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      setResults(mappedData);
      setTotalCount(data.length);
      setFilters(prev => ({ ...prev, pageNumber: 1, jobTypeId: Number(typeId) }));
    } catch (err: any) {
      handleError(err, "Không thể tải danh sách việc theo loại.");
      setError("Không thể tải danh sách việc theo loại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    searchByType,
  };
}

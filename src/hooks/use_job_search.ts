/* AI CONTEXT:
 * Action: Manages state and logic for advanced job searching and filtering.
 * Inputs: Initial filter parameters, search keywords.
 * Outputs: Filter state, search results, loading/error status, and search handlers.
 * Dependencies: jobService, JobSearchFilterRequest, JobDiscoveryDTO. */

import { useState, useCallback, useRef } from "react";
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
  pageSize: 10,
  excludeApplied: false,
  workerLatitude: 0,
  workerLongitude: 0,
  maxDistanceKm: 3000,
};

import { DEMO_JOB_POSTS } from "../constants/demoData";
import { mapJobPostToUI } from "../utils/mapperUtils";
import { handleError } from "../utils/errorHandler";


export function useJobSearch() {
  const [filters, setFilters] = useState<ExtendedJobFilter>(INITIAL_FILTERS);
  const [results, setResults] = useState<JobDiscoveryDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Start true — loading indicator shows immediately until first search completes
  const [error, setError] = useState<string | null>(null);
  const [appliedJobPostIds, setAppliedJobPostIds] = useState<Set<string>>(new Set());

  // REQUEST COUNTER: Prevents stale responses from overwriting newer results.
  // Each search() call increments this and captures the current value.
  // Before applying results, we check if the captured ID still matches — if not, discard.
  const searchIdRef = useRef(0);

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
    // Increment counter to invalidate any in-flight requests
    const thisSearchId = ++searchIdRef.current;
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
        const workerLat = customFilters?.workerLatitude || filters.workerLatitude;
        const workerLon = customFilters?.workerLongitude || filters.workerLongitude;

        const mappedResults = filtered.map(j => {
          const mapped = mapJobPostToUI(j);
          let dist = 0;
          
          if (workerLat && workerLon && j.latitude && j.longitude) {
            dist = nominatimService.calculateDistanceKm(workerLat, workerLon, j.latitude, j.longitude);
          } else {
            // Realistic fallback for demo if no coords
            dist = (Math.random() * 5) + 1; 
          }

          return {
            ...mapped,
            distanceKm: dist,
            matchScore: 0.8 + Math.random() * 0.2
          };
        }) as unknown as JobDiscoveryDTO[];

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

      const { excludeApplied, ...requestData } = mergedFilters;
      
      // ALIASING: Some backends use 'page'/'size'
      (requestData as any).page = requestData.pageNumber;
      (requestData as any).size = requestData.pageSize;

      // CLEANUP: If coordinates are missing or zero, we MUST remove distance-related filters
      // because the backend cannot calculate distance from (0,0) or null.
      if (!requestData.workerLatitude || !requestData.workerLongitude) {
        delete requestData.workerLatitude;
        delete requestData.workerLongitude;
        delete requestData.maxDistanceKm;
        console.log("[Search] Omit location filters (Global Search)");
      } else {
        // Ensure they are numbers
        requestData.workerLatitude = Number(requestData.workerLatitude);
        requestData.workerLongitude = Number(requestData.workerLongitude);
      }

      console.log("[Search] Request Data:", JSON.stringify(requestData));
      const response: any = await jobService.searchJobs(requestData as any);

      // STALE CHECK: If a newer search was fired while this one was in-flight, discard this response
      if (thisSearchId !== searchIdRef.current) {
        console.log(`[Search] Discarding stale response (id=${thisSearchId}, current=${searchIdRef.current})`);
        return 0;
      }

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
      let mappedJobs = jobs.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];

      // Client-side filtering for applied jobs if requested
      if (excludeApplied && appliedJobPostIds.size > 0) {
        mappedJobs = mappedJobs.filter(job => !appliedJobPostIds.has(job.id));
      }

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
            job.distanceKm = await nominatimService.getRouteDistanceKm(
              mergedFilters.workerLatitude,
              mergedFilters.workerLongitude,
              job.latitude,
              job.longitude
            );
            if (oldDist !== job.distanceKm) hasChanges = true;
          }
        }));
        
        if (hasChanges && thisSearchId === searchIdRef.current) {
          setResults([...mappedJobs]);
        }
      })();

      // Refresh applied status whenever we search to ensure "Exclude Applied" is accurate
      refreshAppliedStatus();
    } catch (err: any) {
      // Only apply error state if this is still the latest search
      if (thisSearchId === searchIdRef.current) {
        handleError(err, "Đã xảy ra lỗi khi tìm kiếm công việc.");
        const errorMsg = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tìm kiếm công việc.";
        setError(errorMsg);
        setResults([]);
        resultCount = 0;
      }
    } finally {
      // Only clear loading if this is still the latest search
      if (thisSearchId === searchIdRef.current) {
        setIsLoading(false);
      }
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
      
      const { excludeApplied, ...requestData } = nextFilters;
      const response: any = await jobService.searchJobs(requestData as any);
      
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
      
      // Map and Filter
      let mappedNewJobs = newJobs.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      
      if (excludeApplied && appliedJobPostIds.size > 0) {
        mappedNewJobs = mappedNewJobs.filter(job => !appliedJobPostIds.has(job.id));
      }

      setResults(prev => [...prev, ...mappedNewJobs]);
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
            job.distanceKm = await nominatimService.getRouteDistanceKm(
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
      
      const mappedData = data.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      setResults(mappedData);
      setTotalCount(data.length);

      // Parallel geocoding and distance calculation IN BACKGROUND
      (async () => {
        let hasChanges = false;
        await Promise.all(mappedData.map(async (job) => {
          if (!job.latitude || !job.longitude) {
            const coords = await nominatimService.geocodeAddress(job.address || "");
            if (coords) {
              job.latitude = coords.latitude;
              job.longitude = coords.longitude;
              hasChanges = true;
            }
          }

          const currentLat = location?.latitude || filters.workerLatitude;
          const currentLon = location?.longitude || filters.workerLongitude;

          if (currentLat && currentLon && job.latitude && job.longitude) {
            const newDist = await nominatimService.getRouteDistanceKm(
              currentLat,
              currentLon,
              job.latitude,
              job.longitude
            );
            if (Math.abs((job.distanceKm || 0) - newDist) > 0.1) {
              job.distanceKm = newDist;
              hasChanges = true;
            }
          }
        }));
        if (hasChanges) {
          setResults([...mappedData]);
        }
      })();
      setFilters(prev => ({ 
        ...prev, 
        pageNumber: 1, 
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
      
      const mappedData = data.map(j => mapJobPostToUI(j)) as unknown as JobDiscoveryDTO[];
      setResults(mappedData);
      setTotalCount(data.length);

      // Parallel geocoding and distance calculation IN BACKGROUND
      (async () => {
        let hasChanges = false;
        await Promise.all(mappedData.map(async (job) => {
          if (!job.latitude || !job.longitude) {
            const coords = await nominatimService.geocodeAddress(job.address || "");
            if (coords) {
              job.latitude = coords.latitude;
              job.longitude = coords.longitude;
              hasChanges = true;
            }
          }

          if (filters.workerLatitude && filters.workerLongitude && job.latitude && job.longitude) {
            const newDist = await nominatimService.getRouteDistanceKm(
              filters.workerLatitude,
              filters.workerLongitude,
              job.latitude,
              job.longitude
            );
            if (Math.abs((job.distanceKm || 0) - newDist) > 0.1) {
              job.distanceKm = newDist;
              hasChanges = true;
            }
          }
        }));
        if (hasChanges) {
          setResults([...mappedData]);
        }
      })();
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

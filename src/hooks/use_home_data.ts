/**
 * useHomeData — Custom hook tách toàn bộ data-fetching logic ra khỏi WorkerHomeScreen.
 *
 * Trước đây: loadData() (200+ dòng) nằm trực tiếp trong WorkerHomeScreen component.
 * Sau khi refactor: Screen chỉ gọi hook này và render kết quả.
 *
 * Bao gồm:
 * - Fetch jobs gần đây (nearby / fallback global)
 * - Fetch applications và phân loại (pending / active)
 * - Fetch worker profile, wallet, stats
 * - Geocode địa chỉ (nominatim fallback)
 * - Demo mode support
 *
 * Usage:
 *   const { nearbyJobs, pendingApplications, activeApplications, profileData, isLoading, refreshing, onRefresh } = useHomeData();
 */

import { useState, useCallback, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  jobService,
  workerProfileService,
  nominatimService,
  dailyReportService,
  walletService,
} from '../services/export_services';
import { mapApplicationToUI, mapJobPostToUI } from '../utils/mapperUtils';
import { DEMO_JOB_POSTS, DEMO_APPLICATIONS, DEMO_WORKER_PROFILE } from '../constants/demoData';
import type { Job } from '../types/export_type_definitions';


// ─── Types ───────────────────────────────────────────────────────────────────

interface MappedApplication {
  id: string;
  jobPostId: string;
  title: string;
  farmer: string;
  date: string;
  status: string;
  statusId: number;
  reportedToday: boolean;
}

interface ProfileData {
  rating: number | null;
  totalJobsCompleted: number | null;
  avatarUrl: string | null;
  todayEarnings: number | null;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface HomeDataResult {
  nearbyJobs: Job[];
  pendingApplications: MappedApplication[];
  activeApplications: MappedApplication[];
  profileData: ProfileData;

  userLocation: UserLocation | null;
  radiusKm: number;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

// ─── Default Cần Thơ location ─────────────────────────────────────────────────

const DEFAULT_LOCATION: UserLocation = { latitude: 10.762622, longitude: 106.660172 };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHomeData(): HomeDataResult {
  const { user, isAuthenticated } = useAuth();

  const [nearbyJobs, setNearbyJobs]               = useState<Job[]>([]);
  const [pendingApplications, setPendingApplications] = useState<MappedApplication[]>([]);
  const [activeApplications, setActiveApplications]   = useState<MappedApplication[]>([]);
  const [profileData, setProfileData]             = useState<ProfileData>({
    rating: null,
    totalJobsCompleted: null,
    avatarUrl: null,
    todayEarnings: null,
  });

  const [userLocation, setUserLocation]           = useState<UserLocation | null>(null);
  const [radiusKm, setRadiusKm]                   = useState<number>(10);
  const [isLoading, setIsLoading]                 = useState(true);
  const [refreshing, setRefreshing]               = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let sourceJobs: any[]    = [];
    let sourceApps: any[]    = [];
    let sourceProfile: any   = null;

    // ── 1. Fetch base data ──────────────────────────────────────────────────

    if (user?.isDemo) {
      sourceJobs    = DEMO_JOB_POSTS;
      sourceApps    = DEMO_APPLICATIONS;
      sourceProfile = DEMO_WORKER_PROFILE;
      setProfileData({
        rating: DEMO_WORKER_PROFILE.averageRating,
        totalJobsCompleted: DEMO_WORKER_PROFILE.totalJobsCompleted,
        avatarUrl: DEMO_WORKER_PROFILE.avatarUrl || null,
        todayEarnings: 450000,
      });
    } else {
      try {
        const [jobs, apps, profile, wallet, dashboard] = await Promise.all([
          jobService.getJobPosts(),
          jobService.getApplications(),
          workerProfileService.getProfile(),
          walletService.getWallet(),
          workerProfileService.getDashboardData().catch(() => null),
        ]);

        sourceJobs    = jobs;
        sourceApps    = apps;
        sourceProfile = profile;



        const prefRadius = profile?.travelRadiusKmPreference || 10;
        setRadiusKm(prefRadius);

        // Calculate today's earnings from wallet transactions
        let todayEarnings = 0;
        if (wallet?.id) {
          const txsResult = await walletService.getTransactions(wallet.id);
          const todayLocal = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
          todayEarnings = (txsResult?.data || [])
            .filter(tx => tx.createdAt.startsWith(todayLocal) && tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0);
        }

        setProfileData({
          rating: dashboard?.averageRating ?? profile?.averageRating ?? null,
          totalJobsCompleted: dashboard?.completedJobs ?? profile?.totalJobsCompleted ?? null,
          avatarUrl: profile?.avatarUrl || null,
          todayEarnings,
        });
      } catch (err: any) {
        if (isAuthenticated) {
          console.error('[useHomeData] Base fetch error:', err?.message);
        }
      }
    }

    // ── 2. Geocode + fetch nearby jobs ──────────────────────────────────────

    let lat = DEFAULT_LOCATION.latitude;
    let lon = DEFAULT_LOCATION.longitude;

    if (sourceProfile?.primaryLocation && sourceProfile.id !== 'demo-worker-123') {
      try {
        const loc = await nominatimService.geocodeAddress(sourceProfile.primaryLocation);
        if (loc) {
          setUserLocation(loc);
          lat = loc.latitude;
          lon = loc.longitude;
        }
      } catch {
        setUserLocation(DEFAULT_LOCATION);
      }
    } else {
      setUserLocation(DEFAULT_LOCATION);
    }

    const prefRadius = sourceProfile?.travelRadiusKmPreference || radiusKm;

    let finalizedNearby: any[] = [];
    let todayReports: any[]    = [];

    if (user?.isDemo) {
      finalizedNearby = sourceJobs;
      todayReports = [{ jobApplicationId: 'app-456', workDate: new Date().toISOString() }];
    } else {
      const [nearby, reports] = await Promise.allSettled([
        jobService.getNearbyJobs({ latitude: lat, longitude: lon, maxDistanceKm: prefRadius }),
        sourceProfile?.id
          ? dailyReportService.getWorkerReports(sourceProfile.id)
          : Promise.resolve([]),
      ]);

      finalizedNearby = nearby.status === 'fulfilled' ? nearby.value : [];
      todayReports    = reports.status === 'fulfilled' ? reports.value : [];
    }

    // Fallback: show all jobs if no nearby found
    if (finalizedNearby.length === 0 && sourceJobs.length > 0) {
      // Only show Published jobs (statusId === 2) when falling back
      finalizedNearby = sourceJobs.filter((j: any) => j.statusId === 2);
    }

    // ── 3. Map jobs ─────────────────────────────────────────────────────────

    const myProfileId   = sourceProfile?.id;
    const myAppliedIds  = new Set(
      sourceApps
        .filter(a => (a.worker?.id || a.workerId) === myProfileId)
        .map(a => String(a.jobPostId))
    );

    const availableJobs = finalizedNearby.filter(j => !myAppliedIds.has(String(j.id)));

    setNearbyJobs(
      availableJobs.map((j: any): Job => {
        const m = mapJobPostToUI(j);
        return {
          id: j.id,
          title: m.title,
          farmer: m.farmer.name,
          farmerAvatar: m.farmer.avatar,
          location: m.location.address,
          distanceKm: m.location.distance || 0,
          matchScore: m.matchScore ?? undefined,
          wage: m.wage.toLocaleString('vi-VN'),
          wageAmount: m.wage,
          duration: m.duration,
          date: m.date,
          rating: m.farmer.rating,
          urgent: m.urgent,
          wageUnit: m.wageUnit
        };
      })
    );

    // ── 4. Map applications ─────────────────────────────────────────────────

    const myAppsMap = new Map<string, any>();
    sourceApps.forEach(a => {
      const workerId = a.worker?.id || a.workerId;
      if (workerId === myProfileId) {
        myAppsMap.set(String(a.jobPostId), a);
      }
    });

    const myApps   = Array.from(myAppsMap.values()).reverse();
    const mapApp   = (app: any): MappedApplication => {
      const job = sourceJobs.find(j => String(j.id) === String(app.jobPostId));
      const ui  = mapApplicationToUI(app, job);
      return {
        ...ui,
        reportedToday: todayReports.some(r => String(r.jobApplicationId) === String(app.id)),
      };
    };

    setPendingApplications(
      myApps.filter(a => a.statusId === 1 || a.statusId === 3).map(mapApp)
    );

    setActiveApplications(
      myApps
        .filter(a => {
          if (a.statusId !== 2) return false;
          const job = sourceJobs.find(j => String(j.id) === String(a.jobPostId));
          const statusId = (job as any)?.statusId ?? 2;
          return statusId !== 5 && statusId !== 6; // exclude Completed/Cancelled jobs
        })
        .map(mapApp)
    );

    setIsLoading(false);
    setRefreshing(false);
  }, [isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
    const sub = DeviceEventEmitter.addListener('REFRESH_DATA', loadData);
    return () => sub.remove();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  return {
    nearbyJobs,
    pendingApplications,
    activeApplications,
    profileData,

    userLocation,
    radiusKm,
    isLoading,
    refreshing,
    onRefresh,
  };
}

export interface Job {
  id: string | number;
  title: string;
  farmer: string;
  farmerAvatar?: string;
  location: string;
  distance?: string; 
  distanceKm?: number;
  matchScore?: number;
  wage: string;
  wageAmount?: number;
  duration: string;
  rating: number;
  urgent?: boolean;
  date?: string;
}

export interface UpcomingJob {
  id: string | number;
  title: string;
  farmer: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed";
}

export interface Applicant {
  id: number;
  name: string;
  avatar?: string;
  job: string;
  appliedAt: string;
  rating: number;
  completedJobs: number;
  status: "pending" | "approved" | "rejected";
}

export interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export * from "./api";
export * from "./worker";

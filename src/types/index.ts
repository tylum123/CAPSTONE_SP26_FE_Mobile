export interface Job {
  id: number;
  title: string;
  farmer: string;
  farmerAvatar?: string;
  location: string;
  distance: string;
  wage: string;
  duration: string;
  rating: number;
  urgent?: boolean;
}

export interface UpcomingJob {
  id: number;
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

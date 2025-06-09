// Define constants for session statuses
export const SESSION_STATUS = {
  COMPLETED: "COMPLETED",
  ONGOING: "ONGOING",
  CANCELLED: "CANCELLED",
  OPEN: "OPEN",
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export interface Session {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  status: SessionStatus;
  isCollaborative: boolean;
  startDate: string;
  startTime: string;
  duration: string;
  instructor: string;
  instructorAvatar: string;
  instructorColor: string;
  languages: string[];
  participants: number;
  maxParticipants: number;
  isCompleted: boolean;
  completedDate?: string;
  score?: number;
}

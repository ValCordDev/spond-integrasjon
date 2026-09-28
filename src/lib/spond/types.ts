/**
 * Types for Spond's unofficial API. Spond does not publish official API docs;
 * these shapes are reconstructed from community reverse-engineering (see
 * README.md for sources) and may drift if Spond changes their backend.
 */

export interface SpondLoginResponse {
  accessToken: { token: string; expiration: string };
  refreshToken?: { token: string; expiration?: string };
  passwordToken?: { token: string; expiration?: string };
}

export interface SpondProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  [key: string]: unknown;
}

export interface SpondMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  subGroups?: string[];
  profile?: SpondProfile;
  [key: string]: unknown;
}

export interface SpondSubgroup {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface SpondGroup {
  id: string;
  name: string;
  members: SpondMember[];
  subGroups?: SpondSubgroup[];
  [key: string]: unknown;
}

export interface SpondResponses {
  acceptedIds?: string[];
  declinedIds?: string[];
  unansweredIds?: string[];
  waitinglistIds?: string[];
  unconfirmedIds?: string[];
}

export interface SpondMatchInfo {
  type?: "HOME" | "AWAY" | "FRIENDLY";
  teamName?: string;
  opponentName?: string;
  scoresSet?: boolean;
  scoresSetEver?: boolean;
  scoresFinal?: boolean;
  scoresPublic?: boolean;
  teamScore?: number;
  opponentScore?: number;
  [key: string]: unknown;
}

export interface SpondEventLocation {
  id?: string;
  feature?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

export interface SpondEventOwner {
  id: string;
  response?: string;
  [key: string]: unknown;
}

export interface SpondEvent {
  id: string;
  heading: string;
  description?: string;
  startTimestamp: string;
  endTimestamp?: string;
  createdTime?: string;
  cancelled?: boolean;
  hidden?: boolean;
  matchEvent?: boolean;
  matchInfo?: SpondMatchInfo;
  location?: SpondEventLocation;
  owners?: SpondEventOwner[];
  tasks?: { openTasks?: unknown[]; assignedTasks?: unknown[] };
  comments?: unknown[];
  responses?: SpondResponses;
  recipients?: {
    group?: { id: string; name?: string };
    subGroups?: SpondSubgroup[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface MemberAttendance {
  memberId: string;
  name: string;
  accepted: number;
  declined: number;
  unanswered: number;
  totalInvited: number;
  attendanceRate: number; // accepted / totalInvited, 0..1
}

export interface EventAttendance {
  eventId: string;
  heading: string;
  startTimestamp: string;
  accepted: number;
  declined: number;
  unanswered: number;
  totalInvited: number;
}

export interface WeeklyTrendPoint {
  weekStart: string; // ISO date (Monday) of the week bucket
  eventCount: number;
  accepted: number;
  declined: number;
  unanswered: number;
  attendanceRate: number;
}

export interface GetEventsParams {
  groupId?: string;
  subgroupId?: string;
  minStart?: Date | string;
  maxStart?: Date | string;
  minEnd?: Date | string;
  maxEnd?: Date | string;
  includeHidden?: boolean;
  includeScheduled?: boolean;
  max?: number;
}

export interface PrayerItem {
  key: string;
  name: string;
  type: 'fard' | 'tahajjud_custom';
  rakat: string;
  details: string;
  point: number;
  hasDua?: boolean;
  hasMorningZikir?: boolean;
  hasEveningZikir?: boolean;
}

export interface NafilPrayerItem {
  key: string;
  name: string;
  rakat: string;
  info: string;
  details: string;
  point: number;
}

export interface RoutineTaskItem {
  key: string;
  name: string;
  target: number;
  point: number;
  details: string;
  arabic?: string;
}

export interface DuaNote {
  id: string;
  title: string;
  text: string;
  date: string;
  isAuto: boolean;
}

export interface ReminderSetting {
  key: string;
  name: string;
  start: string; // "06:00"
  count: number; // 1-10
  interval: number; // minutes
}

export interface GeneralReminderSetting {
  enabled: boolean;
  interval: number; // minutes
}

export interface TaskStats {
  week: number;
  month: number;
  lifetime: number;
  totalWeekDays: number;
  totalMonthDays: number;
  totalLifetimeDays: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface AppStats {
  todayPoints: number;
  selectedDayPoints: number;
  yesterdayPoints: number;
  totalPoints7Days: number;
  totalPoints30Days: number;
  highScore30Days: number;
  fardCompleted7Days: number;
  totalLifetimePoints: number;
}

export interface ChampionInfo {
  name: string;
  points: number;
}

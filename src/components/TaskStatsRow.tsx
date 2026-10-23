import React from 'react';
import { TaskStats } from '../types/ibadat';

interface TaskStatsRowProps {
  stats: TaskStats;
}

export const TaskStatsRow: React.FC<TaskStatsRowProps> = ({ stats }) => {
  const weekPct = stats.totalWeekDays > 0 ? stats.week / stats.totalWeekDays : 0;
  const weekClass = weekPct >= 0.5 ? 'text-green-600' : 'text-red-500';

  const monthPct = stats.totalMonthDays > 0 ? stats.month / stats.totalMonthDays : 0;
  const monthClass = monthPct >= 0.5 ? 'text-green-600' : 'text-red-500';

  const lifePct = stats.totalLifetimeDays > 0 ? stats.lifetime / stats.totalLifetimeDays : 0;
  const lifeClass = lifePct >= 0.5 ? 'text-green-600' : 'text-red-500';

  return (
    <div className="flex items-center gap-2 pt-1 text-[10px] font-bold">
      <span className={weekClass}>Week({stats.week}/{stats.totalWeekDays})</span>
      <span className={monthClass}>Month({stats.month}/{stats.totalMonthDays})</span>
      <span className={lifeClass}>Lifetime({stats.lifetime}/{stats.totalLifetimeDays})</span>
    </div>
  );
};

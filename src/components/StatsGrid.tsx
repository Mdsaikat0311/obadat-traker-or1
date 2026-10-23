import React from 'react';
import { AppStats } from '../types/ibadat';
import { RankBadge } from './RankBadge';

interface StatsGridProps {
  stats: AppStats;
  isToday: boolean;
  onOpenLeaderboard: (metricType: string, title: string) => void;
  getRank: (metricType: string) => number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  isToday,
  onOpenLeaderboard,
  getRank
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 text-center mb-6">
      {/* 1. Account Lifetime Points (col-span-2) */}
      <div
        onClick={() => onOpenLeaderboard('totalPoints', 'সর্বমোট সেরা (লাইফটাইম)')}
        className="stat-card relative p-3 rounded-xl bg-teal-100 border border-teal-300 col-span-2 cursor-pointer shadow-xs"
      >
        <div className="absolute top-2 right-2">
          <RankBadge rank={getRank('totalPoints')} />
        </div>
        <div className="text-2xl font-bold text-teal-700">
          {stats.totalLifetimePoints}
        </div>
        <div className="text-sm font-semibold text-gray-600">
          অ্যাকাউন্ট লাইফটাইম পয়েন্ট
        </div>
      </div>

      {/* 2. Selected Day Points */}
      <div
        onClick={() => onOpenLeaderboard('todayPoints', 'আজকের সেরা')}
        className="stat-card relative p-3 rounded-xl bg-teal-50 border border-teal-200 cursor-pointer shadow-xs"
      >
        {isToday && (
          <div className="absolute top-1 right-1">
            <RankBadge rank={getRank('todayPoints')} />
          </div>
        )}
        <div className="text-xl font-bold text-teal-600">
          {stats.selectedDayPoints}
        </div>
        <div className="text-xs text-gray-500">
          নির্বাচিত দিনের পয়েন্ট
        </div>
      </div>

      {/* 3. Yesterday Points */}
      <div
        onClick={() => onOpenLeaderboard('yesterdayPoints', 'গতকালকের সেরা')}
        className="stat-card relative p-3 rounded-xl bg-indigo-50 border border-indigo-200 cursor-pointer shadow-xs"
      >
        <div className="absolute top-1 right-1">
          <RankBadge rank={getRank('yesterdayPoints')} />
        </div>
        <div className="text-xl font-bold text-indigo-600">
          {stats.yesterdayPoints}
        </div>
        <div className="text-xs text-gray-500">
          গতকালকের পয়েন্ট
        </div>
      </div>

      {/* 4. Total Points 7 Days */}
      <div
        onClick={() => onOpenLeaderboard('totalPoints7Days', 'সাপ্তাহিক সেরা (৭ দিন)')}
        className="stat-card relative p-3 rounded-xl bg-green-50 border border-green-200 cursor-pointer shadow-xs"
      >
        <div className="absolute top-1 right-1">
          <RankBadge rank={getRank('totalPoints7Days')} />
        </div>
        <div className="text-xl font-bold text-green-600">
          {stats.totalPoints7Days}
        </div>
        <div className="text-xs text-gray-500">
          গত ৭ দিনের মোট পয়েন্ট
        </div>
      </div>

      {/* 5. Total Points 30 Days */}
      <div
        onClick={() => onOpenLeaderboard('totalPoints30Days', 'মাসিক সেরা (৩০ দিন)')}
        className="stat-card relative p-3 rounded-xl bg-blue-50 border border-blue-200 cursor-pointer shadow-xs"
      >
        <div className="absolute top-1 right-1">
          <RankBadge rank={getRank('totalPoints30Days')} />
        </div>
        <div className="text-xl font-bold text-blue-600">
          {stats.totalPoints30Days}
        </div>
        <div className="text-xs text-gray-500">
          ৩০ দিনের মোট পয়েন্ট
        </div>
      </div>

      {/* 6. High Score 30 Days */}
      <div
        onClick={() => onOpenLeaderboard('totalPoints30Days', '৩০ দিনের হাই স্কোর')}
        className="stat-card relative p-3 rounded-xl bg-yellow-50 border border-yellow-200 cursor-pointer shadow-xs"
      >
        <div className="absolute top-1 right-1">
          <RankBadge rank={getRank('highScore30Days')} />
        </div>
        <div className="text-xl font-bold text-yellow-600">
          {stats.highScore30Days}
        </div>
        <div className="text-xs text-gray-500">
          ৩০ দিনের হাই স্কোর
        </div>
      </div>

      {/* 7. Fard Completed 7 Days */}
      <div className="stat-card p-3 rounded-xl bg-red-50 border border-red-200 shadow-xs">
        <div className="text-xl font-bold text-red-600">
          {stats.fardCompleted7Days}/35
        </div>
        <div className="text-xs text-gray-500">
          ৭ দিনে ফরয সালাত সম্পন্ন
        </div>
      </div>
    </div>
  );
};

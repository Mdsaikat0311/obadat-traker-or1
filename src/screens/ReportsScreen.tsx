import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Trophy,
  Sun,
  Clock,
  CalendarDays,
  Award,
  Crown,
  Medal
} from 'lucide-react';
import { repository, IbadatRepository } from '../data/repository';
import { getTopUsersByMetric } from '../services/firebase';
import { LeaderboardUser } from '../types/ibadat';

interface ReportsScreenProps {
  currentViewingDate: string;
  onSelectDate: (dateKey: string) => void;
  onMoveDate: (offset: number) => void;
  onOpenLeaderboard: (metricType: string, title: string) => void;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  currentViewingDate,
  onSelectDate,
  onMoveDate,
  onOpenLeaderboard
}) => {
  const todayKey = repository.getTodayKey();
  const isTodayViewing = currentViewingDate === todayKey;

  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [topUsersMap, setTopUsersMap] = useState<Record<string, LeaderboardUser[]>>({});

  const viewDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + calendarMonthOffset, 1);
    return d;
  }, [calendarMonthOffset]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  // Max points in month for relative HSL shading
  const maxPointsInMonth = useMemo(() => {
    let max = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dDate = new Date(viewYear, viewMonth, d);
      const p = repository.calculatePoints(repository.formatIsoDate(dDate));
      if (p > max) max = p;
    }
    return max;
  }, [viewYear, viewMonth, daysInMonth]);

  // 7-day Fard calculations
  const totalFardPrayers = 5;
  const maxGraphValue = 6;

  const { graphBars, completionPercentage } = useMemo(() => {
    const today = new Date();
    let totalCompletedIn7Days = 0;

    const bars = DAY_LABELS.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const dateStr = repository.formatIsoDate(date);
      const salah = repository.getLog("salah", dateStr);
      const fardKeys = IbadatRepository.PRAYERS.filter((p) => p.type === 'fard').map((p) => p.key);
      const completed = fardKeys.filter((k) => salah[k]).length;
      totalCompletedIn7Days += completed;

      const heightPercentage = (completed / maxGraphValue) * 100;
      const isTodayCell = dateStr === todayKey;

      return {
        day: day.slice(0, 3),
        completed,
        heightPercentage,
        isTodayCell
      };
    });

    const percentage = ((totalCompletedIn7Days / (totalFardPrayers * 7)) * 100).toFixed(1);
    return { graphBars: bars, completionPercentage: percentage };
  }, [todayKey]);

  const LEADERBOARD_CONFIG = useMemo(() => [
    { id: 'todayPoints', title: 'আজকের সেরা', icon: Sun, color: 'teal', colorHex: '#0d9488' },
    { id: 'yesterdayPoints', title: 'গতকালকের সেরা', icon: Clock, color: 'indigo', colorHex: '#4f46e5' },
    { id: 'totalPoints7Days', title: 'সাপ্তাহিক সেরা (৭ দিন)', icon: CalendarIcon, color: 'blue', colorHex: '#2563eb' },
    { id: 'totalPoints30Days', title: 'মাসিক সেরা (৩০ দিন)', icon: CalendarDays, color: 'purple', colorHex: '#9333ea' },
    { id: 'totalPoints', title: 'সর্বমোট সেরা (লাইফটাইম)', icon: Award, color: 'orange', colorHex: '#ea580c' }
  ], []);

  useEffect(() => {
    let mounted = true;
    LEADERBOARD_CONFIG.forEach((cfg) => {
      getTopUsersByMetric(cfg.id, 3).then((res) => {
        if (mounted && res && res.length > 0) {
          setTopUsersMap((prev) => ({ ...prev, [cfg.id]: res }));
        }
      }).catch(() => {});
    });

    return () => {
      mounted = false;
    };
  }, [LEADERBOARD_CONFIG]);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Date Picker Bar */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
          <CalendarIcon className="w-5 h-5 inline mr-2 text-teal-600" />
          <span>ডেটা আপডেটের তারিখ নির্বাচন:</span>
        </h3>
        <div className="flex items-center justify-between space-x-2">
          <button
            type="button"
            onClick={() => onMoveDate(-1)}
            className="p-2 border border-gray-300 rounded-lg text-teal-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            id="date-selector"
            value={currentViewingDate}
            max={todayKey}
            onChange={(e) => onSelectDate(e.target.value)}
            className="flex-grow py-2 px-3 border border-teal-300 rounded-lg text-base text-gray-700 font-medium focus:ring-teal-500 focus:border-teal-500 text-center"
          />
          <button
            type="button"
            onClick={() => onMoveDate(1)}
            disabled={isTodayViewing}
            className={`p-2 border border-gray-300 rounded-lg text-teal-600 transition ${
              isTodayViewing
                ? 'opacity-30 cursor-not-allowed pointer-events-none bg-gray-100'
                : 'hover:bg-gray-100 cursor-pointer'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-red-500 mb-4 text-center">
        তারিখ পরিবর্তন করে 'সালাত', 'আমল' বা 'যিকির' ট্যাবে যান।
      </p>

      {/* 2. Monthly Heatmap Calendar */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
            className="flex items-center text-sm font-semibold text-teal-600 hover:bg-gray-100 p-2 rounded-lg transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-semibold ml-1">Prev</span>
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            {MONTH_NAMES_BN[viewMonth]}, {viewYear}
          </h2>
          <button
            type="button"
            onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
            className="flex items-center text-sm font-semibold text-teal-600 hover:bg-gray-100 p-2 rounded-lg transition cursor-pointer"
          >
            <span className="text-sm font-semibold mr-1">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="calendar-header">
          {DAY_LABELS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="date-cell bg-gray-50 border-transparent" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dateNum = i + 1;
            const cellDate = new Date(viewYear, viewMonth, dateNum);
            const cellDateKey = repository.formatIsoDate(cellDate);
            const isToday = cellDateKey === todayKey;
            const isSelected = cellDateKey === currentViewingDate;
            const isFutureDate = cellDateKey > todayKey;
            const points = !isFutureDate ? repository.calculatePoints(cellDateKey) : 0;

            let inlineStyle: React.CSSProperties = {};
            let cellClasses = ['date-cell', 'p-1', 'transition', 'rounded-lg', 'm-0.5'];

            if (isFutureDate) {
              cellClasses.push('future-date', 'opacity-50');
              inlineStyle = { backgroundColor: '#f1f5f9', color: '#cbd5e1' };
            } else {
              if (points > 0) {
                const percentage = maxPointsInMonth > 0 ? points / maxPointsInMonth : 0;
                let hue = 0;
                let saturation = 0;
                let lightness = 0;
                let textColor = '';

                if (percentage < 0.5) {
                  hue = 0;
                  saturation = 80;
                  const redPos = percentage / 0.5;
                  lightness = 60 + redPos * 35;
                  textColor = lightness < 70 ? '#ffffff' : '#7f1d1d';
                } else {
                  hue = 145;
                  saturation = 75;
                  const greenPos = (percentage - 0.5) / 0.5;
                  lightness = 95 - greenPos * 55;
                  textColor = lightness < 60 ? '#ffffff' : '#14532d';
                }

                inlineStyle = {
                  backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                  border: `1px solid hsl(${hue}, ${saturation}%, ${lightness - 10}%)`,
                  color: textColor
                };
              } else {
                inlineStyle = {
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#64748b'
                };
              }
            }

            if (isToday) cellClasses.push('ring-2 ring-offset-1 ring-red-400');
            if (isSelected) cellClasses.push('ring-2 ring-teal-600 z-10 shadow-lg transform scale-105');

            return (
              <div
                key={dateNum}
                onClick={() => !isFutureDate && onSelectDate(cellDateKey)}
                className={`${cellClasses.join(' ')} ${isFutureDate ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={inlineStyle}
              >
                <div className="date-number font-semibold" style={{ color: 'inherit' }}>
                  {dateNum}
                </div>
                {points > 0 && (
                  <div className="date-points" style={{ color: 'inherit', fontWeight: 700 }}>
                    +{points}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 7-Day Fard Prayer Bar Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-teal-600" /> গত ৭ দিনের সালাত
        </h2>
        <div className="bar-chart-container">
          <div className="chart-y-axis">
            {[0, 1, 2, 3, 4, 5, 6].map((val) => {
              const height = (val / maxGraphValue) * 100;
              const lineStyle = val === totalFardPrayers ? 'border-dashed border-red-400' : 'border-dashed border-gray-200';
              return (
                <div key={val} className={lineStyle} style={{ bottom: `${height}%` }} />
              );
            })}
            {[0, totalFardPrayers, maxGraphValue].map((val) => {
              const height = (val / maxGraphValue) * 100;
              return (
                <div key={val} className="graph-label" style={{ bottom: `${height}%` }}>
                  {val}
                </div>
              );
            })}
          </div>

          {graphBars.map((bar, i) => (
            <div
              key={i}
              className={`bar ${bar.isTodayCell ? 'bg-red-500' : 'bg-teal-600'}`}
              style={{ height: `${bar.heightPercentage}%` }}
              title={`${bar.day}: ${bar.completed}টি ফরয`}
            >
              <div className="bar-label">{bar.day}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 text-sm">
          <span className="font-bold text-teal-600">{completionPercentage}%</span>{' '}
          <span className="text-gray-600">ফরয সালাত সম্পন্ন হয়েছে (গত ৭ দিনে)</span>
        </div>
      </div>

      {/* 4. Five Leaderboard Cards */}
      <div className="mt-8 space-y-6 pb-8">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" /> সেরা পারফর্মার
        </h2>

        <div className="space-y-4">
          {LEADERBOARD_CONFIG.map((config) => {
            const topUsers = topUsersMap[config.id] || repository.getLeaderboard(config.id).slice(0, 3);
            const Icon = config.icon;

            return (
              <div
                key={config.id}
                className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md transition duration-300"
              >
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <Icon className="w-4 h-4 mr-2" style={{ color: config.colorHex }} />
                    {config.title}
                  </h3>
                </div>

                <div className="p-2">
                  {topUsers.map((u, idx) => {
                    let rankBadge = null;
                    if (idx === 0) {
                      rankBadge = (
                        <div className="w-6 h-6 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center shadow-xs">
                          <Crown className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
                        </div>
                      );
                    } else if (idx === 1) {
                      rankBadge = (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-xs">
                          <Medal className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                      );
                    } else if (idx === 2) {
                      rankBadge = (
                        <div className="w-6 h-6 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shadow-xs">
                          <Medal className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={u.id}
                        className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition px-2 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {rankBadge}
                          <span className="text-sm text-gray-700 font-medium truncate max-w-[140px]">
                            {u.name}
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded border"
                          style={{
                            color: config.colorHex,
                            backgroundColor: `${config.colorHex}15`,
                            borderColor: `${config.colorHex}30`
                          }}
                        >
                          {u.points}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenLeaderboard(config.id, config.title)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-xs font-semibold border-t border-gray-100 transition flex items-center justify-center gap-1 cursor-pointer"
                  style={{ color: config.colorHex }}
                >
                  <span>সব দেখুন</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

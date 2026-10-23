import React from 'react';
import {
  CheckCircle,
  BookOpen,
  Bell,
  Sparkles,
  Sun,
  Moon,
  Trophy,
  Crown
} from 'lucide-react';
import { IbadatRepository } from '../data/repository';
import { AppStats, ChampionInfo, TaskStats, ReminderSetting } from '../types/ibadat';
import { StatsGrid } from '../components/StatsGrid';
import { TaskStatsRow } from '../components/TaskStatsRow';

interface SalahScreenProps {
  appStats: AppStats;
  yesterdayChampion: ChampionInfo;
  salahLog: Record<string, boolean>;
  nawafilLog: Record<string, boolean>;
  reminders: Record<string, ReminderSetting>;
  isViewingToday: boolean;
  onToggleSalah: (key: string) => void;
  onToggleNawafil: (key: string) => void;
  onOpenDetails: (name: string, details: string) => void;
  onOpenReminder: (key: string, name: string) => void;
  onOpenLeaderboard: (metricType: string, title: string) => void;
  getMyRank: (metricType: string) => number;
  getTaskStats: (category: string, taskKey: string) => TaskStats;
}

export const SalahScreen: React.FC<SalahScreenProps> = ({
  appStats,
  yesterdayChampion,
  salahLog,
  nawafilLog,
  reminders,
  isViewingToday,
  onToggleSalah,
  onToggleNawafil,
  onOpenDetails,
  onOpenReminder,
  onOpenLeaderboard,
  getMyRank,
  getTaskStats
}) => {
  const bnDateStr = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Section with Yesterday's Champion in the top right */}
      <div className="flex justify-between items-end mb-4 relative">
        <div>
          <h2 className="text-xl font-bold text-gray-800">সালাত ও ইবাদত</h2>
          <p className="text-xs text-gray-500">{bnDateStr}</p>
        </div>

        <div
          id="yesterday-champion-box"
          onClick={() => onOpenLeaderboard('yesterdayPoints', 'গতকালকের সেরা')}
          className="flex flex-col items-end cursor-pointer transition transform hover:scale-105"
        >
          <div className="text-[10px] font-bold text-amber-600 mb-0.5 flex items-center">
            <Trophy className="w-3 h-3 mr-1" /> গতকালের সেরা
          </div>
          <div className="flex items-center bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 shadow-xs">
            <div className="mr-2 text-right">
              <div id="champ-name" className="text-xs font-bold text-gray-800 leading-none max-w-[100px] truncate">
                {yesterdayChampion.name}
              </div>
              <div id="champ-points" className="text-[10px] font-semibold text-amber-700 leading-none mt-0.5">
                {yesterdayChampion.points} pts
              </div>
            </div>
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 7 Stats Grid */}
      <StatsGrid
        stats={appStats}
        isToday={isViewingToday}
        onOpenLeaderboard={onOpenLeaderboard}
        getRank={getMyRank}
      />

      {/* Section: Daily Fard Prayers */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">দৈনিক ফরয সালাত</h2>
      <div className="space-y-3">
        {IbadatRepository.PRAYERS.map((prayer) => {
          const isCompleted = !!salahLog[prayer.key];
          const isDuaCompleted = !!salahLog[`${prayer.key}_dua`];
          const isMorningZikirCompleted = !!salahLog['fajr_morning_zikir'];
          const isEveningZikirCompleted = !!salahLog['maghrib_evening_zikir'];
          const hasReminder = Boolean(reminders[prayer.key]);
          const isTahajjud = prayer.key === 'tahajjud';

          const containerClass = isCompleted
            ? isTahajjud
              ? 'bg-indigo-50 border-indigo-300'
              : 'bg-teal-50 border-teal-300'
            : 'bg-white border-gray-100';

          const stats = getTaskStats('salah', prayer.key);

          return (
            <div
              key={prayer.key}
              className={`flex flex-col p-4 rounded-xl border transition duration-300 shadow-xs ${containerClass}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-grow">
                  <h3 className="text-base font-bold text-gray-800 flex items-center flex-wrap">
                    <CheckCircle
                      className={`w-4 h-4 mr-2 transition-opacity ${
                        isCompleted
                          ? isTahajjud ? 'opacity-100 text-indigo-600' : 'opacity-100 text-teal-600'
                          : 'opacity-0 text-gray-400'
                      }`}
                    />
                    <span>{prayer.name}</span>
                    <span
                      className={`text-sm font-semibold ml-2 ${
                        isTahajjud ? 'text-indigo-600' : 'text-teal-600'
                      }`}
                    >
                      (+{prayer.point}p)
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(prayer.name, prayer.details)}
                      className="cursor-pointer text-gray-400 hover:text-blue-500"
                      title="বিস্তারিত দেখুন"
                    >
                      <BookOpen className="w-4 h-4 ml-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReminder(prayer.key, prayer.name)}
                      className={`cursor-pointer hover:text-teal-600 transition-colors p-1 rounded-full ${
                        hasReminder ? 'text-teal-600 bg-teal-50 ring-1 ring-teal-300' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={hasReminder ? `${prayer.name}-এর রিমাইন্ডার চালু আছে (${reminders[prayer.key]?.start})` : "রিমাইন্ডার সেট করুন"}
                    >
                      <Bell className={`w-4 h-4 ml-1 mr-1 ${hasReminder ? 'fill-teal-600 text-teal-600' : ''}`} />
                    </button>
                  </h3>
                  <TaskStatsRow stats={stats} />
                </div>

                <div className="flex-shrink-0 ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleSalah(prayer.key)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full relative transition-all duration-300 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:bg-white before:h-5 before:w-5 before:rounded-full before:transition-all before:duration-300 before:shadow-md ${
                        isTahajjud ? 'peer-checked:bg-indigo-600' : 'peer-checked:bg-teal-600'
                      } peer-checked:before:translate-x-4`}
                    />
                  </label>
                </div>
              </div>

              {/* Subtask: Du'a & Zikir (+5p) for Fard */}
              {prayer.hasDua && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center text-sm text-gray-700 font-medium flex-wrap">
                        <Sparkles className="w-3 h-3 mr-2 text-teal-500" />
                        <span>দু’আ ও যিকির</span>
                        <span className="text-xs font-bold ml-1 text-teal-600">
                          (+5p)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenDetails(
                              `${prayer.name} সালাত পরবর্তী দু’আ ও যিকির`,
                              "প্রতিটি ফরয সালাতের পর রাসুল (সা.) কিছু নির্দিষ্ট দু'আ ও যিকির পাঠ করতেন। যেমন: আয়াতুল কুরসি ১ বার, সুবহানাল্লাহ ৩৩ বার, আলহামদুলিল্লাহ ৩৩ বার, আল্লাহু আকবার ৩৪ বার। এটি জান্নাতে যাওয়ার পথ সহজ করে।"
                            )
                          }
                          className="cursor-pointer text-gray-400 hover:text-blue-500"
                          title="বিস্তারিত দেখুন"
                        >
                          <BookOpen className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                      <TaskStatsRow stats={getTaskStats('salah', `${prayer.key}_dua`)} />
                    </div>

                    <div className="flex-shrink-0 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDuaCompleted}
                          onChange={() => onToggleSalah(`${prayer.key}_dua`)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full relative transition-all duration-300 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:bg-white before:h-5 before:w-5 before:rounded-full before:transition-all before:duration-300 before:shadow-md peer-checked:bg-teal-600 peer-checked:before:translate-x-4" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Subtask for Fajr: সকাল বেলার যিকির */}
              {prayer.hasMorningZikir && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center text-sm text-gray-700 font-medium flex-wrap">
                        <Sun className="w-3 h-3 mr-2 text-orange-500" />
                        <span>সকাল বেলার যিকির</span>
                        <span className="text-xs font-bold ml-1 text-orange-600">
                          (+3p)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenDetails(
                              "সকাল বেলার মাসনুন যিকির",
                              "ফজরের পর সূর্যোদয় পর্যন্ত সময়টি যিকির ও দু'আর জন্য অত্যন্ত বরকতময়। এসময় আয়াতুল কুরসি, ৩ কুল, সাইয়্যিদুল ইস্তিগফার এবং সকালের নির্দিষ্ট মাসনুন দু'আগুলো পাঠ করা সুন্নাত।"
                            )
                          }
                          className="cursor-pointer text-gray-400 hover:text-blue-500"
                          title="বিস্তারিত দেখুন"
                        >
                          <BookOpen className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                      <TaskStatsRow stats={getTaskStats('salah', 'fajr_morning_zikir')} />
                    </div>

                    <div className="flex-shrink-0 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMorningZikirCompleted}
                          onChange={() => onToggleSalah('fajr_morning_zikir')}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full relative transition-all duration-300 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:bg-white before:h-5 before:w-5 before:rounded-full before:transition-all before:duration-300 before:shadow-md peer-checked:bg-teal-600 peer-checked:before:translate-x-4" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Subtask for Maghrib: সন্ধ্যা বেলার যিকির */}
              {prayer.hasEveningZikir && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center text-sm text-gray-700 font-medium flex-wrap">
                        <Moon className="w-3 h-3 mr-2 text-orange-500" />
                        <span>সন্ধ্যা বেলার যিকির</span>
                        <span className="text-xs font-bold ml-1 text-orange-600">
                          (+3p)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenDetails(
                              "সন্ধ্যা বেলার মাসনুন যিকির",
                              "আসরের পর থেকে মাগরিব পর্যন্ত বা মাগরিবের পরের সময়টি সন্ধ্যার যিকিরের জন্য নির্ধারিত। এসময় আমানুর রাসুলু, ৩ কুল, এবং সন্ধ্যার মাসনুন দু'আগুলো পাঠ করা উচিত যা সারারাত নিরাপত্তার কারণ হয়।"
                            )
                          }
                          className="cursor-pointer text-gray-400 hover:text-blue-500"
                          title="বিস্তারিত দেখুন"
                        >
                          <BookOpen className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                      <TaskStatsRow stats={getTaskStats('salah', 'maghrib_evening_zikir')} />
                    </div>

                    <div className="flex-shrink-0 ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEveningZikirCompleted}
                          onChange={() => onToggleSalah('maghrib_evening_zikir')}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full relative transition-all duration-300 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:bg-white before:h-5 before:w-5 before:rounded-full before:transition-all before:duration-300 before:shadow-md peer-checked:bg-teal-600 peer-checked:before:translate-x-4" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section: Nawafil Prayers */}
      <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">নফল ইবাদত</h2>
      <div className="space-y-3">
        {IbadatRepository.NAWAFIL_PRAYERS.map((prayer) => {
          const isCompleted = !!nawafilLog[prayer.key];
          const containerClass = isCompleted ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-100';
          const stats = getTaskStats('nawafil', prayer.key);

          return (
            <div
              key={prayer.key}
              className={`flex items-center p-4 rounded-xl border transition duration-300 shadow-xs ${containerClass}`}
            >
              <div className="flex-grow">
                <h3 className="text-base font-bold text-gray-800 flex items-center flex-wrap">
                  <Sun
                    className={`w-4 h-4 mr-2 transition-opacity ${
                      isCompleted ? 'opacity-100 text-indigo-600' : 'opacity-0 text-gray-400'
                    }`}
                  />
                  <span>{prayer.name}</span>
                  <span className="text-sm font-semibold ml-2 text-indigo-600">
                    (+10p)
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenDetails(prayer.name, prayer.details)}
                    className="cursor-pointer text-gray-400 hover:text-blue-500"
                    title="বিস্তারিত দেখুন"
                  >
                    <BookOpen className="w-4 h-4 ml-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenReminder(prayer.key, prayer.name)}
                    className={`cursor-pointer hover:text-indigo-600 transition-colors p-1 rounded-full ${
                      Boolean(reminders[prayer.key]) ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-300' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={Boolean(reminders[prayer.key]) ? `${prayer.name}-এর রিমাইন্ডার চালু আছে (${reminders[prayer.key]?.start})` : "রিমাইন্ডার সেট করুন"}
                  >
                    <Bell className={`w-4 h-4 ml-1 mr-1 ${Boolean(reminders[prayer.key]) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                  </button>
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  <span>{prayer.info}</span>
                </div>
                <TaskStatsRow stats={stats} />
              </div>

              <div className="flex-shrink-0 ml-4">
                <label className="relative inline-flex items-center cursor-pointer nawafil-toggle">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleNawafil(prayer.key)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full relative transition-all duration-300 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:bg-white before:h-5 before:w-5 before:rounded-full before:transition-all before:duration-300 before:shadow-md peer-checked:bg-indigo-600 peer-checked:before:translate-x-4" />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

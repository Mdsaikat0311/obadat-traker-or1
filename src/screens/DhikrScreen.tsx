import React from 'react';
import { CheckCircle, BookOpen, Bell } from 'lucide-react';
import { IbadatRepository } from '../data/repository';
import { TaskStats, ReminderSetting } from '../types/ibadat';
import { TaskStatsRow } from '../components/TaskStatsRow';

interface DhikrScreenProps {
  dhikrLog: Record<string, boolean>;
  reminders: Record<string, ReminderSetting>;
  onToggleDhikr: (key: string) => void;
  onOpenDetails: (name: string, details: string) => void;
  onOpenReminder: (key: string, name: string) => void;
  getTaskStats: (category: string, taskKey: string) => TaskStats;
}

export const DhikrScreen: React.FC<DhikrScreenProps> = ({
  dhikrLog,
  reminders,
  onToggleDhikr,
  onOpenDetails,
  onOpenReminder,
  getTaskStats
}) => {
  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        গুরুত্বপূর্ণ দৈনিক যিকির
      </h2>
      <div className="space-y-3">
        {IbadatRepository.DHIKR_CHECKLIST_TASKS.map((task) => {
          const isCompleted = Boolean(dhikrLog && dhikrLog[task.key]);
          const textClass = isCompleted ? 'text-gray-900 font-medium' : 'text-gray-700';
          const containerClass = isCompleted ? 'bg-green-50 border-green-300' : 'bg-white border-gray-100';
          const pointText = task.point ? `(+${task.point}p)` : '';
          const reminderStatus = Boolean(reminders[task.key]);
          const stats = getTaskStats('dhikr', task.key);

          return (
            <div
              key={task.key}
              className={`flex items-center p-3 rounded-xl shadow-xs border transition duration-300 ${containerClass}`}
            >
              <div className="flex-grow">
                <h3 className={`text-sm ${textClass} flex items-center`}>
                  <CheckCircle
                    className={`w-4 h-4 mr-2 transition-opacity ${
                      isCompleted ? 'opacity-100 text-green-600' : 'opacity-0 text-gray-400'
                    }`}
                  />
                  <span>{task.name}</span>
                  <span className="text-xs font-medium ml-2 text-green-600">{pointText}</span>
                </h3>

                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <span>{task.arabic}</span>
                  <button
                    type="button"
                    onClick={() => onOpenDetails(task.name, task.details)}
                    className="cursor-pointer text-gray-400 hover:text-blue-500"
                    title="বিস্তারিত দেখুন"
                  >
                    <BookOpen className="w-4 h-4 ml-2" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenReminder(task.key, task.name)}
                    className={`cursor-pointer hover:text-teal-600 transition-colors p-0.5 rounded ${
                      reminderStatus ? 'text-teal-600 bg-teal-50 ring-1 ring-teal-200' : 'text-gray-400'
                    }`}
                    title={reminderStatus ? `${task.name}-এর রিমাইন্ডার চালু আছে` : "রিমাইন্ডার সেট করুন"}
                  >
                    <Bell className={`w-4 h-4 ml-1.5 mr-1 ${reminderStatus ? 'fill-teal-600 text-teal-600' : ''}`} />
                  </button>
                </div>

                <TaskStatsRow stats={stats} />
              </div>

              <div className="flex-shrink-0 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => onToggleDhikr(task.key)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full relative transition-all duration-300 before:content-[''] before:absolute before:top-[2px] before:left-[2px] before:bg-white before:h-5 before:w-5 before:rounded-full before:transition-all before:duration-300 before:shadow-md peer-checked:bg-emerald-600 peer-checked:before:translate-x-4" />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

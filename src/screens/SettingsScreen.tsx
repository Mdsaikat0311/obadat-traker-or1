import React, { useState } from 'react';
import {
  BookHeart,
  BellRing,
  Clock3,
  LogIn,
  UserPlus,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { AppStats, GeneralReminderSetting } from '../types/ibadat';
import { StatsGrid } from '../components/StatsGrid';
import { User } from '../services/firebase';

interface SettingsScreenProps {
  currentUser: User | null;
  userName: string;
  appStats: AppStats;
  autoHadithEnabled: boolean;
  generalReminder: GeneralReminderSetting;
  lifetimeStartDate: string;
  isViewingToday: boolean;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onSetUserName: (name: string) => void;
  onToggleAutoHadith: () => void;
  onToggleGeneralReminder: () => void;
  onSetGeneralInterval: (interval: number) => void;
  onSetLifetimeStartDate: (date: string) => void;
  onRequestReset: () => void;
  onOpenLeaderboard: (metricType: string, title: string) => void;
  getMyRank: (metricType: string) => number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUser,
  userName,
  appStats,
  autoHadithEnabled,
  generalReminder,
  lifetimeStartDate,
  isViewingToday,
  onLogin,
  onRegister,
  onLogout,
  onToggleAutoHadith,
  onToggleGeneralReminder,
  onSetGeneralInterval,
  onSetLifetimeStartDate,
  onOpenLeaderboard,
  getMyRank
}) => {
  // Auth Form State
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Settings State
  const [dateInput, setDateInput] = useState(lifetimeStartDate);

  const intervals = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const maxDate = new Date().toISOString().split('T')[0];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('ইমেইল এবং পাসওয়ার্ড দিন');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await onLogin(loginEmail.trim(), loginPassword);
    } catch (err: any) {
      let msg = "লগইন ব্যর্থ হয়েছে।";
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        msg = "ভুল ইমেইল বা পাসওয়ার্ড।";
      } else if (err?.message) {
        msg = err.message;
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setAuthError('সব তথ্য পূরণ করুন');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await onRegister(registerName.trim(), registerEmail.trim(), registerPassword);
    } catch (err: any) {
      let msg = "রেজিস্ট্রেশন ব্যর্থ হয়েছে।";
      if (err?.code === 'auth/email-already-in-use') {
        msg = "এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে।";
      } else if (err?.code === 'auth/weak-password') {
        msg = "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।";
      } else if (err?.message) {
        msg = err.message;
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const openExactAlarmSettings = () => {
    if (typeof window !== 'undefined' && (window as any).device?.platform === 'Android') {
      const packageName = "com.yourdomain.ibadattracker";
      const intentShim = (window as any).plugins?.intentShim;
      if (intentShim) {
        intentShim.startActivity(
          {
            action: "android.settings.REQUEST_SCHEDULE_EXACT_ALARM",
            url: "package:" + packageName
          },
          () => console.log("Settings opened"),
          () => alert("সেটিংস ওপেন করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি পারমিশন দিন।")
        );
        return;
      }
    }
    alert("মোবাইলের Settings > Apps > Ibadat Tracker > Alarms & Reminders থেকে 'Allow' পারমিশন অন করুন।");
  };

  return (
    <div className="space-y-4 pb-20">
      {/* If User is NOT Logged In: Show ONLY Sign In / Registration Tabs */}
      {!currentUser ? (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">সেটিংস</h2>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-5 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-3 text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'signin'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-gray-50'
                    : 'text-gray-500 bg-white hover:text-gray-700'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>সাইন ইন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-3 text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'signup'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-gray-50'
                    : 'text-gray-500 bg-white hover:text-gray-700'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>রেজিস্ট্রেশন</span>
              </button>
            </div>

            {/* Error message */}
            {authError && (
              <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Forms */}
            <div className="p-5">
              {authTab === 'signin' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="আপনার ইমেইল লিখুন"
                      required
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন"
                      required
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold text-sm transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {authLoading ? 'সাইন ইন হচ্ছে...' : 'সাইন ইন করুন'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">নাম</label>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                      required
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="আপনার ইমেইল লিখুন"
                      required
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                      required
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {authLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* If User IS Logged In: Show Profile, Stats Grid, AND settings */
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">আমার প্রোফাইল</h2>

          {/* Profile Card */}
          <div className="bg-gray-100 p-6 rounded-xl shadow-sm border border-gray-300 text-center mb-5">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-teal-700">
                {currentUser.displayName ? currentUser.displayName[0] : (userName ? userName[0] : 'U')}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              {currentUser.displayName || userName || 'User'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{currentUser.email}</p>

            {/* 7 Stats Grid with Realtime Rank Badges */}
            <StatsGrid
              stats={appStats}
              isToday={isViewingToday}
              onOpenLeaderboard={onOpenLeaderboard}
              getRank={getMyRank}
            />

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 mt-4 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>লগ আউট করুন</span>
            </button>
          </div>

          {/* Automatic Hadith */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex justify-between items-center mt-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <BookHeart className="w-5 h-5 mr-2 text-indigo-600" />
                <span>অটোমেটিক হাদিস</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                প্রতি ৩০ মিনিট পর পর (অনলাইন/অফলাইন)
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoHadithEnabled}
                onChange={onToggleAutoHadith}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {/* Tauba & Zikir Reminder */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <BellRing className="w-5 h-5 mr-2 text-orange-600" />
                  <span>তাওবা ও জিকির রিমাইন্ডার</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  নির্দিষ্ট সময় পর পর এলার্ম বাজবে
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={generalReminder && generalReminder.enabled}
                  onChange={onToggleGeneralReminder}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
              </label>
            </div>

            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">সময় ব্যবধান:</span>
              <select
                id="general-interval-select"
                value={generalReminder.interval}
                onChange={(e) => onSetGeneralInterval(Number(e.target.value))}
                className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 bg-white"
              >
                {intervals.map((m) => (
                  <option key={m} value={m}>
                    {m} মিনিট
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Alarm Issue / Exact Alarm Permission Prompt */}
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-xl mt-4">
            <p className="text-sm font-bold">অ্যালার্ম সমস্যা হচ্ছে?</p>
            <p className="text-xs mt-0.5 text-yellow-700">
              সঠিক সময়ে রিমাইন্ডার পেতে নিচের বাটনে ক্লিক করে পারমিশন 'Allow' করুন।
            </p>
            <button
              type="button"
              onClick={openExactAlarmSettings}
              className="mt-2.5 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
            >
              পারমিশন অন করুন
            </button>
          </div>

          {/* Point count start date */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-5 mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <Clock3 className="w-5 h-5 inline mr-2 text-teal-600" />
              <span>পয়েন্ট কাউন্ট শুরু</span>
            </h2>
            <div className="flex space-x-2">
              <input
                type="date"
                id="lifetime-start-date-input"
                value={dateInput}
                max={maxDate}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => onSetLifetimeStartDate(dateInput)}
                className="bg-teal-600 text-white px-4 rounded-lg cursor-pointer hover:bg-teal-700 transition font-bold text-sm shrink-0"
              >
                সেট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Clock, BellRing, Volume2, ShieldCheck, Info, Smartphone, CheckCircle2 } from 'lucide-react';
import { ReminderSetting } from '../../types/ibadat';
import { NotificationService } from '../../services/notificationService';

interface ReminderDialogProps {
  activityKey: string;
  activityName: string;
  initialSetting?: ReminderSetting;
  onSave: (key: string, name: string, start: string, count: number, interval: number) => void;
  onDelete: (key: string, name: string) => void;
  onDismiss: () => void;
}

export const ReminderDialog: React.FC<ReminderDialogProps> = ({
  activityKey,
  activityName,
  initialSetting,
  onSave,
  onDelete,
  onDismiss
}) => {
  const [startTime, setStartTime] = useState(initialSetting?.start || '06:00');
  const [count, setCount] = useState(initialSetting?.count?.toString() || '3');
  const [interval, setInterval] = useState(initialSetting?.interval?.toString() || '10');
  const [testSent, setTestSent] = useState(false);
  const [delayedTesting, setDelayedTesting] = useState(false);
  const [permGranted, setPermGranted] = useState(NotificationService.getPermissionState() === 'granted');
  const [showCordovaHelp, setShowCordovaHelp] = useState(false);

  const diag = NotificationService.getDiagnostics();

  const handleRequestPerm = async () => {
    const granted = await NotificationService.requestPermission();
    setPermGranted(granted);
    if (granted) {
      NotificationService.sendNotification(
        "নোটিফিকেশন সক্রিয় হয়েছে",
        "আলহামদুলিল্লাহ! আপনার ডিভাইসে নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে।"
      );
    }
  };

  const handleInstantTest = async () => {
    await NotificationService.requestPermission();
    NotificationService.sendNotification(
      `টেস্ট রিমাইন্ডার: ${activityName}`,
      `এটি একটি পরীক্ষা বার্তা। ${activityName}-এর সময় হলে এভাবে এলার্ম ও নোটিফিকেশন আসবে।`
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleDelayedTest = () => {
    setDelayedTesting(true);
    NotificationService.scheduleDelayedOutsideTest(5, () => {
      // Prompt user to minimize
    });
    setTimeout(() => {
      setDelayedTesting(false);
    }, 6000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await NotificationService.requestPermission();
    const cnt = parseInt(count, 10) || 3;
    const itv = parseInt(interval, 10) || 10;
    onSave(
      activityKey,
      activityName,
      startTime || '06:00',
      Math.min(10, Math.max(1, cnt)),
      Math.max(1, itv)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 id="reminder-title" className="text-xl font-bold text-gray-800 flex items-center">
            <BellRing className="w-5 h-5 text-teal-600 mr-2" />
            রিমাইন্ডার সেট করুন
          </h3>
          <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-semibold border border-teal-200">
            {activityName}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-3 flex items-center">
          <Clock className="w-3.5 h-3.5 inline mr-1 text-teal-600 shrink-0" />
          <span>নির্ধারিত সময়ে শব্দ ও অ্যান্ড্রয়েড নোটিফিকেশন প্রদান করা হবে</span>
        </p>

        {/* Diagnostic & Permissions Box */}
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <ShieldCheck className={`w-3.5 h-3.5 ${permGranted ? 'text-emerald-600' : 'text-amber-500'}`} />
              পারমিশন: {permGranted ? 'অনুমোদিত (Active)' : 'প্রয়োজন (Needed)'}
            </span>
            {!permGranted && (
              <button
                type="button"
                onClick={handleRequestPerm}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-2 py-0.5 rounded cursor-pointer text-[11px]"
              >
                অনুমতি দিন
              </button>
            )}
          </div>

          <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-slate-200/80 pt-1.5">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-500" />
              কর্ডোভা মোড:
            </span>
            <span className={diag.isCordova ? 'text-emerald-600 font-bold' : 'text-slate-600 font-medium'}>
              {diag.isCordova ? 'অ্যান্ড্রয়েড প্লাগইন সক্রিয়' : 'ওয়েব প্রিভিউ মোড'}
            </span>
          </div>

          {/* Test Buttons Row */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={handleInstantTest}
                className="flex-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 py-1.5 px-2 rounded font-medium flex items-center justify-center transition cursor-pointer"
              >
                <Volume2 className="w-3 h-3 mr-1 text-teal-600 shrink-0" />
                {testSent ? 'বাজছে...' : 'ইনস্ট্যান্ট টেস্ট'}
              </button>

              <button
                type="button"
                onClick={handleDelayedTest}
                disabled={delayedTesting}
                className={`flex-1 text-[11px] py-1.5 px-2 rounded font-semibold flex items-center justify-center transition cursor-pointer ${
                  delayedTesting
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300'
                }`}
                title="৫ সেকেন্ড পর নোটিফিকেশন আসবে, অ্যাপ মিনিমাইজ করে ফোনের বাইরে পরীক্ষা করুন"
              >
                <BellRing className="w-3 h-3 mr-1 text-teal-700 shrink-0" />
                {delayedTesting ? 'অ্যাপ মিনিমাইজ করুন!' : 'বাহিরে টেস্ট (৫ সে.)'}
              </button>
            </div>

            {delayedTesting && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-tight">
                ⏳ <strong>টাইমার চালু হয়েছে!</strong> দ্রুত অ্যাপ মিনিমাইজ করুন বা ফোন লক করুন। ৫ সেকেন্ড পর স্ক্রিনের উপরে নোটিফিকেশন আসবে।
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="reminder-start-time" className="block text-xs font-bold text-gray-700 mb-1">
              ১. শুরু করার সময় (Time)
            </label>
            <input
              type="time"
              id="reminder-start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reminder-count" className="block text-xs font-bold text-gray-700 mb-1">
              ২. মোট কতবার রিমাইন্ডার দেবে
            </label>
            <input
              type="number"
              id="reminder-count"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
              className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">সর্বোচ্চ ১০ বার পুনরাবৃত্তি</p>
          </div>

          <div className="mb-3">
            <label htmlFor="reminder-interval" className="block text-xs font-bold text-gray-700 mb-1">
              ৩. কত মিনিট পর পর দেবে (Interval)
            </label>
            <input
              type="number"
              id="reminder-interval"
              min={1}
              max={120}
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              required
              className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">মিনিট ব্যবধান (যেমন: ৫, ১০, ১৫ মিনিট)</p>
          </div>

          {/* Cordova Note Toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowCordovaHelp(!showCordovaHelp)}
              className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center font-bold cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 mr-1" />
              {showCordovaHelp ? 'গাইড লুকান' : 'অ্যাপ বন্ধ বা বাইরে থাকলে নোটিফিকেশন পাওয়ার নিয়ম'}
            </button>
            {showCordovaHelp && (
              <div className="mt-2 p-2.5 bg-teal-50/80 border border-teal-200 rounded-lg text-[11px] text-teal-950 space-y-1.5 leading-relaxed">
                <p className="font-bold flex items-center gap-1 text-teal-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  অ্যাপের বাইরে নোটিফিকেশন পাওয়ার শর্তসমূহ:
                </p>
                <p>১. <span className="font-semibold">cordova.js সংযোগ:</span> অ্যাপের index.html-এ cordova.js স্বয়ংক্রিয়ভাবে সংযুক্ত করা হয়েছে।</p>
                <p>২. <span className="font-semibold">অ্যান্ড্রয়েড ১৩+ নোটিফিকেশন পারমিশন:</span> অ্যাপ ইনস্টল করার পর ফোনের সেটিংস থেকে নোটিফিকেশন অন রাখুন।</p>
                <p>৩. <span className="font-semibold">ব্যাটারি অপটিমাইজেশন (গুরুত্বপূর্ণ):</span> Xiaomi/Samsung/Realme ফোনে অ্যাপ আইকনে চেপে ধরে App Info &gt; Battery &gt; "Unrestricted / Don't Optimize" সিলেক্ট করুন, যাতে ফোন লক থাকলেও এলার্ম বন্ধ না হয়।</p>
                <p className="text-[10px] text-teal-800 pt-1 border-t border-teal-200">
                  উপরে <span className="font-bold">"বাহিরে টেস্ট (৫ সে.)"</span> বাটনে চাপ দিয়ে দ্রুত অ্যাপ মিনিমাইজ করে পরীক্ষা করতে পারেন।
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100">
            {initialSetting ? (
              <button
                type="button"
                onClick={() => onDelete(activityKey, activityName)}
                className="py-2 px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-bold text-xs cursor-pointer"
              >
                বাতিল করুন
              </button>
            ) : (
              <div />
            )}

            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onDismiss}
                className="py-2 px-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition text-xs font-medium cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-semibold text-xs shadow-sm cursor-pointer"
              >
                রিমাইন্ডার সেট করুন
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

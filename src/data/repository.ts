import { AUTO_LIBRARY_NOTES } from './hadithBank';
import {
  PrayerItem,
  NafilPrayerItem,
  RoutineTaskItem,
  DuaNote,
  ReminderSetting,
  GeneralReminderSetting,
  TaskStats,
  LeaderboardUser,
  AppStats,
  ChampionInfo
} from '../types/ibadat';

export const POINTS = {
  fard: 10,
  tahajjud: 20,
  nafil: 10,
  dhikrGoal: 5,
  amal_high: 20,
  amal_medium: 10,
  amal_low: 5,
  dhikr_checklist: 5,
  dua_zikir: 5,
  morning_evening_zikir: 3
};

export class IbadatRepository {
  static readonly PRAYERS: PrayerItem[] = [
    {
      key: "fajr",
      name: "ফজর",
      type: "fard",
      rakat: "২",
      point: 10,
      hasDua: true,
      hasMorningZikir: true,
      details: "ফজর সালাতের ফযিলত অনেক। রাসুল (সা.) বলেছেন, 'যে ব্যক্তি ফজরের নামাজ জামাতের সাথে আদায় করল, সে যেন সারা রাত ইবাদত করল।' (মুসলিম)"
    },
    {
      key: "zuhr",
      name: "যোহর",
      type: "fard",
      rakat: "৪",
      point: 10,
      hasDua: true,
      details: "যোহরের ওয়াক্ত শুরু হয় সূর্য ঢলে পড়ার পর থেকে। এটি দিনের মধ্যভাগের গুরুত্বপূর্ণ ইবাদত।"
    },
    {
      key: "asr",
      name: "আছর",
      type: "fard",
      rakat: "৪",
      point: 10,
      hasDua: true,
      details: "আছরের সালাত ছুটে গেলে রাসুল (সা.) এমনভাবে কষ্ট পেতেন যেন তাঁর পরিবার ও সম্পদ ধ্বংস হয়ে গেছে। এটি মধ্যবর্তী সালাত।"
    },
    {
      key: "maghrib",
      name: "মাগরিব",
      type: "fard",
      rakat: "৩",
      point: 10,
      hasDua: true,
      hasEveningZikir: true,
      details: "মাগরিবের সালাত সূর্য ডোবার পরপরই আদায় করা উত্তম। বিলম্ব করা মাকরুহ।"
    },
    {
      key: "isha",
      name: "এশা",
      type: "fard",
      rakat: "৪",
      point: 10,
      hasDua: true,
      details: "এশার সালাত জামাতে আদায় করলে অর্ধেক রাত ইবাদতের সওয়াব পাওয়া যায়। (মুসলিম)"
    },
    {
      key: "tahajjud",
      name: "তাহাজ্জুদ",
      type: "tahajjud_custom",
      rakat: "২-৮",
      point: 20,
      details: "তাহাজ্জুদ হলো মুমিনের সম্মানের প্রতীক। আল্লাহ তায়ালা শেষ রাতে প্রথম আসমানে নেমে আসেন এবং বান্দার দোয়া কবুল করেন।"
    }
  ];

  static readonly NAWAFIL_PRAYERS: NafilPrayerItem[] = [
    {
      key: "ishraq",
      name: "ইশরাক (চাশত)",
      rakat: "২-৪",
      info: "সূর্যোদয়ের ১৫ মিনিট পর",
      details: "ফজরের পর সূর্যোদয় পর্যন্ত যিকির করে ২ রাকাত ইশরাক পড়লে একটি কবুল হজ্জ ও ওমরাহর সওয়াব পাওয়া যায়। (তিরমিযি)",
      point: 10
    },
    {
      key: "awwabin",
      name: "আউয়াবিন",
      rakat: "৬",
      info: "মাগরিব ও এশার মাঝে",
      details: "মাগরিবের পর ৬ রাকাত নফল নামাজকে আউয়াবিন বলা হয়। একে গাফিলদের সময়ের ইবাদতও বলা হয়।",
      point: 10
    },
    {
      key: "istikhara",
      name: "সালাতুল ইস্তিখারা",
      rakat: "২",
      info: "সিদ্ধান্ত নিতে দ্বিধায়",
      details: "যখন কোনো বিষয়ে সিদ্ধান্ত নিতে দ্বিধায় ভোগেন, তখন দু'আসহ এই সালাতটি আদায় করা হয়।",
      point: 10
    },
    {
      key: "mashjid",
      name: "তাহিয়্যাতুল মসজিদ",
      rakat: "২",
      info: "মসজিদে প্রবেশ করলে",
      details: "যেকোনো সময় মসজিদে প্রবেশ করলেই বসার আগে ২ রাকাত সালাত আদায় করা সুন্নাত। এটি হলো মসজিদকে অভিবাদন জানানো।",
      point: 10
    },
    {
      key: "oju",
      name: "সুন্নাতুল ওযু",
      rakat: "২",
      info: "ওযুর পর",
      details: "উত্তমরূপে ওযু করার পর এই ২ রাকাত সালাত আদায় করলে জান্নাত ওয়াজিব হতে পারে।",
      point: 10
    }
  ];

  static readonly SPECIAL_AMAL_TASKS: RoutineTaskItem[] = [
    {
      key: "daily_charity",
      name: "দান ও সদাকা",
      target: 1,
      point: 10,
      details: "রাসুল (সা.) বলেছেন, দান সম্পদ কমায় না। প্রতিদিন সাধ্যমতো দান করুন অথবা মানুষের উপকার করুন, এটিও সদাকা। (মুসলিম)"
    }
  ];

  static readonly MORNING_TASKS: RoutineTaskItem[] = [
    {
      key: "morning_dhikr",
      name: "সারা দিন যিকির ও তওবা",
      target: 100000,
      point: 20,
      details: "আল্লাহর স্মরণ মুমিনের হৃদয়কে প্রশান্ত করে। দিনে যত বেশি সম্ভব ইস্তিগফার ও যিকির করা উচিত।"
    },
    {
      key: "morning_wake_up_dua",
      name: "ঘুম থেকে উঠার দু'আ",
      target: 1,
      point: 5,
      details: "হাদিসে এসেছে, যে ব্যক্তি রাতের ঘুম থেকে জাগ্রত হয়ে নিচের দোয়াটি পাঠ করবে এবং আল্লাহর কাছে ক্ষমা চাইবে, তার দোয়া কবুল হওয়ার এবং অজু করে সালাত (নামাজ) আদায় করলে তা কবুল হওয়ার সুসংবাদ দেওয়া হয়েছে।\nসহীহ বুখারী, হাদিস নম্বর: ১১৫৪\nলা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়্যিন ক্বাদীর, আল-হামদু লিল্লাহ, ওয়া সুবহানাল্লাহ, ওয়া লা ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার, ওয়া লা হাওলা ওয়া লা কুওয়্যাতা ইল্লা বিল্লাহ।"
    },
    {
      key: "allah_100_times",
      name: "সকালে ২ পেজ কুরআন পড়া",
      target: 1,
      point: 10,
      details: "সকালের শুরুটা কুরআন দিয়ে করলে সারাদিন বরকত থাকে।"
    },
    {
      key: "morning_3_qul_hashr",
      name: "৩ কুল ও সূরা হাশরের শেষ ৩ আয়াত",
      target: 2,
      point: 10,
      details: "সকাল ও সন্ধ্যায় সূরা ইখলাস, ফালাক ও নাস ৩ বার করে পড়লে সব অনিষ্ট থেকে রক্ষা পাওয়া যায়।"
    },
    {
      key: "durud_sarif",
      name: "দরূদ শরীফ",
      target: 100,
      point: 10,
      details: "যে ব্যক্তি একবার দরুদ পড়ে, আল্লাহ তার ওপর ১০টি রহমত নাযিল করেন।"
    },
    {
      key: "big_nek",
      name: "সুবহা-নাল্লা-হি ওয়া বিহামদিহী, সুবহা-নাল্লা-হিল আযীম।",
      target: 100,
      point: 15,
      details: "সকালে ১০০ বার পড়লে তার চেয়ে উত্তম আমল নিয়ে কিয়ামতের দিন কেউ উঠতে পারবে না (যদি না সে আরও বেশি করে)।"
    },
    {
      key: "lahul_mulku",
      name: "লা ইলাহা ইল্লাল্লাহু...",
      target: 100,
      point: 20,
      details: "যে ব্যক্তি এটি ১০০ বার পড়বে, সে ১০টি গোলাম আযাদ করার সওয়াব পাবে এবং ১০০টি নেকি লেখা হবে।"
    }
  ];

  static readonly NIGHTLY_TASKS: RoutineTaskItem[] = [
    {
      key: "nightly_2_rakat_salah",
      name: "ঘুমানোর আগে ২ রাকাত সালাত",
      target: 1,
      point: 10,
      details: "ওযু করে ২ রাকাত নামাজ পড়ে ঘুমানো সুন্নাত। এতে ফেরেশতারা সারারাত তার জন্য দোয়া করতে থাকে।"
    },
    {
      key: "nightly_sleep_dua",
      name: "ঘুমের সব দু'আ",
      target: 1,
      point: 10,
      details: "দু'আ: আল্লাহুম্মা বিসমিকা আমুতু ওয়া আহইয়া। এবং ৩৩ বার সুবহানাল্লাহ, ৩৩ বার আলহামদুলিল্লাহ, ৩৪ বার আল্লাহু আকবার।"
    },
    {
      key: "nightly_surah_baqarah",
      name: "সূরা বাকারার শেষ ২ আয়াত",
      target: 1,
      point: 5,
      details: "যে ব্যক্তি রাতে সূরা বাকারার শেষ দুই আয়াত পড়বে, তা তার জন্য যথেষ্ট হবে। (বুখারী)"
    },
    {
      key: "nightly_surah_mulk",
      name: "সূরা মুলক",
      target: 1,
      point: 15,
      details: "সূরা মুলক কবরের আজাব থেকে রক্ষা করে। রাসুল (সা.) এটি না পড়ে ঘুমাতেন না।"
    },
    {
      key: "father_mother",
      name: "পিতা-মাতার জন্য দু'আ(৩ বার)",
      target: 3,
      point: 2,
      details: "রব্বির হামহুমা কামা রব্বায়ানি সাগিরা। তাদের জন্য দোয়া করা সন্তানের অন্যতম দায়িত্ব।"
    }
  ];

  static readonly QURAN_TASKS: RoutineTaskItem[] = [
    {
      key: "quran_mulk",
      name: "সূরা মুলক",
      target: 1,
      point: 10,
      details: "প্রতি রাতে সূরা মুলক তিলাওয়াত করা কবরের আজাব থেকে মুক্তির উপায়।"
    },
    {
      key: "quran_ar_rahman",
      name: "সূরা আর-রহমান",
      target: 1,
      point: 10,
      details: "সূরা আর-রহমান হলো কুরআনের সৌন্দর্য বা 'কুরআনের দুল'।"
    },
    {
      key: "quran_yasin",
      name: "সূরা ইয়াছিন",
      target: 1,
      point: 10,
      details: "সূরা ইয়াসিন কুরআনের হৃৎপিণ্ড। যে ব্যক্তি এটি একবার পড়বে, আল্লাহ তাকে ১০ বার কুরআন খতমের সওয়াব দেবেন।"
    },
    {
      key: "quran_kahf_20",
      name: "সূরা কাহফ (১০ আয়াত)",
      target: 1,
      point: 10,
      details: "জুমুআর দিন সূরা কাহফ পড়লে দুই জুমুআর মধ্যবর্তী সময়টা নূর দিয়ে আলোকিত থাকে। প্রথম ১০ আয়াত দাজ্জাল থেকে রক্ষা করে।"
    },
    {
      key: "quran_baqarah_10",
      name: "সূরা বাকারা (২০ আয়াত)",
      target: 1,
      point: 10,
      details: "যে ঘরে সূরা বাকারা পড়া হয়, সেখান থেকে শয়তান পালিয়ে যায়।"
    },
    {
      key: "quran_last_10_surah",
      name: "শেষ ১০ সূরা",
      target: 1,
      point: 10,
      details: "নামাজের জন্য ছোট সূরাগুলো বিশুদ্ধভাবে শেখা এবং নিয়মিত চর্চা করা জরুরি।"
    }
  ];

  static readonly DHIKR_CHECKLIST_TASKS: RoutineTaskItem[] = [
    {
      key: "subhanallah_100",
      name: "সুবহানাল্লাহ (১০০ বার)",
      target: 1,
      point: 5,
      arabic: "سُبْحَانَ ٱللَّٰهِ",
      details: "আল্লাহর পবিত্রতা ঘোষণা করা। এটি মীযানের পাল্লায় অনেক ভারী।"
    },
    {
      key: "alhamdulillah_100",
      name: "আলহামদুলিল্লাহ (১০০ বার)",
      target: 1,
      point: 5,
      arabic: "ٱلْحَمْدُ লِلَّٰهِ",
      details: "সমস্ত প্রশংসা আল্লাহর জন্য। এটি সর্বোত্তম দু'আ।"
    },
    {
      key: "allahuakbar_100",
      name: "আল্লাহু আকবার (১০০ বার)",
      target: 1,
      point: 5,
      arabic: "ٱللَّهُ أَكْبَرُ",
      details: "আল্লাহ সবচেয়ে মহান। সালাত ও আযানের অবিচ্ছেদ্য অংশ।"
    },
    {
      key: "subhanallahi_100",
      name: "সুবহা-নাল্লা-হি ওয়া বিহামদিহী, সুবহা-নাল্লা-হিল আযীম।(১০০ বার)",
      target: 1,
      point: 5,
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      details: "যে ব্যক্তি এটি দৈনিক ১০০ বার পড়ে, তার গুনাহ সমুদ্রের ফেনা পরিমাণ হলেও মাফ করে দেওয়া হয়।"
    },
    {
      key: "laailahaillallah_100",
      name: "লা ইলাহা ইল্লাল্লাহ (১০০ বার)",
      target: 1,
      point: 5,
      arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
      details: "সর্বোত্তম যিকির। জান্নাতের চাবি।"
    },
    {
      key: "sayyidul_istighfar_1",
      name: "সাইয়্যিদুল ইস্তিগফার (সকাল-সন্ধ্যা)",
      target: 1,
      point: 5,
      arabic: "সাইয়্যিদুল ইস্তিগফার",
      details: "যে ব্যক্তি দিনে বা রাতে বিশ্বাসের সাথে এটি পড়ে মারা যাবে, সে জান্নাতি হবে। (বুখারী)"
    },
    {
      key: "istighfirullah_100",
      name: "আস্তাগফিরুল্লাহ (১০০ বার)",
      target: 1,
      point: 5,
      arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
      details: "আমি আল্লাহর কাছে ক্ষমা চাই। ইস্তিগফার রিজিক বৃদ্ধি করে এবং বিপদ দূর করে।"
    },
    {
      key: "la_Hawla_100",
      name: "লা হাউলা ওয়া লা কুওয়াতা... (১০০ বার)",
      target: 1,
      point: 5,
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ",
      details: "জান্নাতের ভান্ডারসমূহের একটি ভান্ডার। কোনো শক্তি বা ক্ষমতা নেই আল্লাহ ছাড়া।"
    }
  ];

  private readonly STORAGE_KEY = 'ibadat_tracker_state_v3';

  // Read full appState object matching user schema
  private getAppState(): Record<string, any> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return {
        activeView: 'salah',
        currentViewingDateKey: this.getTodayKey(),
        salahLog: {},
        nawafilLog: {},
        dhikrLog: {},
        morningLog: {},
        nightlyLog: {},
        quranLog: {},
        specialAmalLog: {},
        duaNotes: [],
        stats: {
          todayPoints: 0,
          yesterdayPoints: 0,
          totalPoints: 0,
          totalPoints7Days: 0,
          totalPoints30Days: 0,
          highScore30Days: 0,
          fardCompleted7Days: 0
        },
        currentUser: { name: 'ব্যবহারকারী', id: 'anon_user' },
        reminders: {},
        autoHadithEnabled: true,
        generalReminder: { enabled: true, interval: 10 },
        lifetimeStartDate: new Date().toISOString().split('T')[0]
      };
    }
    try {
      const state = JSON.parse(raw);
      if (!state.salahLog) state.salahLog = {};
      if (!state.nawafilLog) state.nawafilLog = {};
      if (!state.dhikrLog) state.dhikrLog = {};
      if (!state.morningLog) state.morningLog = {};
      if (!state.nightlyLog) state.nightlyLog = {};
      if (!state.quranLog) state.quranLog = {};
      if (!state.specialAmalLog) state.specialAmalLog = {};
      if (!state.duaNotes) state.duaNotes = [];
      if (!state.reminders) state.reminders = {};
      if (!state.currentUser) state.currentUser = { name: 'ব্যবহারকারী', id: 'anon_user' };
      if (!state.generalReminder) state.generalReminder = { enabled: true, interval: 10 };
      if (!state.lifetimeStartDate) state.lifetimeStartDate = new Date().toISOString().split('T')[0];
      return state;
    } catch {
      return {};
    }
  }

  getFullState(): Record<string, any> {
    return this.getAppState();
  }

  loadFromCloudState(cloudState: Record<string, any>): void {
    if (!cloudState || typeof cloudState !== 'object') return;
    this.saveAppState(cloudState);
  }

  setCurrentUser(user: { id: string; name: string; email?: string }): void {
    const state = this.getAppState();
    state.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email || ''
    };
    this.saveAppState(state);
  }

  getCurrentUser(): { id: string; name: string; email?: string } | null {
    const state = this.getAppState();
    return state.currentUser || null;
  }

  private saveAppState(state: Record<string, any>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  // Date helpers
  formatIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getTodayKey(): string {
    return this.formatIsoDate(new Date());
  }

  // Preferences
  getUserName(): string {
    const state = this.getAppState();
    return state.currentUser?.name || localStorage.getItem("user_name") || "ব্যবহারকারী";
  }

  setUserName(name: string): void {
    const state = this.getAppState();
    if (!state.currentUser) state.currentUser = {};
    state.currentUser.name = name;
    localStorage.setItem("user_name", name);
    this.saveAppState(state);
  }

  getLifetimeStartDate(): string {
    const state = this.getAppState();
    return state.lifetimeStartDate || localStorage.getItem("lifetime_start_date") || new Date().toISOString().split('T')[0];
  }

  setLifetimeStartDate(date: string): void {
    const state = this.getAppState();
    state.lifetimeStartDate = date;
    localStorage.setItem("lifetime_start_date", date);
    this.saveAppState(state);
  }

  isAutoHadithEnabled(): boolean {
    const state = this.getAppState();
    return state.autoHadithEnabled !== false;
  }

  setAutoHadithEnabled(enabled: boolean): void {
    const state = this.getAppState();
    state.autoHadithEnabled = enabled;
    localStorage.setItem("auto_hadith_enabled", String(enabled));
    this.saveAppState(state);
  }

  getGeneralReminder(): GeneralReminderSetting {
    const state = this.getAppState();
    return state.generalReminder || { enabled: true, interval: 10 };
  }

  setGeneralReminder(setting: GeneralReminderSetting): void {
    const state = this.getAppState();
    state.generalReminder = setting;
    this.saveAppState(state);
  }

  // Task Logs
  getLog(category: string, dateKey: string): Record<string, boolean> {
    const state = this.getAppState();
    const key = `${category}Log`;
    if (state[key] && state[key][dateKey]) {
      return state[key][dateKey];
    }
    // Fallback to legacy key
    const raw = localStorage.getItem(`log_${category}_${dateKey}`);
    if (raw) {
      try { return JSON.parse(raw); } catch { return {}; }
    }
    return {};
  }

  saveLog(category: string, dateKey: string, log: Record<string, boolean>): void {
    const state = this.getAppState();
    const key = `${category}Log`;
    if (!state[key]) state[key] = {};
    state[key][dateKey] = log;
    this.saveAppState(state);
    localStorage.setItem(`log_${category}_${dateKey}`, JSON.stringify(log));
  }

  toggleTask(category: string, dateKey: string, taskKey: string): boolean {
    const current = { ...this.getLog(category, dateKey) };
    const nextState = !current[taskKey];
    current[taskKey] = nextState;
    this.saveLog(category, dateKey, current);
    return nextState;
  }

  // Dua Notes
  getDuaNotes(): DuaNote[] {
    const state = this.getAppState();
    const userNotes: DuaNote[] = state.duaNotes || [];
    return [...userNotes, ...AUTO_LIBRARY_NOTES];
  }

  addDuaNote(title: string, text: string): DuaNote {
    const id = Date.now().toString();
    const dateStr = title || new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    const note: DuaNote = {
      id,
      title: title || dateStr,
      text,
      date: dateStr,
      isAuto: false
    };

    const state = this.getAppState();
    if (!state.duaNotes) state.duaNotes = [];
    state.duaNotes.unshift(note);
    this.saveAppState(state);
    return note;
  }

  deleteDuaNote(id: string): void {
    if (id.startsWith("auto_")) return;
    const state = this.getAppState();
    if (state.duaNotes) {
      state.duaNotes = state.duaNotes.filter((n: DuaNote) => n.id !== id);
      this.saveAppState(state);
    }
  }

  // Reminders
  getReminders(): Record<string, ReminderSetting> {
    const state = this.getAppState();
    return state.reminders || {};
  }

  saveReminder(setting: ReminderSetting): void {
    const state = this.getAppState();
    if (!state.reminders) state.reminders = {};
    state.reminders[setting.key] = setting;
    this.saveAppState(state);
  }

  deleteReminder(activityKey: string): void {
    const state = this.getAppState();
    if (state.reminders) {
      delete state.reminders[activityKey];
      this.saveAppState(state);
    }
  }

  // Points Calculation matching the user's logic exactly
  calculatePoints(dateKey: string): number {
    let points = 0;
    const salah = this.getLog("salah", dateKey);
    const nawafil = this.getLog("nawafil", dateKey);
    const dhikr = this.getLog("dhikr", dateKey);
    const morning = this.getLog("morning", dateKey);
    const nightly = this.getLog("nightly", dateKey);
    const quran = this.getLog("quran", dateKey);
    const special = this.getLog("specialAmal", dateKey);

    // Salah
    IbadatRepository.PRAYERS.forEach(p => {
      if (salah[p.key]) {
        points += (p.key === 'tahajjud' ? POINTS.tahajjud : POINTS.fard);
      }
      if (p.type === 'fard' && salah[`${p.key}_dua`]) {
        points += POINTS.dua_zikir;
      }
    });

    if (salah['fajr_morning_zikir']) points += POINTS.morning_evening_zikir;
    if (salah['maghrib_evening_zikir']) points += POINTS.morning_evening_zikir;

    // Nawafil
    IbadatRepository.NAWAFIL_PRAYERS.forEach(n => {
      if (nawafil[n.key]) points += POINTS.nafil;
    });

    // Dhikr checklist
    IbadatRepository.DHIKR_CHECKLIST_TASKS.forEach(d => {
      if (dhikr[d.key]) points += POINTS.dhikr_checklist;
    });

    // Special Amal
    IbadatRepository.SPECIAL_AMAL_TASKS.forEach(s => {
      if (special[s.key]) points += s.point;
    });

    // Morning
    IbadatRepository.MORNING_TASKS.forEach(m => {
      if (morning[m.key]) points += m.point;
    });

    // Nightly
    IbadatRepository.NIGHTLY_TASKS.forEach(n => {
      if (nightly[n.key]) points += n.point;
    });

    // Quran
    IbadatRepository.QURAN_TASKS.forEach(q => {
      if (quran[q.key]) points += q.point;
    });

    return points;
  }

  getLifetimeDays(): number {
    const startStr = this.getLifetimeStartDate();
    const startDate = new Date(startStr);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const diff = Math.round(Math.abs(today.getTime() - startDate.getTime()) / ONE_DAY);
    const days = diff + 1;
    return days < 1 ? 1 : days;
  }

  getTaskCompletionStats(category: string, taskKey: string): TaskStats {
    const totalDays = this.getLifetimeDays();
    let weekCount = 0;
    let monthCount = 0;
    let lifetimeCount = 0;

    const maxCheck = Math.min(totalDays, 365);
    const now = new Date();

    for (let i = 0; i < maxCheck; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = this.formatIsoDate(d);
      const log = this.getLog(category, key);

      if (log[taskKey]) {
        if (i < 7) weekCount++;
        if (i < 30) monthCount++;
        lifetimeCount++;
      }
    }

    return {
      week: weekCount,
      month: monthCount,
      lifetime: lifetimeCount,
      totalWeekDays: 7,
      totalMonthDays: 30,
      totalLifetimeDays: totalDays
    };
  }

  getAppStats(selectedDateKey: string): AppStats {
    const today = new Date();
    const selectedPoints = this.calculatePoints(selectedDateKey);

    let todayPoints = 0;
    let yesterdayPoints = 0;
    let total7 = 0;
    let total30 = 0;
    let highScore30 = 0;
    let fardCompleted7 = 0;

    const fardKeys = IbadatRepository.PRAYERS.filter(p => p.type === "fard").map(p => p.key);

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.formatIsoDate(d);
      const pts = this.calculatePoints(key);

      if (i === 0) todayPoints = pts;
      if (i === 1) yesterdayPoints = pts;

      if (i < 7) {
        total7 += pts;
        const salah = this.getLog("salah", key);
        fardKeys.forEach(fk => {
          if (salah[fk]) fardCompleted7++;
        });
      }

      total30 += pts;
      if (pts > highScore30) highScore30 = pts;
    }

    // Lifetime calculation
    let totalLifetime = 0;
    const totalDays = this.getLifetimeDays();
    const maxLife = Math.min(totalDays, 365);
    for (let i = 0; i < maxLife; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = this.formatIsoDate(d);
      totalLifetime += this.calculatePoints(k);
    }

    return {
      todayPoints,
      selectedDayPoints: selectedPoints,
      yesterdayPoints,
      totalPoints7Days: total7,
      totalPoints30Days: total30,
      highScore30Days: highScore30,
      fardCompleted7Days: fardCompleted7,
      totalLifetimePoints: totalLifetime
    };
  }

  getYesterdayChampion(): ChampionInfo {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = this.formatIsoDate(yesterday);
    const userYesterday = this.calculatePoints(yesterdayKey);

    if (userYesterday >= 130) {
      return {
        name: this.getUserName(),
        points: userYesterday
      };
    } else {
      return {
        name: "আহমাদুল্লাহ",
        points: 145
      };
    }
  }

  getLeaderboard(metricType: string): LeaderboardUser[] {
    const userName = this.getUserName();
    const stats = this.getAppStats(this.getTodayKey());

    let userScore = stats.totalLifetimePoints;
    if (metricType === "todayPoints") userScore = stats.todayPoints;
    else if (metricType === "yesterdayPoints") userScore = stats.yesterdayPoints;
    else if (metricType === "totalPoints7Days") userScore = stats.totalPoints7Days;
    else if (metricType === "totalPoints30Days") userScore = stats.totalPoints30Days;
    else if (metricType === "highScore30Days") userScore = stats.highScore30Days;

    let baseContenders: [string, number][] = [];
    if (metricType === "todayPoints") {
      baseContenders = [
        ["মাওলানা তারেক", 140],
        ["আব্দুল্লাহ আল-মামুন", 125],
        ["সালমান ফারিস", 110],
        ["রাশেদুল হাসান", 95],
        ["নাঈম আহমেদ", 90],
        ["ফারহান চৌধুরী", 85],
        ["তানভীর মাহমুদ", 75],
        ["জুবায়ের হোসেন", 65]
      ];
    } else if (metricType === "yesterdayPoints") {
      baseContenders = [
        ["আহমাদুল্লাহ", 145],
        ["মাহবুবুর রহমান", 135],
        ["মুস্তাফিজুর রহমান", 120],
        ["সাইফুল ইসলাম", 115],
        ["ইমরান খান", 100],
        ["সাকিব আল হাসান", 95],
        ["কামরুল হাসান", 80],
        ["আরিফুল হক", 70]
      ];
    } else if (metricType === "totalPoints7Days") {
      baseContenders = [
        ["আব্দুল্লাহ আল-মামুন", 920],
        ["মাওলানা তারেক", 880],
        ["মাহবুবুর রহমান", 810],
        ["সালমান ফারিস", 740],
        ["রাশেদুল হাসান", 680],
        ["মুস্তাফিজুর রহমান", 620],
        ["নাঈম আহমেদ", 580],
        ["সাইফুল ইসলাম", 540]
      ];
    } else if (metricType === "totalPoints30Days") {
      baseContenders = [
        ["আব্দুল্লাহ আল-মামুন", 3850],
        ["মাওলানা তারেক", 3620],
        ["আহমাদুল্লাহ", 3490],
        ["মাহবুবুর রহমান", 3210],
        ["সালমান ফারিস", 2980],
        ["রাশেদুল হাসান", 2750],
        ["মুস্তাফিজুর রহমান", 2510],
        ["সাইফুল ইসলাম", 2340]
      ];
    } else {
      baseContenders = [
        ["আব্দুল্লাহ আল-মামুন", 12450],
        ["মাওলানা তারেক", 11800],
        ["আহমাদুল্লাহ", 10950],
        ["মাহবুবুর রহমান", 9820],
        ["সালমান ফারিস", 8900],
        ["রাশেদুল হাসান", 8150],
        ["মুস্তাফিজুর রহমান", 7600],
        ["সাইফুল ইসলাম", 7100]
      ];
    }

    const list: LeaderboardUser[] = baseContenders.map(([name, pts], i) => ({
      id: `contender_${i}`,
      name,
      points: pts,
      rank: 0,
      isCurrentUser: false
    }));

    list.push({
      id: "user_me",
      name: userName,
      points: userScore,
      rank: 0,
      isCurrentUser: true
    });

    list.sort((a, b) => b.points - a.points);

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }

  resetAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('last_reminder_check_day');
  }
}

export const repository = new IbadatRepository();

import { ReminderSetting } from '../types/ibadat';
import { getRandomQuote } from '../data/hadithBank';

// Cordova plugin typing definitions
declare global {
  interface Window {
    cordova?: {
      plugins?: {
        notification?: {
          local?: {
            hasPermission: (callback: (granted: boolean) => void) => void;
            requestPermission: (callback: (granted: boolean) => void) => void;
            schedule: (options: any | any[]) => void;
            cancel: (id: any | any[], callback?: () => void) => void;
            clear: (id: any | any[], callback?: () => void) => void;
            getAll: (callback: (notifications: any[]) => void) => void;
            on?: (event: string, callback: (...args: any[]) => void) => void;
          };
        };
        backgroundMode?: {
          enable: () => void;
          disable: () => void;
          isEnabled: () => boolean;
          isActive: () => boolean;
          setDefaults: (options: Record<string, any>) => void;
          overrideBackButton: () => void;
        };
        permissions?: {
          POST_NOTIFICATIONS?: string;
          checkPermission: (permission: string, success: (status: any) => void, error?: (err: any) => void) => void;
          requestPermission: (permission: string, success: (status: any) => void, error?: (err: any) => void) => void;
        };
      };
    };
  }
}

// Memory of what was triggered today to prevent duplicate triggers in JS ticker
const triggeredKeysToday = new Set<string>();
let lastDayKey = "";
let lastHadithTimestamp = Date.now();
let lastGeneralTimestamp = Date.now();
let isDeviceReady = false;
const readyListeners: Array<() => void> = [];

// Convert activity key and repeat index to a unique integer ID for Cordova Local Notifications
function hashKeyToNumber(key: string, index: number): number {
  let hash = 0;
  const str = `${key}_${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 500000) * 10 + (index % 10) + 1000;
}

// Initialize Cordova deviceready listener
if (typeof document !== 'undefined') {
  document.addEventListener('deviceready', () => {
    isDeviceReady = true;
    console.log('[Cordova] deviceready event triggered successfully!');
    NotificationService.initCordova();
    readyListeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn('deviceready listener error:', e);
      }
    });
  }, false);
}

export class NotificationService {
  /**
   * Register a listener for when Cordova deviceready fires
   */
  static onDeviceReady(listener: () => void): () => void {
    if (isDeviceReady) {
      listener();
    }
    readyListeners.push(listener);
    return () => {
      const idx = readyListeners.indexOf(listener);
      if (idx !== -1) readyListeners.splice(idx, 1);
    };
  }

  /**
   * Check if Cordova Local Notification plugin is available
   */
  static isCordovaAvailable(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      window.cordova?.plugins?.notification?.local
    );
  }

  /**
   * Check if Cordova is in environment
   */
  static isCordovaEnvironment(): boolean {
    return Boolean(typeof window !== 'undefined' && window.cordova);
  }

  /**
   * Check if Web Notification API is available in browser
   */
  static isWebNotificationAvailable(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Initializes Cordova plugins (Background Mode, Channels, Permissions)
   */
  static initCordova(): void {
    if (typeof window === 'undefined' || !window.cordova) return;

    // 1. Configure Background Mode if installed
    try {
      const bg = window.cordova.plugins?.backgroundMode;
      if (bg) {
        bg.setDefaults({
          title: 'ইবাদত ট্র্যাকার চলছে',
          text: 'ওয়াক্ত ও আমলের রিমাইন্ডার ব্যাকগ্রাউন্ডে সক্রিয় রয়েছে',
          icon: 'icon',
          color: '0D9488',
          silent: true
        });
        bg.enable();
        bg.overrideBackButton();
        console.log('[Cordova] background-mode enabled successfully');
      }
    } catch (e) {
      console.warn('[Cordova] background-mode init failed:', e);
    }

    // 2. Request Android 13+ Notification Permissions (POST_NOTIFICATIONS)
    try {
      const local = window.cordova.plugins?.notification?.local;
      if (local) {
        local.hasPermission((granted) => {
          if (!granted) {
            local.requestPermission((res) => {
              console.log('[Cordova] local-notification permission response:', res);
            });
          }
        });
      }

      const permissions = window.cordova.plugins?.permissions;
      if (permissions && typeof permissions.POST_NOTIFICATIONS === 'string') {
        const postNotif = permissions.POST_NOTIFICATIONS;
        permissions.checkPermission(postNotif, (status: any) => {
          if (!status?.hasPermission) {
            permissions.requestPermission(postNotif, (s: any) => {
              console.log('[Cordova] POST_NOTIFICATIONS granted:', s);
            });
          }
        });
      }
    } catch (e) {
      console.warn('[Cordova] permission check error:', e);
    }
  }

  /**
   * Request notification permission from Cordova or Browser
   */
  static async requestPermission(): Promise<boolean> {
    if (this.isCordovaAvailable()) {
      return new Promise<boolean>((resolve) => {
        try {
          window.cordova!.plugins!.notification!.local!.requestPermission((granted) => {
            resolve(Boolean(granted));
          });
        } catch {
          resolve(false);
        }
      });
    }

    if (this.isWebNotificationAvailable()) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Get current permission state
   */
  static getPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (this.isCordovaAvailable()) {
      return 'granted';
    }
    if (this.isWebNotificationAvailable()) {
      return Notification.permission;
    }
    return 'unsupported';
  }

  /**
   * Diagnostic report for troubleshooting outside/background notifications
   */
  static getDiagnostics(): {
    isCordova: boolean;
    isDeviceReady: boolean;
    hasLocalNotification: boolean;
    hasBackgroundMode: boolean;
    permission: string;
  } {
    return {
      isCordova: Boolean(typeof window !== 'undefined' && window.cordova),
      isDeviceReady,
      hasLocalNotification: Boolean(typeof window !== 'undefined' && window.cordova?.plugins?.notification?.local),
      hasBackgroundMode: Boolean(typeof window !== 'undefined' && window.cordova?.plugins?.backgroundMode),
      permission: this.getPermissionState()
    };
  }

  /**
   * Play a pleasant melodic Islamic chime using Web Audio API
   */
  static playChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Triple chime: C5 -> E5 -> G5
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.18);
        osc.stop(ctx.currentTime + i * 0.18 + 0.65);
      });
    } catch (e) {
      console.warn("Chime audio failed", e);
    }
  }

  /**
   * Send an immediate notification (Web, Cordova, and Audio chime)
   */
  static sendNotification(title: string, body: string): void {
    // 1. Play audio chime
    this.playChime();

    // 2. Try Cordova Local Notification (shows on system tray / heads-up)
    if (this.isCordovaAvailable()) {
      try {
        window.cordova!.plugins!.notification!.local!.schedule({
          id: Math.floor(Math.random() * 800000) + 100000,
          title,
          text: body,
          foreground: true,
          wakeup: true,
          vibrate: true,
          sound: true,
          priority: 2,
          importance: 4,
          channel: 'ibadat_instant_channel',
          channelName: 'ইবাদত রিমাইন্ডার',
          channelDescription: 'আমল ও ওয়াক্ত নোটিফিকেশন',
          lockscreenVisibility: 1
        });
      } catch (err) {
        console.warn("Cordova immediate notification failed", err);
      }
    }

    // 3. Try HTML5 Web Notification
    if (this.isWebNotificationAvailable() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: './app-icon.jpg',
          badge: './app-icon.jpg',
          tag: 'ibadat-reminder'
        });
      } catch (err) {
        console.warn("Web Notification failed", err);
      }
    }
  }

  /**
   * Schedule native Cordova local notifications for an activity reminder.
   * This is registered directly in Android's AlarmManager so that it triggers
   * even when the user is OUTSIDE the app, locked, or after reboot!
   */
  static scheduleCordovaReminders(setting: ReminderSetting): void {
    if (!this.isCordovaAvailable()) {
      console.log(`[Cordova] Cannot schedule ${setting.name}: Cordova plugin not detected.`);
      return;
    }

    try {
      const [hourStr, minuteStr] = setting.start.split(':');
      const baseHour = parseInt(hourStr, 10) || 6;
      const baseMin = parseInt(minuteStr, 10) || 0;
      const notifications: any[] = [];

      for (let i = 0; i < setting.count; i++) {
        const triggerTime = new Date();
        triggerTime.setHours(baseHour);
        triggerTime.setMinutes(baseMin + i * setting.interval);
        triggerTime.setSeconds(0);
        triggerTime.setMilliseconds(0);

        // If time already passed today, schedule for tomorrow
        if (triggerTime.getTime() <= Date.now()) {
          triggerTime.setDate(triggerTime.getDate() + 1);
        }

        const notifId = hashKeyToNumber(setting.key, i);

        notifications.push({
          id: notifId,
          title: `⏰ ${setting.name} এর রিমাইন্ডার`,
          text: `এখন ${setting.name}-এর ওয়াক্ত/আমল করার সময় হয়েছে (${i + 1}/${setting.count} বার)। আমলটি সম্পূর্ণ করুন।`,
          trigger: {
            at: triggerTime,
            every: 'day' // Android repeats daily at this exact time!
          },
          foreground: true,
          wakeup: true,
          vibrate: true,
          sound: true,
          priority: 2, // High priority
          importance: 4, // Android 8+ IMPORTANCE_HIGH (pops up banner)
          channel: 'ibadat_reminders_channel',
          channelName: 'ইবাদত ওয়াক্ত রিমাইন্ডার',
          channelDescription: 'ওয়াক্ত ও আমলের সময়সূচীর নোটিফিকেশন',
          lockscreenVisibility: 1
        });
      }

      window.cordova!.plugins!.notification!.local!.schedule(notifications);
      console.log(`[Cordova] Successfully scheduled ${notifications.length} alarms for ${setting.name}`);
    } catch (e) {
      console.warn("Failed scheduling Cordova notifications", e);
    }
  }

  /**
   * Test a delayed notification (e.g. 5 seconds) so user can minimize
   * the app and test outside-the-app notification on their phone.
   */
  static scheduleDelayedOutsideTest(delaySeconds = 5, onScheduled?: () => void): void {
    const triggerDate = new Date(Date.now() + delaySeconds * 1000);
    const title = '🔔 ইবাদত ট্র্যাকার টেস্ট নোটিফিকেশন';
    const text = 'আলহামদুলিল্লাহ! বাহিরের (Background & Lockscreen) নোটিফিকেশন সফলভাবে কাজ করছে।';

    if (this.isCordovaAvailable()) {
      try {
        window.cordova!.plugins!.notification!.local!.schedule({
          id: 999991,
          title,
          text,
          trigger: { at: triggerDate },
          foreground: true,
          wakeup: true,
          vibrate: true,
          sound: true,
          priority: 2,
          importance: 4,
          channel: 'ibadat_test_channel',
          channelName: 'ইবাদত টেস্ট চ্যানেল',
          channelDescription: 'টেস্টিং নোটিফিকেশন',
          lockscreenVisibility: 1
        });
      } catch (err) {
        console.warn("Cordova delayed test failed", err);
      }
    } else if (this.isWebNotificationAvailable() && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(title, {
          body: text,
          icon: './app-icon.jpg',
          badge: './app-icon.jpg'
        });
        this.playChime();
      }, delaySeconds * 1000);
    } else {
      setTimeout(() => {
        this.playChime();
      }, delaySeconds * 1000);
    }

    if (onScheduled) onScheduled();
  }

  /**
   * Cancel native Cordova notifications for an activity reminder
   */
  static cancelCordovaReminders(key: string, maxCount = 10): void {
    if (!this.isCordovaAvailable()) return;

    try {
      const ids: number[] = [];
      for (let i = 0; i < maxCount; i++) {
        ids.push(hashKeyToNumber(key, i));
      }
      window.cordova!.plugins!.notification!.local!.cancel(ids);
      console.log(`[Cordova] Cancelled alarms for ${key}`);
    } catch (e) {
      console.warn("Failed canceling Cordova notifications", e);
    }
  }

  /**
   * Reschedule all active reminders into Cordova (e.g. on app launch or deviceready)
   */
  static syncAllCordovaReminders(reminders: Record<string, ReminderSetting>): void {
    if (!this.isCordovaAvailable()) return;
    Object.values(reminders).forEach((setting) => {
      this.scheduleCordovaReminders(setting);
    });
  }

  /**
   * Periodic scheduler that runs inside the app (every 15-30 seconds).
   * Note: Only triggers in-app alert when app is foreground, and also sends sound/notification.
   */
  static checkTick(
    reminders: Record<string, ReminderSetting>,
    autoHadithEnabled: boolean,
    generalReminder: { enabled: boolean; interval: number },
    onInAppNotification: (title: string, message: string) => void
  ): void {
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);

    // Reset daily trigger cache on new day
    if (lastDayKey !== todayKey) {
      triggeredKeysToday.clear();
      lastDayKey = todayKey;
    }

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // 1. Check Specific Activity Reminders
    Object.values(reminders).forEach((r) => {
      if (!r.start) return;
      const [hStr, mStr] = r.start.split(':');
      const startHour = parseInt(hStr, 10) || 0;
      const startMin = parseInt(mStr, 10) || 0;

      for (let i = 0; i < r.count; i++) {
        const totalMinutes = startHour * 60 + startMin + i * r.interval;
        const targetHour = Math.floor(totalMinutes / 60) % 24;
        const targetMin = totalMinutes % 60;

        if (currentHour === targetHour && currentMin === targetMin) {
          const triggerKey = `${todayKey}_${r.key}_${i}`;
          if (!triggeredKeysToday.has(triggerKey)) {
            triggeredKeysToday.add(triggerKey);

            const title = `⏰ ${r.name} এর রিমাইন্ডার`;
            const msg = `এখন ${r.name}-এর ওয়াক্ত/আমল করার সময় হয়েছে (${i + 1}/${r.count} বার)। আমলটি সম্পূর্ণ করুন।`;

            this.sendNotification(title, msg);
            onInAppNotification(title, msg);
          }
        }
      }
    });

    // 2. Check Auto Hadith (every 30 mins)
    if (autoHadithEnabled) {
      const elapsedMinutes = (Date.now() - lastHadithTimestamp) / (1000 * 60);
      if (elapsedMinutes >= 30) {
        lastHadithTimestamp = Date.now();
        const quote = getRandomQuote();
        const title = `📖 প্রতিদিনের হাদীস`;
        const msg = quote;
        this.sendNotification(title, msg);
        onInAppNotification(title, msg);
      }
    }

    // 3. Check General Tauba & Zikir Reminder
    if (generalReminder.enabled && generalReminder.interval > 0) {
      const elapsedMinutes = (Date.now() - lastGeneralTimestamp) / (1000 * 60);
      if (elapsedMinutes >= generalReminder.interval) {
        lastGeneralTimestamp = Date.now();
        const title = `📿 তাওবাহ ও যিকিরের রিমাইন্ডার`;
        const msg = `আসতাগফিরুল্লাহ, সুবহানাল্লাহ, আলহামদুলিল্লাহ, লা ইলাহা ইল্লাল্লাহ পাঠ করে অন্তরকে সতেজ করুন।`;
        this.sendNotification(title, msg);
        onInAppNotification(title, msg);
      }
    }
  }
}

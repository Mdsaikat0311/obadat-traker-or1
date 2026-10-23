import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { repository } from './data/repository';
import { DuaNote, TaskStats, ChampionInfo } from './types/ibadat';
import { TabId, BottomNav } from './components/BottomNav';
import { AppHeader } from './components/AppHeader';
import { DetailsDialog } from './components/dialogs/DetailsDialog';
import { ReminderDialog } from './components/dialogs/ReminderDialog';
import { NoteDetailDialog } from './components/dialogs/NoteDetailDialog';
import { LeaderboardDialog } from './components/dialogs/LeaderboardDialog';
import { CustomAlertDialog } from './components/dialogs/CustomAlertDialog';

import { SalahScreen } from './screens/SalahScreen';
import { AmalScreen } from './screens/AmalScreen';
import { DhikrScreen } from './screens/DhikrScreen';
import { NotesScreen } from './screens/NotesScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificationService } from './services/notificationService';
import {
  auth,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  syncStateToFirebase,
  fetchUserCloudState,
  fetchUserRank,
  fetchFirebaseChampion
} from './services/firebase';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('salah');
  const [currentViewingDate, setCurrentViewingDate] = useState<string>(repository.getTodayKey());

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // State slices
  const [salahLog, setSalahLog] = useState<Record<string, boolean>>({});
  const [nawafilLog, setNawafilLog] = useState<Record<string, boolean>>({});
  const [dhikrLog, setDhikrLog] = useState<Record<string, boolean>>({});
  const [morningLog, setMorningLog] = useState<Record<string, boolean>>({});
  const [nightlyLog, setNightlyLog] = useState<Record<string, boolean>>({});
  const [quranLog, setQuranLog] = useState<Record<string, boolean>>({});
  const [specialAmalLog, setSpecialAmalLog] = useState<Record<string, boolean>>({});

  const [appStats, setAppStats] = useState(repository.getAppStats(currentViewingDate));
  const [yesterdayChampion, setYesterdayChampion] = useState<ChampionInfo | null>(repository.getYesterdayChampion());
  const [duaNotes, setDuaNotes] = useState<DuaNote[]>(repository.getDuaNotes());
  const [reminders, setReminders] = useState(repository.getReminders());
  const [userName, setUserName] = useState<string>(repository.getUserName());
  const [autoHadithEnabled, setAutoHadithEnabled] = useState<boolean>(repository.isAutoHadithEnabled());
  const [generalReminder, setGeneralReminder] = useState(repository.getGeneralReminder());
  const [lifetimeStartDate, setLifetimeStartDate] = useState<string>(repository.getLifetimeStartDate());

  // Live Firebase User Ranks cache
  const [userRanks, setUserRanks] = useState<Record<string, number>>({});

  // Modals
  const [detailsModal, setDetailsModal] = useState<{ title: string; content: string } | null>(null);
  const [reminderModal, setReminderModal] = useState<{ key: string; name: string } | null>(null);
  const [noteModal, setNoteModal] = useState<DuaNote | null>(null);
  const [leaderboardModal, setLeaderboardModal] = useState<{ metric: string; title: string } | null>(null);
  const [alertState, setAlertState] = useState<{ msg: string; isSuccess: boolean } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);

  const showAlert = useCallback((message: string, isSuccess: boolean) => {
    setAlertState({ msg: message, isSuccess });
  }, []);

  const refreshAll = useCallback(() => {
    setSalahLog(repository.getLog("salah", currentViewingDate));
    setNawafilLog(repository.getLog("nawafil", currentViewingDate));
    setDhikrLog(repository.getLog("dhikr", currentViewingDate));
    setMorningLog(repository.getLog("morning", currentViewingDate));
    setNightlyLog(repository.getLog("nightly", currentViewingDate));
    setQuranLog(repository.getLog("quran", currentViewingDate));
    setSpecialAmalLog(repository.getLog("specialAmal", currentViewingDate));

    const updatedStats = repository.getAppStats(currentViewingDate);
    setAppStats(updatedStats);
    setDuaNotes(repository.getDuaNotes());
    setReminders(repository.getReminders());
    setUserName(repository.getUserName());
    setAutoHadithEnabled(repository.isAutoHadithEnabled());
    setGeneralReminder(repository.getGeneralReminder());
    setLifetimeStartDate(repository.getLifetimeStartDate());
  }, [currentViewingDate]);

  // Sync to Firebase Realtime Database
  const saveToFirebaseCloud = useCallback(async (dateKey = currentViewingDate) => {
    if (!auth.currentUser) return;
    try {
      const points = repository.calculatePoints(dateKey);
      const stats = repository.getAppStats(dateKey);
      await syncStateToFirebase(dateKey, points, stats, repository.getFullState());
    } catch (err) {
      console.warn("Failed saving state to Firebase:", err);
    }
  }, [currentViewingDate]);

  // Auth State Listener & Cloud Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch cloud state from Firebase Realtime Database
        const cloudState = await fetchUserCloudState(user.uid);
        if (cloudState) {
          repository.loadFromCloudState(cloudState);
        }

        const displayName = user.displayName || 'ব্যবহারকারী';
        repository.setUserName(displayName);
        repository.setCurrentUser({
          id: user.uid,
          name: displayName,
          email: user.email || ''
        });

        refreshAll();

        // Immediately update stats in Firebase Realtime DB
        const pts = repository.calculatePoints(currentViewingDate);
        const stats = repository.getAppStats(currentViewingDate);
        await syncStateToFirebase(currentViewingDate, pts, stats, repository.getFullState());
      }
    });

    return () => unsubscribeAuth();
  }, [currentViewingDate, refreshAll]);

  // Fetch Firebase Champion and Ranks
  const refreshFirebaseMetrics = useCallback(async () => {
    // 1. Champion
    try {
      const champ = await fetchFirebaseChampion();
      if (champ && champ.points > 0) {
        setYesterdayChampion(champ);
      } else {
        setYesterdayChampion(repository.getYesterdayChampion());
      }
    } catch {
      setYesterdayChampion(repository.getYesterdayChampion());
    }

    // 2. Ranks for logged-in user
    if (auth.currentUser) {
      const metrics = [
        'todayPoints',
        'yesterdayPoints',
        'totalPoints7Days',
        'totalPoints30Days',
        'totalPoints',
        'highScore30Days'
      ];
      const ranksObj: Record<string, number> = {};
      await Promise.all(
        metrics.map(async (m) => {
          const r = await fetchUserRank(m);
          if (r !== null) {
            ranksObj[m] = r;
          }
        })
      );
      setUserRanks(ranksObj);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    refreshFirebaseMetrics();
    NotificationService.syncAllCordovaReminders(repository.getReminders());

    const unsubscribe = NotificationService.onDeviceReady(() => {
      console.log('App: Cordova device is ready! Resyncing all reminders to Android AlarmManager...');
      NotificationService.syncAllCordovaReminders(repository.getReminders());
    });

    return () => unsubscribe();
  }, [refreshAll, refreshFirebaseMetrics]);

  // Periodic reminder checking interval (every 15s) for in-app and browser notifications
  useEffect(() => {
    const timer = setInterval(() => {
      NotificationService.checkTick(
        reminders,
        autoHadithEnabled,
        generalReminder,
        (title, message) => {
          showAlert(`${title}\n${message}`, true);
        }
      );
    }, 15000);

    return () => clearInterval(timer);
  }, [reminders, autoHadithEnabled, generalReminder, showAlert]);

  const isViewingToday = currentViewingDate === repository.getTodayKey();

  const handleSelectDate = (dateKey: string) => {
    const today = repository.getTodayKey();
    if (dateKey > today) {
      showAlert("আগামীকাল বা ভবিষ্যতের ডেটা আপডেট করা সম্ভব নয়।", false);
      return;
    }
    setCurrentViewingDate(dateKey);
  };

  const handleMoveDate = (offset: number) => {
    const d = new Date(currentViewingDate);
    d.setDate(d.getDate() + offset);
    const target = repository.formatIsoDate(d);
    const today = repository.getTodayKey();
    if (target > today) {
      showAlert("আগামীকালের ডেটা দেখা বা আপডেট করা সম্ভব নয়।", false);
      return;
    }
    setCurrentViewingDate(target);
  };

  const handleGoToToday = () => {
    setCurrentViewingDate(repository.getTodayKey());
  };

  const handleToggleSalah = (key: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask("salah", currentViewingDate, key);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleToggleNawafil = (key: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask("nawafil", currentViewingDate, key);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleToggleDhikr = (key: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask("dhikr", currentViewingDate, key);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleToggleRoutineTask = (category: string, taskKey: string) => {
    if (currentViewingDate > repository.getTodayKey()) return;
    repository.toggleTask(category, currentViewingDate, taskKey);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleGetTaskStats = (category: string, taskKey: string): TaskStats => {
    return repository.getTaskCompletionStats(category, taskKey);
  };

  const handleSaveReminder = (key: string, name: string, start: string, count: number, interval: number) => {
    const setting = { key, name, start, count, interval };
    repository.saveReminder(setting);
    NotificationService.scheduleCordovaReminders(setting);
    setReminderModal(null);
    refreshAll();
    saveToFirebaseCloud();
    showAlert(`${name}-এর রিমাইন্ডার সেট হয়েছে (${start} থেকে শুরু)!`, true);
  };

  const handleDeleteReminder = (key: string, name: string) => {
    repository.deleteReminder(key);
    NotificationService.cancelCordovaReminders(key);
    setReminderModal(null);
    refreshAll();
    saveToFirebaseCloud();
    showAlert(`${name}-এর রিমাইন্ডার বন্ধ করা হয়েছে।`, true);
  };

  const handleAddNote = (title: string, text: string) => {
    if (!text.trim()) return;
    repository.addDuaNote(title, text);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleDeleteNote = (id: string) => {
    repository.deleteDuaNote(id);
    setNoteModal(null);
    refreshAll();
    saveToFirebaseCloud();
  };

  const handleSetUserName = (name: string) => {
    if (name.trim()) {
      repository.setUserName(name.trim());
      refreshAll();
      saveToFirebaseCloud();
      showAlert("নাম পরিবর্তন করা হয়েছে!", true);
    }
  };

  const handleToggleAutoHadith = async () => {
    const next = !autoHadithEnabled;
    if (next) {
      await NotificationService.requestPermission();
      NotificationService.sendNotification("হাদিস রিমাইন্ডার চালু", "প্রতি ৩০ মিনিট পর পর হাদিস নোটিফিকেশন আসবে।");
    }
    repository.setAutoHadithEnabled(next);
    setAutoHadithEnabled(next);
    saveToFirebaseCloud();
    if (next) {
      showAlert("চালু হয়েছে! প্রতি ৩০ মিনিট পর পর হাদিস আসবে।", true);
    } else {
      showAlert("অটোমেটিক হাদিস রিমাইন্ডার বন্ধ করা হয়েছে।", false);
    }
  };

  const handleToggleGeneralReminder = async () => {
    const next = { ...generalReminder, enabled: !generalReminder.enabled };
    if (next.enabled) {
      await NotificationService.requestPermission();
      NotificationService.sendNotification("তাওবাহ ও যিকির রিমাইন্ডার চালু", `প্রতি ${next.interval} মিনিট পর পর যিকিরের স্মরণ করিয়ে দেওয়া হবে।`);
    }
    repository.setGeneralReminder(next);
    setGeneralReminder(next);
    saveToFirebaseCloud();
    if (next.enabled) {
      showAlert(`চালু হয়েছে! প্রতি ${next.interval} মিনিট পর পর রিমাইন্ডার আসবে।`, true);
    } else {
      showAlert("সাধারণ রিমাইন্ডার বন্ধ করা হয়েছে।", false);
    }
  };

  const handleSetGeneralInterval = (interval: number) => {
    const next = { ...generalReminder, interval };
    repository.setGeneralReminder(next);
    setGeneralReminder(next);
    saveToFirebaseCloud();
    showAlert(`সময় পরিবর্তন হয়েছে: ${interval} মিনিট পর পর।`, true);
  };

  const handleSetLifetimeStartDate = (dateStr: string) => {
    const today = repository.getTodayKey();
    if (dateStr > today) {
      showAlert("ভবিষ্যতের কোনো তারিখ নির্বাচন করা যাবে না।", false);
      return;
    }
    repository.setLifetimeStartDate(dateStr);
    refreshAll();
    saveToFirebaseCloud();
    showAlert(`লাইফটাইম পয়েন্ট কাউন্ট শুরু ${dateStr} তারিখ থেকে সেট করা হয়েছে।`, true);
  };

  // Auth Handlers for Settings
  const handleLogin = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    setCurrentUser(user);

    // Fetch cloud state from Firebase Realtime Database
    const cloudState = await fetchUserCloudState(user.uid);
    if (cloudState) {
      repository.loadFromCloudState(cloudState);
    }
    const displayName = user.displayName || 'ব্যবহারকারী';
    repository.setUserName(displayName);
    repository.setCurrentUser({
      id: user.uid,
      name: displayName,
      email: user.email || ''
    });

    refreshAll();
    await saveToFirebaseCloud();
    refreshFirebaseMetrics();
    showAlert("লগইন সফল হয়েছে!", true);
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    setCurrentUser(user);
    repository.setUserName(name);
    repository.setCurrentUser({
      id: user.uid,
      name,
      email
    });

    refreshAll();
    await saveToFirebaseCloud();
    refreshFirebaseMetrics();
    showAlert("রেজিস্ট্রেশন সফল হয়েছে!", true);
    setActiveTab('reports');
  };

  const handleLogout = async () => {
    await signOut(auth);
    repository.resetAllData();
    setCurrentUser(null);
    setCurrentViewingDate(repository.getTodayKey());
    refreshAll();
    setUserRanks({});
    showAlert("লগ আউট সফলভাবে সম্পন্ন হয়েছে।", true);
  };

  const handleConfirmReset = () => {
    setShowResetDialog(false);
    repository.resetAllData();
    setCurrentViewingDate(repository.getTodayKey());
    refreshAll();
    saveToFirebaseCloud();
  };

  // User Rank resolver (uses live Firebase rank if available, else local)
  const getMyRank = (metric: string): number => {
    if (!currentUser) return 0;
    if (userRanks[metric]) {
      return userRanks[metric];
    }
    const list = repository.getLeaderboard(metric);
    return list.find((u) => u.isCurrentUser)?.rank || 1;
  };

  // Header display calculations
  const headerInfo = useMemo(() => {
    switch (activeTab) {
      case 'salah': {
        const fardKeys = ["fajr", "zuhr", "asr", "maghrib", "isha"];
        const todaySalah = repository.getLog("salah", repository.getTodayKey());
        const fardCompleted = fardKeys.filter((k) => todaySalah[k]).length;
        return {
          title: "সালাত ও তাহাজ্জুদ",
          subtitle: `${fardCompleted}/৫ ফরয সম্পন্ন`
        };
      }
      case 'quran':
        return {
          title: "দৈনিক আমল ও কুরআন",
          subtitle: `আজকের পয়েন্ট: ${appStats.todayPoints}`
        };
      case 'dhikr': {
        const todayDhikr = repository.getLog("dhikr", repository.getTodayKey());
        const dhikrCompleted = Object.values(todayDhikr).filter(Boolean).length;
        return {
          title: "যিকির চেকলিস্ট",
          subtitle: `${dhikrCompleted}/৮ সম্পন্ন`
        };
      }
      case 'duaNotes':
        return {
          title: "গুরুত্বপূর্ণ দু’আ/নোট",
          subtitle: `${duaNotes.length} টি নোট`
        };
      case 'reports':
        return {
          title: "সারাংশ ও ইতিহাস",
          subtitle: `মোট লাইফটাইম পয়েন্ট: ${appStats.totalLifetimePoints}`
        };
      case 'settings':
        return {
          title: currentUser ? "আমার প্রোফাইল" : "সেটিংস ও তথ্য",
          subtitle: currentUser ? "অ্যাকাউন্ট ও সেটিংস" : "সাইন ইন / রেজিস্ট্রেশন"
        };
      default:
        return {
          title: "ইবাদত ট্র্যাকার",
          subtitle: `আজকের পয়েন্ট: ${appStats.todayPoints}`
        };
    }
  }, [activeTab, duaNotes.length, appStats.todayPoints, appStats.totalLifetimePoints, currentUser]);

  const dateDisplayStr = useMemo(() => {
    if (isViewingToday) return "আজকের দিন";
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(currentViewingDate));
    } catch {
      return currentViewingDate;
    }
  }, [isViewingToday, currentViewingDate]);

  return (
    <div className="main-container">
      {/* Header */}
      <AppHeader
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        dateDisplay={dateDisplayStr}
        isViewingToday={isViewingToday}
        onGoToToday={handleGoToToday}
      />

      {/* Main Content */}
      <main id="app-main-content" className="flex-grow p-4 space-y-6 overflow-y-auto pb-24">
        {activeTab === 'salah' && (
          <SalahScreen
            appStats={appStats}
            yesterdayChampion={yesterdayChampion}
            salahLog={salahLog}
            nawafilLog={nawafilLog}
            reminders={reminders}
            isViewingToday={isViewingToday}
            onToggleSalah={handleToggleSalah}
            onToggleNawafil={handleToggleNawafil}
            onOpenDetails={(title, content) => setDetailsModal({ title, content })}
            onOpenReminder={(key, name) => setReminderModal({ key, name })}
            onOpenLeaderboard={(metric, title) => setLeaderboardModal({ metric, title })}
            getMyRank={getMyRank}
            getTaskStats={handleGetTaskStats}
          />
        )}

        {activeTab === 'quran' && (
          <AmalScreen
            appStats={appStats}
            specialAmalLog={specialAmalLog}
            morningLog={morningLog}
            nightlyLog={nightlyLog}
            quranLog={quranLog}
            reminders={reminders}
            onToggleRoutineTask={handleToggleRoutineTask}
            onOpenDetails={(title, content) => setDetailsModal({ title, content })}
            onOpenReminder={(key, name) => setReminderModal({ key, name })}
            getTaskStats={handleGetTaskStats}
          />
        )}

        {activeTab === 'dhikr' && (
          <DhikrScreen
            dhikrLog={dhikrLog}
            reminders={reminders}
            onToggleDhikr={handleToggleDhikr}
            onOpenDetails={(title, content) => setDetailsModal({ title, content })}
            onOpenReminder={(key, name) => setReminderModal({ key, name })}
            getTaskStats={handleGetTaskStats}
          />
        )}

        {activeTab === 'duaNotes' && (
          <NotesScreen
            duaNotes={duaNotes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onOpenNoteDetail={(note) => setNoteModal(note)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsScreen
            currentViewingDate={currentViewingDate}
            onSelectDate={handleSelectDate}
            onMoveDate={handleMoveDate}
            onOpenLeaderboard={(metric, title) => setLeaderboardModal({ metric, title })}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            currentUser={currentUser}
            userName={userName}
            appStats={appStats}
            autoHadithEnabled={autoHadithEnabled}
            generalReminder={generalReminder}
            lifetimeStartDate={lifetimeStartDate}
            isViewingToday={isViewingToday}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            onSetUserName={handleSetUserName}
            onToggleAutoHadith={handleToggleAutoHadith}
            onToggleGeneralReminder={handleToggleGeneralReminder}
            onSetGeneralInterval={handleSetGeneralInterval}
            onSetLifetimeStartDate={handleSetLifetimeStartDate}
            onRequestReset={() => setShowResetDialog(true)}
            onOpenLeaderboard={(metric, title) => setLeaderboardModal({ metric, title })}
            getMyRank={getMyRank}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals & Dialogs */}
      {detailsModal && (
        <DetailsDialog
          title={detailsModal.title}
          content={detailsModal.content}
          onDismiss={() => setDetailsModal(null)}
        />
      )}

      {reminderModal && (
        <ReminderDialog
          activityKey={reminderModal.key}
          activityName={reminderModal.name}
          initialSetting={reminders[reminderModal.key]}
          onSave={handleSaveReminder}
          onDelete={handleDeleteReminder}
          onDismiss={() => setReminderModal(null)}
        />
      )}

      {noteModal && (
        <NoteDetailDialog
          note={noteModal}
          onDelete={handleDeleteNote}
          onDismiss={() => setNoteModal(null)}
        />
      )}

      {leaderboardModal && (
        <LeaderboardDialog
          initialTitle={leaderboardModal.title}
          initialMetric={leaderboardModal.metric}
          onDismiss={() => setLeaderboardModal(null)}
        />
      )}

      {alertState && (
        <CustomAlertDialog
          title={alertState.isSuccess ? "সফল!" : "সতর্কতা!"}
          message={alertState.msg}
          isSuccess={alertState.isSuccess}
          onDismiss={() => setAlertState(null)}
        />
      )}

      {showResetDialog && (
        <CustomAlertDialog
          title="ডেটা মুছে ফেলা হবে!"
          message="আপনি কি নিশ্চিত যে আপনি সমস্ত অ্যাপ্লিকেশন ডেটা মুছে ফেলতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।"
          isSuccess={false}
          isConfirm={true}
          onConfirm={handleConfirmReset}
          onDismiss={() => setShowResetDialog(false)}
        />
      )}
    </div>
  );
};

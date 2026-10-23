import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  get,
  child,
  update
} from 'firebase/database';
import { LeaderboardUser } from '../types/ibadat';

// Configuration from user's original application
const firebaseConfig = {
  apiKey: "AIzaSyCzQNwGR6NzTgxFEKzxyRmOVJfi83P4dcA",
  authDomain: "ibadat-traker.firebaseapp.com",
  databaseURL: "https://ibadat-traker-default-rtdb.firebaseio.com",
  projectId: "ibadat-traker",
  storageBucket: "ibadat-traker.firebasestorage.app",
  messagingSenderId: "288524999382",
  appId: "1:288524999382:web:4ec05edfaeb691dda9c777",
  measurementId: "G-HKC4BTQZPS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);

// Helper for formatted date key YYYY-MM-DD
export function getDateKey(dateObj: Date): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPointsForDate(history: Record<string, number> | undefined, dateObj: Date): number {
  if (!history) return 0;
  const key = getDateKey(dateObj);
  return Number(history[key]) || 0;
}

export function getPointsForPastDays(history: Record<string, number> | undefined, days: number): number {
  if (!history) return 0;
  let total = 0;
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    total += getPointsForDate(history, d);
  }
  return total;
}

export function getTotalHistoryPoints(history: Record<string, number> | undefined): number {
  if (!history) return 0;
  let total = 0;
  Object.values(history).forEach((p) => {
    total += parseInt(String(p), 10) || 0;
  });
  return total;
}

/**
 * Fetch top users by metric from Firebase Realtime Database
 */
export async function getTopUsersByMetric(
  metricType: string,
  limit = 20
): Promise<LeaderboardUser[]> {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) return [];

    const processedUsers: Array<{ id: string; name: string; points: number }> = [];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    snapshot.forEach((childSnap) => {
      const data = childSnap.val();
      if (!data) return;
      const history = data.pointsHistory || {};
      const stats = data.stats || {};
      let score = 0;

      if (metricType === 'todayPoints') {
        score = getPointsForDate(history, today);
      } else if (metricType === 'yesterdayPoints') {
        score = getPointsForDate(history, yesterday);
      } else if (metricType === 'totalPoints7Days') {
        score = getPointsForPastDays(history, 7);
      } else if (metricType === 'totalPoints30Days') {
        score = getPointsForPastDays(history, 30);
      } else if (metricType === 'totalPoints') {
        score = getTotalHistoryPoints(history);
      } else if (metricType === 'highScore30Days') {
        score = stats.highScore30Days || 0;
      }

      processedUsers.push({
        id: childSnap.key || '',
        name: data.name || 'বেনামী',
        points: score
      });
    });

    processedUsers.sort((a, b) => b.points - a.points);

    const currentUid = auth.currentUser ? auth.currentUser.uid : null;
    const finalLimit = limit === 0 ? processedUsers.length : limit;
    const sliced = processedUsers.slice(0, finalLimit);

    return sliced.map((u, idx) => ({
      id: u.id,
      name: u.name,
      points: u.points,
      rank: idx + 1,
      isCurrentUser: currentUid === u.id
    }));
  } catch (error) {
    console.warn("Error calculating leaderboard from Firebase:", error);
    return [];
  }
}

/**
 * Fetch rank of current user from Firebase Realtime Database
 */
export async function fetchUserRank(statKey: string): Promise<number | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const sorted = await getTopUsersByMetric(statKey, 0);
    const myIndex = sorted.findIndex((u) => u.id === user.uid);
    if (myIndex !== -1) {
      return myIndex + 1;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch yesterday champion from Firebase
 */
export async function fetchFirebaseChampion(): Promise<{ name: string; points: number } | null> {
  try {
    const champions = await getTopUsersByMetric('yesterdayPoints', 1);
    if (champions.length > 0 && champions[0].points > 0) {
      return {
        name: champions[0].name,
        points: champions[0].points
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Push local state to Firebase Realtime Database
 */
export async function syncStateToFirebase(
  activeDateKey: string,
  points: number,
  stats: any,
  fullState: any
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const uid = user.uid;
    const dateObj = new Date(activeDateKey);
    const formattedDate = getDateKey(dateObj);

    const updates: Record<string, any> = {};
    updates[`users/${uid}/pointsHistory/${formattedDate}`] = points;
    updates[`users/${uid}/name`] = user.displayName || fullState.currentUser?.name || 'ব্যবহারকারী';
    updates[`users/${uid}/fullState`] = JSON.stringify(fullState);
    updates[`users/${uid}/stats`] = stats;

    await update(ref(db), updates);
  } catch (err) {
    console.warn("Firebase update failed:", err);
  }
}

/**
 * Pull fullState from Firebase on user login
 */
export async function fetchUserCloudState(uid: string): Promise<any | null> {
  try {
    const snapshot = await get(child(ref(db), `users/${uid}`));
    if (snapshot.exists()) {
      const val = snapshot.val();
      if (val.fullState) {
        try {
          return JSON.parse(val.fullState);
        } catch {
          return null;
        }
      }
    }
    return null;
  } catch (e) {
    console.warn("Failed to fetch cloud state:", e);
    return null;
  }
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
};
export type { User };

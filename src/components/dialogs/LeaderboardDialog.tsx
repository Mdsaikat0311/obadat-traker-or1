import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { repository } from '../../data/repository';
import { getTopUsersByMetric } from '../../services/firebase';
import { LeaderboardUser } from '../../types/ibadat';

interface LeaderboardDialogProps {
  initialTitle?: string;
  initialMetric?: string;
  onDismiss: () => void;
}

export const LeaderboardDialog: React.FC<LeaderboardDialogProps> = ({
  initialTitle = 'লিডারবোর্ড (সেরা ২০)',
  initialMetric = 'todayPoints',
  onDismiss
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(initialMetric);
  const [title, setTitle] = useState<string>(initialTitle);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getTopUsersByMetric(selectedMetric, 20)
      .then((firebaseUsers) => {
        if (!mounted) return;
        if (firebaseUsers && firebaseUsers.length > 0) {
          setUsers(firebaseUsers);
        } else {
          setUsers(repository.getLeaderboard(selectedMetric));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setUsers(repository.getLeaderboard(selectedMetric));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedMetric]);

  const handleTabChange = (metric: string, tabTitle: string) => {
    setSelectedMetric(metric);
    setTitle(tabTitle);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-teal-50 rounded-t-xl">
          <h3 className="text-lg font-bold text-teal-800">{title}</h3>
          <button
            type="button"
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-2 bg-gray-50 flex justify-center gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTabChange('todayPoints', 'আজকের সেরা')}
            className={`px-3 py-1 text-xs font-bold rounded border shadow-xs transition cursor-pointer ${
              selectedMetric === 'todayPoints'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white hover:bg-teal-50 text-teal-700 border-gray-200'
            }`}
          >
            আজকের সেরা
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('totalPoints', 'সর্বমোট সেরা')}
            className={`px-3 py-1 text-xs font-bold rounded border shadow-xs transition cursor-pointer ${
              selectedMetric === 'totalPoints'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white hover:bg-teal-50 text-indigo-700 border-gray-200'
            }`}
          >
            সর্বমোট সেরা
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-grow bg-gray-50 min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-xs">লিডারবোর্ড লোড হচ্ছে...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            users.map((u) => {
              const isMe = u.isCurrentUser;
              const rank = u.rank;

              const rowClass = isMe
                ? 'bg-teal-100 border-teal-500 ring-1 ring-teal-500 shadow-md z-10'
                : 'bg-white border-gray-200';

              const rankBadgeColor =
                rank === 1
                  ? 'bg-yellow-400 text-white'
                  : rank === 2
                  ? 'bg-gray-300 text-gray-700'
                  : rank === 3
                  ? 'bg-orange-300 text-white'
                  : 'bg-gray-100 text-gray-600';

              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${rowClass} transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${rankBadgeColor} flex items-center justify-center font-bold text-sm shadow-xs`}
                    >
                      {rank === 1 ? '👑' : rank}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm flex items-center">
                        <span>{u.name}</span>
                        {isMe && (
                          <span className="ml-2 text-[10px] bg-teal-600 text-white px-1.5 rounded-sm font-semibold">
                            আমি
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-teal-700 text-sm bg-teal-50 px-2 py-1 rounded-sm">
                    {u.points} <span className="text-xs font-normal text-gray-500">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Crown, Medal } from 'lucide-react';

interface RankBadgeProps {
  rank?: number | null;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  if (!rank || rank <= 0) return null;

  const commonClasses = "flex items-center justify-center gap-1 px-2 py-0.5 rounded-full shadow-xs border backdrop-blur-xs transition-transform hover:scale-105 cursor-default";

  if (rank === 1) {
    return (
      <div className={`${commonClasses} bg-yellow-50 border-yellow-400`} title="দেশসেরা (১ম)">
        <Crown className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
        <span className="text-xs font-bold text-yellow-700">#1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className={`${commonClasses} bg-gray-50 border-gray-400`} title="২য় স্থান">
        <Medal className="w-3.5 h-3.5 text-gray-500 fill-gray-300" />
        <span className="text-xs font-bold text-gray-600">#2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className={`${commonClasses} bg-orange-50 border-orange-400`} title="৩য় স্থান">
        <Medal className="w-3.5 h-3.5 text-orange-600 fill-orange-200" />
        <span className="text-xs font-bold text-orange-700">#3</span>
      </div>
    );
  }
  return (
    <div className={`${commonClasses} bg-white/90 border-teal-200`}>
      <span className="text-xs font-bold text-teal-700">#{rank}</span>
    </div>
  );
};

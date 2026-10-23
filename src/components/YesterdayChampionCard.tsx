import React from 'react';
import { Trophy } from 'lucide-react';
import { ChampionInfo } from '../types/ibadat';

interface YesterdayChampionCardProps {
  champion: ChampionInfo;
  onClick: () => Unit;
}
type Unit = void;

export const YesterdayChampionCard: React.FC<YesterdayChampionCardProps> = ({ champion, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-amber-50/80 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/70 transition-all shadow-xs"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <Trophy className="w-5 h-5 fill-amber-500 text-amber-600" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-amber-700 leading-tight">
            গতকালকের সেরা
          </div>
          <div className="text-sm font-bold text-slate-800 leading-tight">
            {champion.name}
          </div>
        </div>
      </div>
      <div className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs">
        {champion.points} pts
      </div>
    </div>
  );
};

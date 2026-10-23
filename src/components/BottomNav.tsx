import React from 'react';
import { Home, BookOpen, Zap, StickyNote, BarChart2, Settings } from 'lucide-react';

export type TabId = 'salah' | 'quran' | 'dhikr' | 'duaNotes' | 'reports' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'salah', label: 'সালাত', icon: Home },
  { id: 'quran', label: 'আমল', icon: BookOpen },
  { id: 'dhikr', label: 'যিকির', icon: Zap },
  { id: 'duaNotes', label: 'নোট', icon: StickyNote },
  { id: 'reports', label: 'রিপোর্ট', icon: BarChart2 },
  { id: 'settings', label: 'সেটিংস', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t border-gray-200 shadow-lg z-40">
      <div id="nav-bar" className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item flex flex-col items-center pt-1 cursor-pointer transition duration-150 flex-1 ${
                isActive ? 'nav-active' : ''
              }`}
            >
              <div className="nav-pill">
                <Icon className="nav-icon" />
              </div>
              <div className="nav-item-label">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

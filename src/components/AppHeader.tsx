import React from 'react';

interface AppHeaderProps {
  title: string;
  subtitle: string;
  dateDisplay: string;
  isViewingToday: boolean;
  onGoToToday: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  dateDisplay,
  isViewingToday,
  onGoToToday
}) => {
  return (
    <header className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-xs">
      <h1 className="text-2xl font-extrabold text-gray-900">
        {title}
      </h1>
      <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
        <div className="flex items-center">
          <span>{dateDisplay}</span>
          {!isViewingToday && (
            <button
              type="button"
              onClick={onGoToToday}
              className="ml-2 px-2 py-1 bg-teal-900 text-white text-xs font-bold rounded-md hover:bg-teal-800 transition cursor-pointer"
            >
              Go to Today
            </button>
          )}
        </div>
        <span className="text-sm font-medium text-teal-600">
          {subtitle}
        </span>
      </div>
    </header>
  );
};

import React from 'react';
import { X } from 'lucide-react';

interface DetailsDialogProps {
  title: string;
  content: string;
  onDismiss: () => void;
}

export const DetailsDialog: React.FC<DetailsDialogProps> = ({ title, content, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 border-b border-slate-100">
          <h2 className="text-base font-bold text-teal-900 truncate">
            {title}
          </h2>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-3 bg-slate-50/50 border-t border-slate-100">
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

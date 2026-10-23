import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { DuaNote } from '../../types/ibadat';

interface NoteDetailDialogProps {
  note: DuaNote;
  onDelete: (id: string) => void;
  onDismiss: () => void;
}

export const NoteDetailDialog: React.FC<NoteDetailDialogProps> = ({ note, onDelete, onDismiss }) => {
  const isAutoNote = note.isAuto || note.id.startsWith('auto_');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            {note.title || note.date}
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-grow">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {note.text}
          </p>
        </div>

        {!isAutoNote && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center px-3 py-1 rounded-sm border border-red-200 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              <span>মুছে ফেলুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

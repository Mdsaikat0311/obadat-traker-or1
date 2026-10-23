import React, { useState } from 'react';
import { BookOpen, NotebookText, Trash2, Lock } from 'lucide-react';
import { DuaNote } from '../types/ibadat';

interface NotesScreenProps {
  duaNotes: DuaNote[];
  onAddNote: (title: string, text: string) => void;
  onDeleteNote: (id: string) => void;
  onOpenNoteDetail: (note: DuaNote) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({
  duaNotes,
  onAddNote,
  onDeleteNote,
  onOpenNoteDetail
}) => {
  const [titleInput, setTitleInput] = useState('');
  const [textInput, setTextInput] = useState('');

  const manualNotes = duaNotes.filter((n) => !n.isAuto && !n.id.startsWith('auto_'));
  const autoNotes = duaNotes.filter((n) => n.isAuto || n.id.startsWith('auto_'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onAddNote(titleInput, textInput);
    setTitleInput('');
    setTextInput('');
  };

  const renderNoteCard = (note: DuaNote) => {
    const isAutoNote = note.isAuto || note.id.startsWith('auto_');

    return (
      <div
        key={note.id}
        onClick={() => onOpenNoteDetail(note)}
        className="w-full h-72 rounded-xl shadow-lg flex flex-col cursor-pointer hover:shadow-xl transition border border-teal-200 p-5 bg-[#f2f7fc]"
      >
        <div className="flex justify-between items-start mb-3 border-b border-teal-100 pb-2">
          <span
            className="font-bold text-[#323232] text-[17.5px] truncate pr-2"
          >
            {isAutoNote ? 'স্বয়ংক্রিয় নোট' : (note.title || note.date)}
          </span>

          {isAutoNote ? (
            <span title="মুছে ফেলা যাবে না">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              className="shrink-0 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition cursor-pointer"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <p
          className="text-[#323232CC] overflow-hidden flex-grow leading-snug text-sm whitespace-pre-wrap"
        >
          {note.text}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* New Note Form */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 focus-within:shadow-md">
        <h2 className="text-sm font-bold text-gray-600 mb-2">নতুন নোট লিখুন</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="new-note-head-input"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="w-full p-2 mb-2 border border-gray-100 rounded-md bg-gray-50 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden text-sm text-gray-800 placeholder-gray-400"
            placeholder="হেড/শিরোনাম (ঐচ্ছিক)"
          />
          <textarea
            id="new-note-input"
            rows={2}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full p-2 border border-gray-100 rounded-md bg-gray-50 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden text-sm text-gray-800 placeholder-gray-400 resize-none"
            placeholder="এখানে লিখুন..."
          />
          <div className="flex justify-end mt-2 border-t border-gray-100 pt-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-600 text-white text-xs rounded-md hover:bg-teal-700 transition font-medium shadow-xs cursor-pointer"
            >
              সেভ করুন
            </button>
          </div>
        </form>
      </div>

      {/* Manual Notes */}
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center pt-2">
        <NotebookText className="w-4 h-4 mr-2 text-teal-600" />
        <span>আমার নোটস ({manualNotes.length})</span>
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {manualNotes.length === 0 ? (
          <div className="p-4 bg-white border border-gray-200 rounded-xl text-center text-xs text-gray-500">
            এখনও কোনো নোট যোগ করা হয়নি। উপরের বক্সে লিখে সেভ করুন।
          </div>
        ) : (
          manualNotes.map(renderNoteCard)
        )}
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-300 my-6" />

      {/* Library Notes */}
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
        <span>স্বয়ংক্রিয় লাইব্রেরি নোটস ({autoNotes.length})</span>
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {autoNotes.map(renderNoteCard)}
      </div>
    </div>
  );
};

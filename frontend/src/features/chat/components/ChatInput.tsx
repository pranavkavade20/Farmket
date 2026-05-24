import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Mic, X, Send, Image, FileText } from 'lucide-react';

const EMOJIS = ['👍','❤️','😂','😮','😢','🙏','🔥','👏','😍','🌾','🥦','🍅'];

interface Props {
  onSend: (text: string) => void;
  onSendFile: (file: File, type: 'image'|'video'|'audio'|'document') => void;
  disabled?: boolean;
  sending?: boolean;
  replyTo?: { id: number; content: string; sender_name: string } | null;
  onCancelReply?: () => void;
}

export const ChatInput: React.FC<Props> = ({
  onSend, onSendFile, disabled, sending, replyTo, onCancelReply
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textRef.current?.focus(); }, [replyTo]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const t = text.trim();
    if (!t || sending || disabled) return;
    onSend(t);
    setText('');
    setShowEmoji(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mime = file.type;
    let type: 'image'|'video'|'audio'|'document' = 'document';
    if (mime.startsWith('image/')) type = 'image';
    else if (mime.startsWith('video/')) type = 'video';
    else if (mime.startsWith('audio/')) type = 'audio';
    onSendFile(file, type);
    e.target.value = '';
  };

  return (
    <div className="relative">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 border-l-4 border-green-500 pl-2">
            <p className="text-[10px] font-semibold text-green-600">{replyTo.sender_name}</p>
            <p className="text-xs text-gray-500 truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute bottom-full mb-2 left-4 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 flex flex-wrap gap-2 w-60 border border-gray-200 dark:border-gray-700">
          {EMOJIS.map(e => (
            <button
              key={e}
              className="text-xl hover:scale-125 transition-transform"
              onClick={() => { setText(t => t + e); setShowEmoji(false); textRef.current?.focus(); }}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmoji(v => !v)}
          className="p-2 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Attach file */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleFile}
        />

        {/* Text area */}
        <textarea
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 resize-none rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white max-h-32 overflow-y-auto"
          style={{ minHeight: 42 }}
          disabled={disabled}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || sending || disabled}
          className="p-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-all shadow-md disabled:shadow-none"
        >
          {sending ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

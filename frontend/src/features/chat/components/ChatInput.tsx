import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Smile, Paperclip, X, Send, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_CATEGORIES = [
  {
    name: 'Harvest & Farm',
    emojis: ['🌾', '🥦', '🍅', '🥕', '🌽', '🍎', '🚜', '🌱', '🥔', '🧅', '🥬', '🧺'],
  },
  {
    name: 'Reactions & Gestures',
    emojis: ['👍', '❤️', '😊', '🙏', '🔥', '👏', '🤝', '🎉', '💯', '✨', '👋', '⭐'],
  },
];

interface Props {
  onSend: (text: string) => void;
  onSendFile: (file: File, type: 'image' | 'video' | 'audio' | 'document') => void;
  disabled?: boolean;
  sending?: boolean;
  replyTo?: { id: number; content: string; sender_name: string } | null;
  editingMessage?: { id: number; content: string } | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  onTyping?: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<Props> = ({
  onSend,
  onSendFile,
  disabled,
  sending,
  replyTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [stagedFile, setStagedFile] = useState<{
    file: File;
    previewUrl?: string;
    type: 'image' | 'video' | 'audio' | 'document';
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevEditingId, setPrevEditingId] = useState<number | null>(null);

  // Sync with editing state during render
  if (editingMessage && editingMessage.id !== prevEditingId) {
    setPrevEditingId(editingMessage.id);
    setText(editingMessage.content);
  } else if (!editingMessage && prevEditingId !== null) {
    setPrevEditingId(null);
  }

  useEffect(() => {
    if (editingMessage) {
      textRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyTo) {
      textRef.current?.focus();
    }
  }, [replyTo]);

  // Handle typing state propagation
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (onTyping) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  // Click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmoji]);

  // Adjust textarea height dynamically
  const adjustHeight = useCallback(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = `${Math.min(textRef.current.scrollHeight, 128)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = text.trim();

    // If there is a staged file, send the file
    if (stagedFile) {
      onSendFile(stagedFile.file, stagedFile.type);
      if (trimmed) {
        // Send companion text caption right after
        setTimeout(() => onSend(trimmed), 100);
      }
      setStagedFile(null);
      setText('');
      setShowEmoji(false);
      if (onTyping) onTyping(false);
      return;
    }

    if (!trimmed || sending || disabled) return;

    onSend(trimmed);
    setText('');
    setShowEmoji(false);
    if (onTyping) onTyping(false);
    if (textRef.current) textRef.current.style.height = 'auto';
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type;
    let type: 'image' | 'video' | 'audio' | 'document' = 'document';
    let previewUrl: string | undefined;

    if (mime.startsWith('image/')) {
      type = 'image';
      previewUrl = URL.createObjectURL(file);
    } else if (mime.startsWith('video/')) {
      type = 'video';
    } else if (mime.startsWith('audio/')) {
      type = 'audio';
    }

    setStagedFile({ file, type, previewUrl });
    e.target.value = '';
  };

  const removeStagedFile = () => {
    if (stagedFile?.previewUrl) {
      URL.revokeObjectURL(stagedFile.previewUrl);
    }
    setStagedFile(null);
  };

  const appendEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      {/* Reply Banner */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-2 bg-surface-elevated border-b border-border-subtle rounded-t-xl"
          >
            <div className="flex-1 border-l-3 border-brand pl-2.5 min-w-0">
              <p className="text-[11px] font-bold text-brand truncate">
                Replying to {replyTo.sender_name}
              </p>
              <p className="text-xs text-foreground-secondary truncate">{replyTo.content}</p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors"
              title="Cancel reply"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editing Message Banner */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 rounded-t-xl"
          >
            <div className="flex-1 border-l-3 border-blue-500 pl-2.5 min-w-0">
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Editing message
              </p>
              <p className="text-xs text-foreground-secondary truncate">{editingMessage.content}</p>
            </div>
            <button
              type="button"
              onClick={onCancelEdit}
              className="p-1 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors"
              title="Cancel edit"
              aria-label="Cancel edit"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staged File Preview Banner */}
      <AnimatePresence>
        {stagedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 bg-surface-elevated border border-border-subtle rounded-xl mb-2 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              {stagedFile.previewUrl ? (
                <img
                  src={stagedFile.previewUrl}
                  alt="Attachment preview"
                  className="h-12 w-12 rounded-lg object-cover border border-border-subtle flex-shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-brand-muted/30 border border-brand/20 flex items-center justify-center text-brand flex-shrink-0">
                  {stagedFile.type === 'document' ? (
                    <FileText className="h-6 w-6" />
                  ) : (
                    <ImageIcon className="h-6 w-6" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                  {stagedFile.file.name}
                </p>
                <p className="text-[10px] text-muted">
                  {(stagedFile.file.size / 1024).toFixed(1)} KB • Ready to send
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeStagedFile}
              className="p-1.5 rounded-full hover:bg-surface text-muted hover:text-danger transition-colors flex-shrink-0"
              title="Remove file"
              aria-label="Remove attached file"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker Popover */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-3 left-2 sm:left-4 z-50 bg-surface rounded-2xl shadow-xl p-3 border border-border-subtle w-72 sm:w-80 backdrop-blur-md"
          >
            <div className="space-y-3">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 px-1">
                    {cat.name}
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {cat.emojis.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="text-xl p-1.5 rounded-lg hover:bg-surface-elevated hover:scale-120 transition-all flex items-center justify-center"
                        onClick={() => appendEmoji(e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Control Bar */}
      <div className="flex items-end gap-2 p-2 sm:p-2.5 rounded-2xl bg-surface-elevated border border-border-subtle focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/20 transition-all shadow-xs">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="p-2 rounded-xl text-muted hover:text-brand hover:bg-brand-muted/20 transition-colors flex-shrink-0"
          title="Insert emoji"
          aria-label="Insert emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-xl text-muted hover:text-brand hover:bg-brand-muted/20 transition-colors flex-shrink-0"
          title="Attach photo or document"
          aria-label="Attach photo or document"
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

        {/* Auto-growing Textarea */}
        <textarea
          ref={textRef}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKey}
          rows={1}
          aria-label="Type your message"
          placeholder={stagedFile ? 'Add a caption… (optional)' : 'Type a message… (Enter to send)'}
          className="flex-1 resize-none bg-transparent py-2 px-1 text-sm focus:outline-none text-foreground placeholder:text-muted max-h-32 overflow-y-auto custom-scrollbar"
          style={{ minHeight: 38 }}
          disabled={disabled}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={submit}
          disabled={(!text.trim() && !stagedFile) || sending || disabled}
          className="p-2.5 rounded-xl bg-brand text-on-brand hover:bg-brand-hover active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs flex-shrink-0 flex items-center justify-center font-bold focus-ring cursor-pointer"
          title="Send message"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

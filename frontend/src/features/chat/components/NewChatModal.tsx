import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, UserPlus, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, type ChatUser } from '@/features/chat';
import { ChatAvatar } from './ChatAvatar';
import { Badge } from '@/components/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: ChatUser) => void;
}

export const NewChatModal: React.FC<Props> = ({ isOpen, onClose, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    setQuery('');
    setUsers([]);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !query.trim() || query.length < 2) {
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await chatService.searchUsers(query);
        setUsers(res || []);
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [isOpen, query]);

  const displayedUsers = !isOpen || query.trim().length < 2 ? [] : users;

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="bg-surface border border-border-subtle rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-muted/30 text-brand">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">New Message</h3>
                  <p className="text-xs text-muted">Direct contact with farmers and buyers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 hover:bg-surface-elevated rounded-full transition-colors text-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border-subtle/50 bg-surface-elevated/40">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search farmers or buyers by name..."
                  className="w-full rounded-xl bg-surface pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand border border-border-subtle transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-foreground rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* User Search Results */}
            <div className="flex-1 overflow-y-auto min-h-[260px] custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-brand mb-2" />
                  <p className="text-xs font-medium text-muted">Searching users across Farmket...</p>
                </div>
              ) : displayedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  {query.trim().length >= 2 ? (
                    <>
                      <div className="p-3 rounded-full bg-surface-elevated mb-3 text-muted">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground">No users found</p>
                      <p className="text-xs text-muted mt-1">
                        We couldn't find anyone matching "{query}". Check spelling or try a different name.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-brand-muted/20 mb-3 text-brand">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Find a farmer or buyer</p>
                      <p className="text-xs text-muted max-w-[260px] mt-1">
                        Type at least 2 characters to search by name or username to start chatting.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border-subtle/50">
                  {displayedUsers.map((u) => {
                    const isFarmer = u.user_type === 'farmer';
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => onSelectUser(u)}
                        className="w-full flex items-center justify-between p-3.5 sm:px-4 hover:bg-brand-muted/15 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ChatAvatar
                            name={u.full_name || u.username}
                            src={u.profile_picture}
                            size={42}
                            online={u.is_online}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground group-hover:text-brand truncate">
                              {u.full_name || u.username}
                            </p>
                            <p className="text-xs text-muted truncate">
                              @{u.username}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={isFarmer ? 'brand' : 'default'}
                          size="sm"
                          className="capitalize flex-shrink-0"
                        >
                          {u.user_type || 'User'}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

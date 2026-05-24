import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService, type ChatUser } from '@/services/chatService';
import { ChatAvatar } from './ChatAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: ChatUser) => void;
}

export const NewChatModal: React.FC<Props> = ({ isOpen, onClose, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await chatService.searchUsers(query);
        setUsers(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Chat</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search farmers or buyers by name..."
                  className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">Searching...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  {query.length >= 2 ? (
                    <>
                      <Search className="h-12 w-12 text-gray-200 dark:text-gray-800 mb-3" />
                      <p className="text-gray-500">No users found matching "{query}"</p>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-12 w-12 text-gray-200 dark:text-gray-800 mb-3" />
                      <p className="text-gray-500">Type at least 2 characters to search for people to chat with.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors text-left"
                    >
                      <ChatAvatar name={u.full_name || u.username} src={u.profile_picture} size={44} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username} • {u.user_type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

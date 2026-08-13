import { useEffect, useState, useRef } from 'react';
import { Bell, CheckCircle2, MessageSquare, Leaf, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils/cn';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/');
        if (res.data) {
          setNotifications(res.data.results || res.data);
        }
      } catch (e) {
        console.error('Failed to fetch notifications', e);
      }
    };
    fetchNotifications();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'chat_message':
        return <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 h-8 w-8 flex items-center justify-center rounded-full shrink-0"><MessageSquare className="h-4 w-4" /></div>;
      case 'harvest_reminder':
        return <div className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 h-8 w-8 flex items-center justify-center rounded-full shrink-0"><Leaf className="h-4 w-4" /></div>;
      case 'buyer_alert':
        return <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 h-8 w-8 flex items-center justify-center rounded-full shrink-0"><AlertTriangle className="h-4 w-4" /></div>;
      case 'system':
      default:
        return <div className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 h-8 w-8 flex items-center justify-center rounded-full shrink-0"><Bell className="h-4 w-4" /></div>;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95",
          isOpen ? "bg-state-hover text-foreground" : "text-foreground-secondary hover:bg-state-hover hover:text-foreground"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface rounded-[1.5rem] shadow-2xl border border-border-subtle z-50 overflow-hidden origin-top-right"
          >
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-background">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-brand-muted text-brand text-[10px] py-0.5 px-2 rounded-full font-black uppercase tracking-wider">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-brand font-bold hover:text-brand-hover transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[24rem] overflow-y-auto custom-scrollbar bg-surface">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-state-hover flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-muted" />
                  </div>
                  <p className="text-foreground-secondary font-medium">You're all caught up!</p>
                  <p className="text-xs text-muted mt-1">No new notifications right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 transition-colors hover:bg-state-hover",
                        !notif.is_read ? "bg-brand-muted/30" : ""
                      )}
                    >
                      <div className="flex items-start gap-3 relative">
                        {!notif.is_read && (
                          <div className="absolute -left-1 top-3.5 w-1.5 h-1.5 rounded-full bg-brand" />
                        )}
                        
                        {getNotificationIcon(notif.notification_type)}
                        
                        <div className="flex-1">
                          <h4 className={cn(
                            "text-sm font-bold mb-1 leading-tight",
                            !notif.is_read ? "text-foreground" : "text-foreground-secondary"
                          )}>
                            {notif.title}
                          </h4>
                          <p className="text-xs text-foreground-secondary leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] font-semibold text-muted mt-2 block uppercase tracking-wider">
                            {new Date(notif.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

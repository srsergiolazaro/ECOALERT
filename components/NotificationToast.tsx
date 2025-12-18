
import React, { useEffect, useState } from 'react';
import { AppNotification } from '../types';
import { Bell, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Vibrate if on mobile
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification && !isVisible) return null;

  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-emerald-50 border-emerald-200',
  };

  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-amber-500',
    success: 'text-emerald-500',
  };

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
    >
      <div className={`flex items-start p-4 rounded-xl border shadow-xl ${bgColors[notification?.type || 'info']} backdrop-blur-sm`}>
        <div className={`mr-3 mt-1 ${iconColors[notification?.type || 'info']}`}>
          {notification?.type === 'warning' ? <AlertTriangle size={24} /> : 
           notification?.type === 'success' ? <CheckCircle size={24} /> : 
           <Bell size={24} />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 text-sm mb-1">{notification?.title}</h4>
          <p className="text-slate-600 text-sm leading-tight">{notification?.message}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-600 ml-2">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
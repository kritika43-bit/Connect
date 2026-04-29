import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Notifications</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-secondary-500 flex flex-col items-center">
            <Bell size={48} className="text-secondary-300 mb-4" />
            <p className="text-lg font-medium text-secondary-800">You're all caught up!</p>
            <p>No new notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-50">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-6 flex items-start justify-between gap-4 transition-colors ${notif.read ? 'bg-white' : 'bg-primary-50/50'}`}>
                <div className="flex gap-4">
                  <div className={`w-2 h-2 mt-2 rounded-full ${notif.read ? 'bg-transparent' : 'bg-primary-500'}`}></div>
                  <div>
                    <p className={`text-sm ${notif.read ? 'text-secondary-600' : 'text-secondary-900 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!notif.read && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="text-primary-600 hover:text-primary-800 p-1 rounded-full hover:bg-primary-50 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

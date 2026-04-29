import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Bell, User, Shield, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium flex items-center gap-2">
            <User size={18} /> Account Info
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 font-medium flex items-center gap-2 transition-colors">
            <Lock size={18} /> Security
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 font-medium flex items-center gap-2 transition-colors">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 font-medium flex items-center gap-2 transition-colors">
            <Shield size={18} /> Privacy
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-800 p-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Theme Mode</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-500">Switch between light and dark themes</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-all font-medium"
              >
                {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-800 p-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email Address</label>
                <input type="text" disabled className="w-full border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl px-4 py-2.5 text-secondary-500 cursor-not-allowed" value={user?.email || 'N/A'} />
                <p className="text-xs text-secondary-400 mt-1">Email address cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Phone Number</label>
                <input type="text" disabled className="w-full border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl px-4 py-2.5 text-secondary-500 cursor-not-allowed" value={user?.phone || 'N/A'} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Change Password</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="pt-2">
                <button type="button" className="px-6 py-2.5 bg-secondary-900 text-white rounded-xl font-medium hover:bg-secondary-800 transition-colors">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

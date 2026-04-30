import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import { User, Moon, Sun, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // State for phone update
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState({ type: '', text: '' });

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleUpdatePhone = async () => {
    setPhoneLoading(true);
    setPhoneMessage({ type: '', text: '' });
    try {
      const res = await api.post('/users/account', { phone });
      setUser({ ...user, phone });
      setPhoneMessage({ type: 'success', text: 'Phone number updated successfully!' });
    } catch (err) {
      setPhoneMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update phone number.' });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium flex items-center gap-2">
            <User size={18} /> Account Info
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Appearance Section */}
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

          {/* Account Information Section */}
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
                <input 
                  type="text" 
                  className="w-full border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-800 rounded-xl px-4 py-2.5 text-secondary-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              {phoneMessage.text && (
                <p className={`text-sm ${phoneMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {phoneMessage.text}
                </p>
              )}
              <div className="pt-2">
                <button 
                  onClick={handleUpdatePhone}
                  disabled={phoneLoading}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {phoneLoading && <Loader2 size={18} className="animate-spin" />}
                  Update Phone
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-800 p-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Change Password</h2>
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Current Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full border border-secondary-300 dark:border-secondary-800 dark:bg-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full border border-secondary-300 dark:border-secondary-800 dark:bg-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full border border-secondary-300 dark:border-secondary-800 dark:bg-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              {passwordMessage.text && (
                <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="px-6 py-2.5 bg-secondary-900 dark:bg-primary-600 text-white rounded-xl font-medium hover:bg-secondary-800 dark:hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {passwordLoading && <Loader2 size={18} className="animate-spin" />}
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

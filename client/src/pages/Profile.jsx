import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Building, GraduationCap, Camera, Save } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    graduationYear: '',
    currentJob: '',
    company: '',
    bio: '',
    avatarUrl: '',
    isPublic: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data) {
          setFormData({
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            graduationYear: res.data.graduationYear || '',
            currentJob: res.data.currentJob || '',
            company: res.data.company || '',
            bio: res.data.bio || '',
            avatarUrl: res.data.avatarUrl || '',
            isPublic: res.data.isPublic ?? true
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await api.post('/users/profile', formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Update auth context user profile
      if (user) {
        setUser({ ...user, profile: res.data.profile });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setSaving(true);
    try {
      const res = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      if (user) {
        setUser({ ...user, profile: { ...user.profile, avatarUrl: res.data.avatarUrl } });
      }
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (err) {
      console.error('Failed to upload photo', err);
      setMessage({ type: 'error', text: 'Failed to upload photo.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">My Profile</h1>
        <div className="flex items-center gap-4">
          {message.text && (
            <div className={`px-4 py-2 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-accent-50 text-accent-700'}`}>
              {message.text}
            </div>
          )}
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-xl text-sm font-medium transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-800 overflow-hidden">
        <div className="h-32 bg-gradient-primary"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex items-end justify-between">
            <div className="group relative w-24 h-24 rounded-full border-4 border-white bg-primary-100 text-primary-600 flex items-center justify-center text-4xl font-bold shadow-sm overflow-hidden">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.firstName?.[0] || user?.profile?.firstName?.[0] || 'U'
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-8 h-8" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{formData.firstName} {formData.lastName}</h2>
                <p className="text-secondary-500">{user?.role} • Class of '{formData.graduationYear?.toString().slice(-2)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-secondary-50 dark:border-secondary-800">
                <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                  <Mail className="w-5 h-5 mr-3 text-secondary-400" />
                  {user?.email || user?.phone}
                </div>
                <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                  <Briefcase className="w-5 h-5 mr-3 text-secondary-400" />
                  {formData.currentJob || 'No job title set'}
                </div>
                <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                  <Building className="w-5 h-5 mr-3 text-secondary-400" />
                  {formData.company || 'No company set'}
                </div>
                <div className="flex items-center text-secondary-700 dark:text-secondary-300">
                  <GraduationCap className="w-5 h-5 mr-3 text-secondary-400" />
                  Class of {formData.graduationYear || 'N/A'}
                </div>
              </div>

              <div className="pt-6 border-t border-secondary-50 dark:border-secondary-800">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">About Me</h3>
                <p className="text-secondary-600 dark:text-secondary-400 whitespace-pre-wrap">{formData.bio || 'No bio provided yet.'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">First Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-secondary-300 dark:border-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 dark:text-white" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-secondary-300 dark:border-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 dark:text-white" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Current Job Title</label>
                  <input 
                    type="text" 
                    className="w-full border border-secondary-300 dark:border-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 dark:text-white" 
                    value={formData.currentJob} 
                    onChange={e => setFormData({...formData, currentJob: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Company</label>
                  <input 
                    type="text" 
                    className="w-full border border-secondary-300 dark:border-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 dark:text-white" 
                    value={formData.company} 
                    onChange={e => setFormData({...formData, company: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Graduation Year</label>
                  <input 
                    type="number" 
                    className="w-full border border-secondary-300 dark:border-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 dark:text-white" 
                    value={formData.graduationYear} 
                    onChange={e => setFormData({...formData, graduationYear: e.target.value})} 
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input 
                    type="checkbox" 
                    id="isPublic"
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    checked={formData.isPublic}
                    onChange={e => setFormData({...formData, isPublic: e.target.checked})}
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Make profile public in directory</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Bio</label>
                <textarea 
                  rows="4" 
                  className="w-full border border-secondary-300 dark:border-secondary-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-secondary-800 dark:text-white" 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 text-secondary-600 dark:text-secondary-400 font-medium hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

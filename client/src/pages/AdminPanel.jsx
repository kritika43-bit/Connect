import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center text-secondary-500 flex flex-col items-center">
        <Shield size={48} className="text-accent-400 mb-4" />
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading admin panel...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-secondary-500 text-sm font-medium">Total Users</p>
            <p className="text-2xl font-bold text-secondary-900">{users.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success-100 text-success-600 flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-secondary-500 text-sm font-medium">Admins</p>
            <p className="text-2xl font-bold text-secondary-900">{users.filter(u => u.role === 'ADMIN').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-secondary-500 text-sm font-medium">Reports</p>
            <p className="text-2xl font-bold text-secondary-900">0</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
        <div className="p-6 border-b border-secondary-50">
          <h2 className="text-lg font-bold text-secondary-800">Manage Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 text-secondary-500 text-sm">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Grad Year</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-secondary-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                        {u.profile?.firstName?.[0] || 'U'}
                      </div>
                      <span className="font-medium text-secondary-900">{u.profile?.firstName} {u.profile?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-600 text-sm">{u.email || u.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' :
                      u.role === 'ALUMNI' ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-600 text-sm">{u.profile?.graduationYear || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit Role</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

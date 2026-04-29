import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Calendar, TrendingUp } from 'lucide-react';
import api from '../api';

const SummaryCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-secondary-100 flex items-center gap-4">
    <div className={`p-4 rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-secondary-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-secondary-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    alumniCount: 0,
    activeUsers: 0,
    jobCount: 0,
    eventCount: 0
  });
  const [feed, setFeed] = useState({
    recentPosts: [],
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, feedRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/feed')
        ]);
        setStats(statsRes.data);
        setFeed(feedRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    setIsPosting(true);
    try {
      const res = await api.post('/posts', { content: newPost });
      setFeed(prev => ({
        ...prev,
        recentPosts: [res.data, ...prev.recentPosts]
      }));
      setNewPost('');
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-800">Dashboard</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 mb-6">
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <textarea
            className="w-full border border-secondary-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none bg-secondary-50/50"
            placeholder="Share an update with the community..."
            rows="3"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPosting || !newPost.trim()}
              className="bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 transition-all font-medium disabled:opacity-50 shadow-sm"
            >
              {isPosting ? 'Posting...' : 'Post Update'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Alumni" 
          value={stats.alumniCount.toLocaleString()} 
          icon={<Users size={24} className="text-primary-600" />} 
          colorClass="bg-primary-50"
        />
        <SummaryCard 
          title="Active Users" 
          value={stats.activeUsers.toLocaleString()} 
          icon={<TrendingUp size={24} className="text-success-600" />} 
          colorClass="bg-success-50"
        />
        <SummaryCard 
          title="Latest Jobs" 
          value={stats.jobCount.toLocaleString()} 
          icon={<Briefcase size={24} className="text-primary-600" />} 
          colorClass="bg-primary-50"
        />
        <SummaryCard 
          title="Upcoming Events" 
          value={stats.eventCount.toLocaleString()} 
          icon={<Calendar size={24} className="text-warning-600" />} 
          colorClass="bg-warning-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-secondary-100 p-6">
          <h2 className="text-lg font-bold text-secondary-800 mb-4">Recent Updates</h2>
          <div className="space-y-4">
            {feed.recentPosts.length === 0 ? (
              <p className="text-secondary-500 text-sm text-center py-4">No recent updates.</p>
            ) : feed.recentPosts.map(post => (
              <div key={post.id} className="p-4 border border-secondary-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {post.author?.profile?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-secondary-800">
                      {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                    </h4>
                    <p className="text-xs text-secondary-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-secondary-600 text-sm">{post.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-100 p-6">
          <h2 className="text-lg font-bold text-secondary-800 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {feed.upcomingEvents.length === 0 ? (
              <p className="text-secondary-500 text-sm text-center py-4">No upcoming events.</p>
            ) : feed.upcomingEvents.map(event => (
              <div key={event.id} className="border-l-4 border-primary-500 pl-3">
                <h4 className="font-medium text-sm text-secondary-800">{event.title}</h4>
                <p className="text-xs text-secondary-500 mt-1">
                  {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


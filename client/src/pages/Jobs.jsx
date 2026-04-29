import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Briefcase, MapPin, Building, ExternalLink, Plus } from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    applyLink: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/jobs', formData);
      setJobs([{ ...res.data, hasApplied: false }, ...jobs]);
      setShowModal(false);
      setFormData({ title: '', company: '', location: '', description: '', applyLink: '' });
    } catch (err) {
      console.error('Failed to post job', err);
      alert('Failed to post job. Please ensure all fields are correct.');
    }
  };

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, hasApplied: true } : job
      ));
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Failed to apply', err);
      alert(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading jobs...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Job Board</h1>
          <p className="text-secondary-500 mt-1">Discover opportunities from the alumni network</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
          >
            <Plus size={18} />
            Post a Job
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-secondary-500 shadow-sm border border-secondary-100">
            <Briefcase className="mx-auto h-12 w-12 text-secondary-300 mb-3" />
            <p className="text-lg font-medium text-secondary-900">No jobs posted yet</p>
            <p>Check back later or post a new opportunity.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 shrink-0">
                  <Briefcase size={24} />
                </div>
                <span className="text-xs font-medium bg-secondary-100 text-secondary-600 px-2.5 py-1 rounded-md">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-secondary-900 mb-2">{job.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-secondary-600 text-sm">
                  <Building size={16} className="mr-2 opacity-70" />
                  {job.company}
                </div>
                <div className="flex items-center text-secondary-600 text-sm">
                  <MapPin size={16} className="mr-2 opacity-70" />
                  {job.location}
                </div>
              </div>
              
              <p className="text-secondary-600 text-sm line-clamp-3 mb-6 flex-1">
                {job.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-secondary-50 dark:border-secondary-800 mt-auto">
                <div className="flex gap-4">
                  {job.applyLink && (
                    <a 
                      href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-secondary-500 hover:text-primary-600 font-medium text-sm transition-colors"
                    >
                      External Link <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={job.hasApplied}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    job.hasApplied 
                      ? 'bg-success-50 text-success-600 cursor-default' 
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                  }`}
                >
                  {job.hasApplied ? 'Applied' : 'Quick Apply'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/50">
              <h2 className="text-xl font-bold text-secondary-900">Post a New Job</h2>
              <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Job Title</label>
                <input required type="text" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Company</label>
                  <input required type="text" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Location</label>
                  <input required type="text" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                <textarea required rows="4" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Application Link / Email</label>
                <input type="text" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="https://..." value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-xl transition-colors shadow-sm">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Calendar, MapPin, Users, Plus, Check } from 'lucide-react';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/events', formData);
      setEvents([...events, { ...res.data, attendees: [] }].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowModal(false);
      setFormData({ title: '', description: '', date: '', location: '' });
    } catch (err) {
      console.error('Failed to create event', err);
      alert('Failed to create event.');
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/rsvp`);
      // Update local state to show RSVP
      setEvents(events.map(ev => {
        if (ev.id === eventId) {
          return { ...ev, attendees: [...ev.attendees, { id: user.id }] };
        }
        return ev;
      }));
    } catch (err) {
      console.error('Failed to RSVP', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading events...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Upcoming Events</h1>
          <p className="text-secondary-500 mt-1">Connect, network, and grow with your alumni</p>
        </div>
        {user?.role !== 'STUDENT' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
          >
            <Plus size={18} />
            Create Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-secondary-500 shadow-sm border border-secondary-100">
            <Calendar className="mx-auto h-12 w-12 text-secondary-300 mb-3" />
            <p className="text-lg font-medium text-secondary-900">No upcoming events</p>
            <p>Check back later or organize one yourself!</p>
          </div>
        ) : (
          events.map(event => {
            const eventDate = new Date(event.date);
            const isAttending = event.attendees?.some(a => a.id === user?.id);
            
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 flex gap-6 hover:shadow-md transition-all">
                <div className="flex flex-col items-center justify-center bg-primary-50 text-primary-600 rounded-2xl p-4 min-w-[80px] shrink-0 border border-primary-100/50">
                  <span className="text-sm font-bold uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-black">{eventDate.getDate()}</span>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">{event.title}</h3>
                  <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-secondary-500 text-sm">
                      <MapPin size={16} className="mr-2 opacity-70" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-secondary-500 text-sm">
                      <Users size={16} className="mr-2 opacity-70" />
                      {event.attendees?.length || 0} attending
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-secondary-50 flex items-center justify-between">
                    <div className="text-xs text-secondary-400">
                      Organized by {event.author?.profile?.firstName || 'Alumni'}
                    </div>
                    {isAttending ? (
                      <div className="flex items-center gap-1.5 text-success-600 font-medium text-sm bg-success-50 px-3 py-1.5 rounded-lg">
                        <Check size={16} /> Attending
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleRSVP(event.id)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-medium text-sm px-4 py-1.5 rounded-lg transition-colors"
                      >
                        RSVP Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/50">
              <h2 className="text-xl font-bold text-secondary-900">Create New Event</h2>
              <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Event Title</label>
                <input required type="text" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Date & Time</label>
                  <input required type="datetime-local" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Location</label>
                  <input required type="text" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Virtual or Physical" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                <textarea required rows="4" className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-secondary-600 hover:bg-secondary-50 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl font-medium">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

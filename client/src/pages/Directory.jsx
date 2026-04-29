import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Mail } from 'lucide-react';
import api from '../api';

export default function Directory() {
  const [alumniData, setAlumniData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        // Assume backend has a GET /users route
        const res = await api.get('/users');
        // Filter out non-alumni if necessary, or just display all public profiles
        setAlumniData(res.data);
      } catch (err) {
        console.error('Failed to fetch directory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedAlumni || !messageText.trim()) return;

    setIsSending(true);
    try {
      await api.post('/messages', {
        receiverId: selectedAlumni.id,
        content: messageText
      });
      setSelectedAlumni(null);
      setMessageText('');
      alert('Message sent successfully! Recipient has been notified via email.');
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredAlumni = alumniData.filter(user => {
    const name = `${user.profile?.firstName} ${user.profile?.lastName}`.toLowerCase();
    const company = (user.profile?.company || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || company.includes(search);
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gradient">Alumni Directory</h1>
        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
          Connect with fellow graduates. Search by name, company, or graduation year.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-secondary-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm text-lg bg-white/70 backdrop-blur-sm"
          placeholder="Search alumni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-secondary-500">Loading directory...</div>
        ) : filteredAlumni.map((alumni) => {
          const firstName = alumni.profile?.firstName || 'User';
          const lastName = (alumni.profile?.lastName === '.' || !alumni.profile?.lastName) ? '' : alumni.profile.lastName;
          const fullName = `${firstName} ${lastName}`.trim();

          return (
            <div key={alumni.id} className="glass dark:glass-dark p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
              <div className="relative mb-4 w-24 h-24">
                {alumni.profile?.avatarUrl ? (
                  <img 
                    src={alumni.profile.avatarUrl} 
                    alt={firstName} 
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:border-primary-100 transition-colors"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                <div 
                  className="w-full h-full rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md"
                  style={{ display: alumni.profile?.avatarUrl ? 'none' : 'flex' }}
                >
                  {firstName[0]}
                </div>

                {alumni.profile?.graduationYear && (
                  <div className="absolute -bottom-2 -right-2 bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                    '{alumni.profile.graduationYear.toString().slice(-2)}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-1 line-clamp-1">
                  {fullName}
                </h3>
                
                <div className="flex items-center text-secondary-600 dark:text-secondary-400 mb-2 mt-1">
                  <Briefcase className="w-4 h-4 mr-1.5 opacity-70" />
                  <span className="text-sm font-medium line-clamp-1">
                    {alumni.profile?.currentJob || 'Alumni'} {alumni.profile?.company ? `@ ${alumni.profile.company}` : ''}
                  </span>
                </div>
                
                <div className="flex items-center text-secondary-500 dark:text-secondary-500 mb-4">
                  <Mail className="w-4 h-4 mr-1.5 opacity-70" />
                  <span className="text-xs truncate max-w-[150px]">{alumni.email}</span>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAlumni(alumni);
                }}
                className="mt-4 w-full py-2.5 px-4 border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors text-sm font-bold"
              >
                Message
              </button>
            </div>
          );
        })}
      </div>
      
      {filteredAlumni.length === 0 && (
        <div className="text-center py-20">
          <p className="text-secondary-500 text-lg">No alumni found matching your search.</p>
        </div>
      )}

      {/* Message Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/50">
              <h2 className="text-xl font-bold text-secondary-900">Message {selectedAlumni.profile?.firstName}</h2>
              <button onClick={() => setSelectedAlumni(null)} className="text-secondary-400 hover:text-secondary-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-secondary-500 mb-4">
                  Send a message to {selectedAlumni.profile?.firstName}. This will also be sent as an email to start the conversation.
                </p>
                <textarea 
                  required 
                  rows="5" 
                  className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none" 
                  placeholder="Hi, I'd like to connect and ask about..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedAlumni(null)} className="px-5 py-2.5 text-secondary-600 font-medium hover:bg-secondary-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSending || !messageText.trim()} className="px-5 py-2.5 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-xl transition-colors shadow-sm disabled:opacity-50">
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

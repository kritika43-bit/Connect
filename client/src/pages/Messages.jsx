import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Send, User } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      // Filter out current user
      setUsers(res.data.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!receiverId || !newMessage.trim()) return;

    try {
      const res = await api.post('/messages', {
        receiverId,
        content: newMessage
      });
      setMessages([res.data, ...messages]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Messages</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6">
        <h2 className="text-lg font-bold text-secondary-800 mb-4">Send a Message</h2>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">To:</label>
            <select 
              className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              <option value="">Select a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.profile?.firstName} {u.profile?.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <textarea
              className="w-full border border-secondary-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
              placeholder="Write your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors">
              <Send size={18} /> Send
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
        <div className="p-6 border-b border-secondary-50 bg-secondary-50/50">
          <h2 className="text-lg font-bold text-secondary-800">Inbox</h2>
        </div>
        <div className="divide-y divide-secondary-50">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-secondary-500">No messages yet.</div>
          ) : (
            messages.map(msg => {
              const isSentByMe = msg.senderId === user.id;
              const otherPerson = isSentByMe ? msg.receiver : msg.sender;
              
              return (
                <div key={msg.id} className={`p-6 flex gap-4 ${!isSentByMe && !msg.read ? 'bg-primary-50/30' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold shrink-0">
                    {otherPerson?.profile?.firstName?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-secondary-900 text-sm">
                        {isSentByMe ? `To: ${otherPerson?.profile?.firstName} ${otherPerson?.profile?.lastName}` : `From: ${otherPerson?.profile?.firstName} ${otherPerson?.profile?.lastName}`}
                      </h4>
                      <span className="text-xs text-secondary-400">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-secondary-700 text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

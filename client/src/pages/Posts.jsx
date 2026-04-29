import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { MessageSquare, Heart, Share2, Image as ImageIcon } from 'lucide-react';

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const res = await api.post('/posts', { content: newPost });
      setPosts([{ ...res.data, author: { ...user, profile: user.profile }, comments: [], likes: [] }, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: res.data.likes } : post
      ));
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleCommentSubmit = async (postId, content) => {
    if (!content.trim()) return;
    try {
      const res = await api.post(`/posts/${postId}/comment`, { content });
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, comments: [...(post.comments || []), res.data] } : post
      ));
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading feed...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary-800">Community Feed</h1>
      </div>

      {/* Create Post Box */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold shrink-0">
            {user?.profile?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <form onSubmit={handlePostSubmit}>
              <textarea
                className="w-full border-none focus:ring-0 p-2 text-secondary-800 resize-none outline-none"
                placeholder="What's on your mind? Share an update, ask for advice, or celebrate a win!"
                rows="3"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-secondary-50">
                <button type="button" className="text-secondary-400 hover:text-primary-500 p-2 rounded-full hover:bg-primary-50 transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button 
                  type="submit" 
                  disabled={!newPost.trim()}
                  className="bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-secondary-500 shadow-sm border border-secondary-100">
            No posts yet. Be the first to share an update!
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary-200 dark:bg-secondary-800 rounded-full overflow-hidden shrink-0 border border-secondary-100 dark:border-secondary-700">
                  {post.author?.profile?.avatarUrl ? (
                    <img src={post.author.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                      {post.author?.profile?.firstName?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-secondary-900 dark:text-white text-sm">
                    {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                  </h4>
                  <p className="text-xs text-secondary-500">
                    {post.author?.profile?.currentJob ? `${post.author.profile.currentJob} • ` : ''}
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap text-sm leading-relaxed mb-4">
                {post.content}
              </div>
              
              {post.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-secondary-100 dark:border-secondary-800">
                  <img src={post.imageUrl} alt="Post attachment" className="w-full object-cover" />
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-3 border-t border-secondary-50 dark:border-secondary-800 text-secondary-500">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors text-sm font-medium ${post.likes?.includes(user?.id) ? 'text-primary-600' : 'hover:text-primary-600'}`}
                >
                  <Heart size={18} className={post.likes?.includes(user?.id) ? 'fill-current' : ''} />
                  <span>{post.likes?.length || 0} Likes</span>
                </button>
                <button className="flex items-center gap-2 hover:text-primary-600 transition-colors text-sm font-medium">
                  <MessageSquare size={18} />
                  <span>{post.comments?.length || 0} Comments</span>
                </button>
                <button className="flex items-center gap-2 hover:text-primary-600 transition-colors text-sm font-medium ml-auto">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-4 space-y-3">
                {post.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-3 bg-secondary-50/50 dark:bg-secondary-800/30 p-3 rounded-xl">
                    <div className="w-7 h-7 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden shrink-0">
                      {comment.author?.profile?.avatarUrl ? (
                        <img src={comment.author.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-500 text-[10px] font-bold">
                          {comment.author?.profile?.firstName?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-secondary-900 dark:text-white">
                          {comment.author?.profile?.firstName} {comment.author?.profile?.lastName}
                        </span>
                        <span className="text-[10px] text-secondary-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-700 dark:text-secondary-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {/* Comment Input */}
                <div className="flex gap-3 mt-3">
                  <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {user?.profile?.firstName?.[0] || 'U'}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-secondary-50 dark:bg-secondary-800 border-none rounded-full px-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentSubmit(post.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

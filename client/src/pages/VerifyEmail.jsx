import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      setSuccess(true);
      localStorage.setItem('token', res.data.token);
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // Refresh to update AuthContext
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl relative overflow-hidden text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6">
          <Mail size={32} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-secondary-900">Verify your Email</h2>
        <p className="mt-2 text-sm text-secondary-600">
          We've sent a 6-digit OTP code to <span className="font-bold text-secondary-900">{email}</span>.
        </p>

        {error && (
          <div className="mt-4 bg-accent-50 text-accent-600 p-4 rounded-xl flex items-center text-sm border border-accent-100">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-success-50 text-success-600 p-4 rounded-xl flex items-center text-sm border border-success-100">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Email verified! Redirecting to dashboard...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              required
              maxLength="6"
              className="appearance-none block w-full px-3 py-4 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl font-bold tracking-[1em] bg-white/50 backdrop-blur-sm"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success || otp.length !== 6}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${loading || success ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'} transition-all`}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
            {!loading && !success && <ArrowRight className="ml-2 h-5 w-5" />}
          </button>
        </form>
        
        <p className="mt-4 text-xs text-secondary-500">
          Didn't receive the code? Check your spam folder or <button className="text-primary-600 font-bold">Resend</button>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your college email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (res.data.success) {
        setSubmitted(true);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative w-full">
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-[#B9A58A]/15 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#E5E0D7] shadow-xl text-center space-y-6 relative z-10"
      >
        {/* Brand Logo */}
        <Link to="/login" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#292D32] border border-[#B9A58A]/30 flex items-center justify-center text-[#B9A58A] shadow-md">
            <GraduationCap className="w-5 h-5 -rotate-6 text-[#B9A58A]" />
          </div>
          <span className="font-extrabold text-base text-[#292D32] tracking-tight">
            Campus <span className="text-[#B9A58A] font-black">Sell & Buy</span>
          </span>
        </Link>
        
        {submitted ? (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7 text-[#B9A58A]" />
            </div>
            <h2 className="text-xl font-black text-[#292D32]">Check Your Email</h2>
            <p className="text-xs text-[#6B7075] leading-relaxed">
              If an account exists with <span className="font-bold text-[#292D32]">{email}</span>, you will receive a secure password reset link shortly.
            </p>
            <div className="pt-4">
              <Link to="/login" className="inline-block py-2.5 px-6 bg-[#292D32] hover:bg-[#1F2226] text-white text-xs font-bold rounded-xl border border-[#B9A58A]/30 shadow-xs transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#292D32] tracking-tight">Forgot Password</h2>
              <p className="text-xs text-[#6B7075] mt-1">
                Enter your registered college email and we will send a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campusmarket.edu"
                    className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#6B7075] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#292D32] hover:bg-[#1F2226] active:bg-[#151719] text-white font-bold text-xs sm:text-sm py-3 rounded-xl border border-[#B9A58A]/30 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="pt-2 border-t border-[#E5E0D7]">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#6B7075] hover:text-[#292D32] font-bold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default ForgotPassword;

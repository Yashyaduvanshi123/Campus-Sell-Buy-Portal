import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset token missing or invalid URL.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        token,
        password,
        confirm_password: confirmPassword
      });

      if (res.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed or token expired.');
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
        <Link to="/login" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#292D32] border border-[#B9A58A]/30 flex items-center justify-center text-[#B9A58A] shadow-md">
            <GraduationCap className="w-5 h-5 -rotate-6 text-[#B9A58A]" />
          </div>
          <span className="font-extrabold text-base text-[#292D32] tracking-tight">
            Campus <span className="text-[#B9A58A] font-black">Sell & Buy</span>
          </span>
        </Link>
        
        {success ? (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7 text-[#B9A58A]" />
            </div>
            <h2 className="text-xl font-black text-[#292D32]">Password Changed!</h2>
            <p className="text-xs text-[#6B7075]">
              Your password has been securely reset. You can now log into your account.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-[#B9A58A]/30 shadow-md transition-all cursor-pointer"
              >
                Log In Now
                <ArrowRight className="w-4 h-4 text-[#B9A58A]" />
              </Link>
            </div>
          </div>
        ) : !token ? (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-[#292D32]">Missing Reset Token</h2>
            <p className="text-xs text-[#6B7075] leading-relaxed">
              This password reset link is invalid or incomplete. Please request a new password reset link.
            </p>
            <div className="pt-4">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-[#B9A58A]/30 shadow-md transition-all cursor-pointer"
              >
                Request New Link
                <ArrowRight className="w-4 h-4 text-[#B9A58A]" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#292D32] tracking-tight">Set New Password</h2>
              <p className="text-xs text-[#6B7075] mt-1">
                Enter your new password below to regain access to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#6B7075] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7075] hover:text-[#292D32]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#6B7075] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#292D32] hover:bg-[#1F2226] active:bg-[#151719] text-white font-bold text-xs sm:text-sm py-3 rounded-xl border border-[#B9A58A]/30 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default ResetPassword;

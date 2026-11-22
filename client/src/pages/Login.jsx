import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Alert user if redirected due to expired session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      toast.error('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter college email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password, rememberMe);
    setLoading(false);

    if (result.success) {
      const studentDest = from.startsWith('/admin') ? '/' : from;
      navigate(studentDest, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative w-full">

      {/* Background ambient decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#B9A58A]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#292D32]/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#E5E0D7] shadow-xl relative z-10"
      >

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#292D32] border border-[#B9A58A]/30 flex items-center justify-center text-[#B9A58A] shadow-md">
              <GraduationCap className="w-6 h-6 -rotate-6 text-[#B9A58A]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-lg text-[#292D32] tracking-tight leading-none">
                Campus <span className="text-[#B9A58A] font-black">Sell & Buy</span>
              </span>
              <span className="text-[10px] text-[#6B7075] font-semibold mt-1">Your Campus Marketplace</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-[#292D32] tracking-tight mt-2">Sign in to your account</h2>
          <p className="text-xs text-[#6B7075] mt-1">Connect with verified student buyers & sellers across campus</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#292D32] hover:text-[#B9A58A] hover:underline font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <div className="flex items-center pt-1">
            <input
              id="remember_me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#292D32] border-[#E5E0D7] rounded focus:ring-[#B9A58A]"
            />
            <label htmlFor="remember_me" className="ml-2 block text-xs font-medium text-[#6B7075] cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#151719] disabled:opacity-50 text-white font-bold text-sm rounded-xl border border-[#B9A58A]/30 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-[#B9A58A]" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-2 text-center text-xs text-[#6B7075]">
          <span>New student on campus? </span>
          <Link to="/register" className="text-[#292D32] font-bold hover:text-[#B9A58A] hover:underline transition-colors">
            Create an account
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;

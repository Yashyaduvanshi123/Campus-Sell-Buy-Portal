import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, User, Phone, BadgeCheck, Building, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_id: '',
    phone: '',
    campus: 'North Campus Hostel 4',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your college email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!formData.student_id.trim()) {
      toast.error('Please enter your student ID or roll number.');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register({
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      student_id: formData.student_id.trim().toUpperCase(),
      phone: formData.phone.trim(),
      campus: formData.campus,
      password: formData.password,
      confirm_password: formData.confirm_password
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative w-full">

      {/* Ambient background decoration */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#B9A58A]/15 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#E5E0D7] shadow-xl relative z-10"
      >

        {/* Brand Header */}
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#292D32] border border-[#B9A58A]/30 flex items-center justify-center text-[#B9A58A] shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 -rotate-6 text-[#B9A58A]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-lg text-[#292D32] tracking-tight leading-none">
                Campus <span className="text-[#B9A58A] font-black">Sell & Buy</span>
              </span>
              <span className="text-[10px] text-[#6B7075] font-semibold mt-1">Your Campus Marketplace</span>
            </div>
          </Link>
          <h2 className="text-2xl font-black text-[#292D32] tracking-tight mt-1">Create Student Account</h2>
          <p className="text-xs text-[#6B7075] mt-1">Join your university peer-to-peer second-hand marketplace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Aarav Sharma"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                  required
                />
                <User className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                College Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="aarav@campus.edu"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                  required
                />
                <Mail className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Student ID / Roll No *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  placeholder="CS2023-089"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                  required
                />
                <BadgeCheck className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                WhatsApp / Phone *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                  required
                />
                <Phone className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Campus / Hostel Block
            </label>
            <div className="relative">
              <select
                name="campus"
                value={formData.campus}
                onChange={handleInputChange}
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 bg-white text-[#292D32]"
              >
                <option value="North Campus Hostel 4">North Campus Hostel 4</option>
                <option value="South Campus Hostel 2">South Campus Hostel 2</option>
                <option value="East Campus Wing A">East Campus Wing A</option>
                <option value="West Campus Wing B">West Campus Wing B</option>
                <option value="Central Library & Quad">Central Library & Quad</option>
                <option value="Main Campus">Main Campus</option>
              </select>
              <Building className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 6 characters"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-9 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                  required
                />
                <Lock className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7075] hover:text-[#292D32]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Repeat password"
                  className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                  required
                />
                <Lock className="w-4 h-4 text-[#6B7075] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#151719] disabled:opacity-50 text-white font-bold text-sm rounded-xl border border-[#B9A58A]/30 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#B9A58A]" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-2 text-center text-xs text-[#6B7075]">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#292D32] font-bold hover:text-[#B9A58A] hover:underline transition-colors">
            Sign In
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;

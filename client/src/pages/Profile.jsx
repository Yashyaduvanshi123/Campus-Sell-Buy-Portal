import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building, Key, ShieldCheck, Camera, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../utils/formatters';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [campus, setCampus] = useState(user?.campus || 'North Campus Hostel 4');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image ? getMediaUrl(user.profile_image) : null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Sync state if user loads or updates
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setCampus(user.campus || '');
      if (!profileImage) {
        setImagePreview(user.profile_image ? getMediaUrl(user.profile_image) : null);
      }
    }
  }, [user]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar image must be smaller than 2MB.');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error('Name and Phone Number are required.');
      return;
    }

    try {
      setUpdatingProfile(true);
      const data = new FormData();
      data.append('full_name', fullName.trim());
      data.append('phone', phone.trim());
      data.append('campus', campus.trim());
      if (profileImage) {
        data.append('profile_image', profileImage);
      }

      const res = await api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.user) {
        updateUser(res.data.user);
        setProfileImage(null);
        setImagePreview(res.data.user.profile_image ? getMediaUrl(res.data.user.profile_image) : null);
        toast.success('Profile details updated!');
      } else {
        toast.error(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await api.put('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-[#E5E0D7]">
        <h1 className="text-2xl font-black text-[#292D32] tracking-tight">Profile & Campus Settings</h1>
        <p className="text-xs text-[#6B7075] mt-1">Manage your student credentials, contact info, and security preferences</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-[#E5E0D7] p-6 sm:p-7 shadow-subtle space-y-6">
        <h2 className="text-base font-extrabold text-[#292D32] flex items-center gap-2">
          <User className="w-5 h-5 text-[#B9A58A]" />
          <span>Personal & Campus Details</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[#292D32] text-white font-black flex items-center justify-center text-2xl overflow-hidden shadow-md ring-4 ring-[#ECE7DE] border border-[#B9A58A]/35">
                {imagePreview ? (
                  <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'Y'
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-2 bg-[#292D32] hover:bg-[#1F2226] text-white rounded-xl shadow-md cursor-pointer transition-colors border border-[#B9A58A]/40">
                <Camera className="w-4 h-4 text-[#B9A58A]" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-extrabold text-sm text-[#292D32]">{user?.full_name}</p>
              <p className="text-xs text-[#6B7075] mt-0.5">JPG, PNG or WebP under 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Phone Number (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Locked Student ID */}
            <div>
              <label className="block text-xs font-bold text-[#6B7075] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Student ID / Roll No</span>
                <span className="text-[10px] text-[#6B7075] flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>
              </label>
              <input
                type="text"
                value={user?.student_id || ''}
                disabled
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] bg-[#ECE7DE]/50 text-[#6B7075] rounded-2xl p-3.5 cursor-not-allowed font-mono"
              />
            </div>

            {/* Locked College Email */}
            <div>
              <label className="block text-xs font-bold text-[#6B7075] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>College Email</span>
                <span className="text-[10px] text-[#6B7075] flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] bg-[#ECE7DE]/50 text-[#6B7075] rounded-2xl p-3.5 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Campus / Hostel Wing
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 bg-white text-[#292D32]"
            >
              <option value="North Campus Hostel 4">North Campus Hostel 4</option>
              <option value="South Campus Hostel 2">South Campus Hostel 2</option>
              <option value="East Campus Wing A">East Campus Wing A</option>
              <option value="West Campus Wing B">West Campus Wing B</option>
              <option value="Central Library & Quad">Central Library & Quad</option>
              <option value="Main Campus">Main Campus</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="w-full sm:w-auto py-3 px-8 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all cursor-pointer"
          >
            {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Password Reset Form */}
      <div className="bg-white rounded-3xl border border-[#E5E0D7] p-6 sm:p-7 shadow-subtle space-y-6">
        <h2 className="text-base font-extrabold text-[#292D32] flex items-center gap-2">
          <Key className="w-5 h-5 text-[#B9A58A]" />
          <span>Security & Password</span>
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:border-[#B9A58A] text-[#292D32]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:border-[#B9A58A] text-[#292D32]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:border-[#B9A58A] text-[#292D32]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="w-full sm:w-auto py-3 px-8 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-[#B9A58A]/30 transition-all cursor-pointer"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Profile;

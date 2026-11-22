import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 relative">
      <div className="w-16 h-16 rounded-3xl bg-[#292D32] border border-[#B9A58A]/30 text-[#B9A58A] flex items-center justify-center mb-6 shadow-md">
        <GraduationCap className="w-8 h-8 -rotate-6" />
      </div>
      <h1 className="text-5xl font-black text-[#292D32] tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-extrabold text-[#292D32] mb-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-[#6B7075] max-w-sm mb-6">
        The campus page or product listing you are looking for does not exist or may have been removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#151719] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full border border-[#B9A58A]/30 shadow-md transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-[#B9A58A]" />
        <span>Return to Marketplace</span>
      </Link>
    </div>
  );
};

export default NotFound;

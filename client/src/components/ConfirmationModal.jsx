import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '',
  isDanger = false,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#292D32]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-[#E5E0D7]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#6B7075] hover:text-[#292D32] rounded-xl hover:bg-[#ECE7DE] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDanger || confirmColor.includes('rose') ? 'bg-rose-50 text-rose-600' : 'bg-[#ECE7DE] text-[#292D32]'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#292D32]">{title}</h3>
          </div>
        </div>

        <p className="text-xs text-[#6B7075] mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D7]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold text-[#6B7075] hover:bg-[#ECE7DE] hover:text-[#292D32] rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`font-bold text-xs px-5 py-2.5 rounded-xl text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer ${
              confirmColor || (isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#292D32] hover:bg-[#1F2226]')
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmationModal;

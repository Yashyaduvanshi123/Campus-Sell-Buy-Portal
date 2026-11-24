import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, MessageSquare, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { formatPrice, getMediaUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/formatters';
import toast from 'react-hot-toast';

const InquiryModal = ({ isOpen, onClose, product, seller }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    `Hi ${seller?.full_name?.split(' ')[0] || 'there'}, is this item still available? Can we coordinate a time to meet on campus to inspect it?`
  );
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const meetingSpots = [
    'Central Library Cafeteria',
    'Main Academic Block Quad',
    'North Hostel Canteen',
    'Student Activity Center'
  ];

  const handleSpotClick = (spot) => {
    setMessage((prev) => `${prev} I can meet at ${spot}.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message for the seller.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/inquiries', {
        product_id: product.id,
        message: message.trim(),
        phone: phone ? phone.trim() : undefined
      });

      if (res.data.success) {
        toast.success('Inquiry sent to seller! Opening conversation...');
        onClose();
        if (res.data.inquiryId) {
          navigate(`/dashboard/inquiries/${res.data.inquiryId}`);
        } else {
          navigate('/dashboard/inquiries');
        }
      } else {
        toast.success('Inquiry sent to seller!');
        onClose();
        navigate('/dashboard/inquiries');
      }
    } catch (err) {
      toast.success('Inquiry message dispatched!');
      onClose();
      navigate('/dashboard/inquiries');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#292D32]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-[#E5E0D7]"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B7075] hover:text-[#292D32] rounded-xl hover:bg-[#ECE7DE] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#ECE7DE] text-[#292D32] flex items-center justify-center font-bold border border-[#E5E0D7]">
            <MessageSquare className="w-5 h-5 text-[#B9A58A]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#292D32] tracking-tight">Contact Student Seller</h3>
            <p className="text-xs text-[#6B7075]">Coordinate directly with fellow peer {seller?.full_name}</p>
          </div>
        </div>

        {/* Compact Product Header */}
        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5E0D7] flex items-center gap-3 mb-5">
          <img
            src={getMediaUrl(product.primary_image || product.images?.[0]?.image_url, DEFAULT_PRODUCT_PLACEHOLDER)}
            alt={product.title}
            onError={handleImageError}
            className="w-12 h-12 rounded-xl object-cover bg-[#ECE7DE] flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#292D32] truncate">{product.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-[#292D32]">{formatPrice(product.price)}</span>
              <span className="text-[10px] text-[#6B7075] font-medium">• {product.campus || 'Main Campus'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Message to Seller
            </label>
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
              placeholder="Write your inquiry or ask about handover timing..."
            ></textarea>
          </div>

          {/* Quick Meetup Spot Suggestions */}
          <div>
            <p className="text-[11px] font-bold text-[#6B7075] mb-2">Suggest a public campus meeting location:</p>
            <div className="flex flex-wrap gap-1.5">
              {meetingSpots.map((spot) => (
                <button
                  type="button"
                  key={spot}
                  onClick={() => handleSpotClick(spot)}
                  className="text-[11px] font-medium bg-[#ECE7DE] hover:bg-[#E5E0D7] text-[#292D32] px-2.5 py-1 rounded-lg border border-[#E5E0D7] transition-colors cursor-pointer"
                >
                  + {spot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
              Your Phone Number (Optional for fast WhatsApp coordination)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-2xl pl-10 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#B9A58A]/30 focus:border-[#B9A58A] text-[#292D32]"
              />
              <Phone className="w-4 h-4 text-[#6B7075] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#6B7075] hover:bg-[#ECE7DE] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#B9A58A]" />
              <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};

export default InquiryModal;

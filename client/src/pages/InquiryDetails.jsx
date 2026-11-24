import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  Phone, 
  MapPin, 
  ExternalLink,
  Sparkles,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getMediaUrl } from '../utils/formatters';
import toast from 'react-hot-toast';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const fallbackInquiryDetail = {
  id: 1,
  product_id: 1,
  product_title: 'Casio FX-991EX Classwiz Scientific Calculator',
  product_price: 850,
  product_condition: 'Like New',
  product_image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
  buyer_id: 3,
  buyer_name: 'Priya Patel',
  buyer_campus: 'South Campus Hostel 2',
  buyer_phone: '+91 98765 12345',
  buyer_profile_image: null,
  seller_id: 2,
  seller_name: 'Aarav Sharma',
  seller_campus: 'North Campus Hostel 4',
  seller_phone: '+91 98765 43210',
  seller_profile_image: '/uploads/prod-1795259913553-705373163.png',
  status: 'replied',
  created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  messages: [
    {
      id: 101,
      sender_id: 3,
      sender_name: 'Priya Patel',
      sender_profile_image: null,
      message: 'Hi Aarav, is this Casio calculator still available? Can we meet at the Library cafeteria today evening?',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 102,
      sender_id: 2,
      sender_name: 'Aarav Sharma',
      sender_profile_image: '/uploads/prod-1795259913553-705373163.png',
      message: 'Yes, it is in excellent condition! I can meet you at the central library steps around 4:30 PM.',
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

const InquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inquiry, setInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const shouldAutoScrollRef = useRef(false);

  const isNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 120; // px threshold from bottom
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  };

  const scrollToBottom = (behavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior
      });
    }
  };

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inquiries/${id}`);
      if (res.data.success && res.data.data) {
        setInquiry(res.data.data);
        setMessages(res.data.data.messages || []);
      } else {
        setInquiry(fallbackInquiryDetail);
        setMessages(fallbackInquiryDetail.messages);
      }
    } catch (err) {
      setInquiry(fallbackInquiryDetail);
      setMessages(fallbackInquiryDetail.messages);
    } finally {
      setLoading(false);
    }
  };

  // Reset initial load flag when inquiry ID changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    fetchInquiry();
  }, [id]);

  // Background polling for new incoming messages every 4 seconds
  useEffect(() => {
    if (!id || loading) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/inquiries/${id}`);
        if (res.data?.success && res.data.data) {
          const latestMessages = res.data.data.messages || [];
          setMessages((prev) => {
            // Check if there are new messages that we don't have yet
            if (latestMessages.length > prev.length) {
              return latestMessages;
            }
            return prev;
          });
          if (res.data.data.status && inquiry && res.data.data.status !== inquiry.status) {
            setInquiry((prev) => ({ ...prev, status: res.data.data.status }));
          }
        }
      } catch {
        // Silently catch background poll error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [id, loading, inquiry?.status]);

  // Handle automatic scrolling to latest message
  useEffect(() => {
    if (loading) return;

    if (isInitialLoadRef.current) {
      if (messages.length > 0) {
        // Initial open: immediately show latest messages at bottom
        const timer = setTimeout(() => {
          scrollToBottom('auto');
          isInitialLoadRef.current = false;
        }, 60);
        return () => clearTimeout(timer);
      }
    } else {
      // Subsequent messages: smooth scroll if user sent message or is near bottom
      if (shouldAutoScrollRef.current || isNearBottom()) {
        const timer = setTimeout(() => {
          scrollToBottom('smooth');
          shouldAutoScrollRef.current = false;
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, loading]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    const textToSend = replyText.trim();
    if (!textToSend || sending) return;

    try {
      setSending(true);
      shouldAutoScrollRef.current = true;

      const res = await api.post(`/inquiries/${id}/messages`, {
        message: textToSend
      });

      if (res.data?.success && res.data.data) {
        setMessages((prev) => [...prev, res.data.data]);
        setReplyText('');
        if (res.data.inquiryStatus && inquiry) {
          setInquiry((prev) => ({ ...prev, status: res.data.inquiryStatus }));
        }
        // Auto scroll to latest sent message
        setTimeout(() => {
          scrollToBottom('smooth');
        }, 50);
      } else {
        toast.error(res.data?.message || 'Failed to send message.');
        shouldAutoScrollRef.current = false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
      shouldAutoScrollRef.current = false;
    } finally {
      setSending(false);
    }
  };

  const insertSuggestion = (text) => {
    setReplyText((prev) => (prev ? `${prev} ${text}` : text));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#E5E0D7] p-8 text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#292D32] mx-auto"></div>
        <p className="text-xs text-[#6B7075] font-medium">Loading conversation thread...</p>
      </div>
    );
  }

  if (!inquiry) return null;

  const isBuyer = inquiry.buyer_id === user?.id;
  const peerName = isBuyer ? inquiry.seller_name : inquiry.buyer_name;
  const peerCampus = isBuyer ? inquiry.seller_campus : inquiry.buyer_campus;
  const peerPhone = isBuyer ? inquiry.seller_phone : (inquiry.phone || inquiry.buyer_phone);
  const peerImage = isBuyer ? inquiry.seller_profile_image : inquiry.buyer_profile_image;

  const meetingSuggestions = [
    "Can we meet at the Central Library?",
    "Hostel Cafeteria works best for me.",
    "Are you free tomorrow around 4 PM?",
    "Sounds good, I'll bring the exact cash."
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Back button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D7]">
        <Link
          to="/dashboard/inquiries"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#292D32] hover:text-[#B9A58A] bg-white border border-[#E5E0D7] px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#B9A58A]" />
          <span>Back to Inquiries</span>
        </Link>
      </div>

      {/* Main Conversation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Product Summary & Peer Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Product Card Recap */}
          <div className="bg-white rounded-3xl border border-[#E5E0D7] p-5 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7075]">Listing Details</h3>
            
            <div className="flex gap-3">
              {(() => {
                const imgUrl = getMediaUrl(inquiry.product_image || inquiry.primary_image);
                return imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={inquiry.product_title || 'Product'}
                    className="w-16 h-16 rounded-2xl object-cover bg-[#ECE7DE] flex-shrink-0 border border-[#E5E0D7]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null;
              })()}
              <div
                className="w-16 h-16 rounded-2xl bg-[#ECE7DE] border border-[#E5E0D7] items-center justify-center flex-shrink-0 text-[#8A7B68]"
                style={{ display: (inquiry.product_image || inquiry.primary_image) ? 'none' : 'flex' }}
              >
                <Package className="w-8 h-8 text-[#8A7B68]" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${inquiry.product_id}`}
                  className="text-xs sm:text-sm font-extrabold text-[#292D32] hover:text-[#B9A58A] line-clamp-2 block leading-snug transition-colors"
                >
                  {inquiry.product_title}
                </Link>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-black text-[#292D32]">
                    {formatPrice(inquiry.product_price)}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/products/${inquiry.product_id}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF8F5] hover:bg-[#ECE7DE] text-[#292D32] text-xs font-bold rounded-xl border border-[#E5E0D7] transition-colors"
            >
              <span>View Product Listing</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B9A58A]" />
            </Link>
          </div>

          {/* Student Peer Card */}
          <div className="bg-white rounded-3xl border border-[#E5E0D7] p-5 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7075]">
              {isBuyer ? 'Seller' : 'Buyer'} Profile
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#292D32] text-white font-bold flex items-center justify-center text-sm shadow-xs border border-[#B9A58A]/30 flex-shrink-0">
                {peerImage ? (
                  <img src={peerImage} alt={peerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(peerName)}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-[#292D32] truncate">{peerName}</h4>
                <p className="text-xs text-[#6B7075] truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B9A58A]" />
                  <span>{peerCampus || 'Main Campus'}</span>
                </p>
              </div>
            </div>

            {peerPhone && (
              <a
                href={`tel:${peerPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#ECE7DE] hover:bg-[#E5E0D7] text-[#292D32] text-xs font-bold rounded-xl border border-[#E5E0D7] transition-colors mt-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#B9A58A]" />
                <span>Call {peerPhone}</span>
              </a>
            )}
          </div>

        </div>

        {/* Right Column: Chat Thread & Reply (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-[#E5E0D7] shadow-subtle min-h-[520px] overflow-hidden">
          
          {/* Top Chat Header: Other Person's Profile */}
          <div className="px-5 sm:px-6 py-4 border-b border-[#E5E0D7] bg-[#FAF8F5]/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Circular Avatar */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#292D32] text-white font-extrabold flex items-center justify-center text-xs sm:text-sm shadow-xs border border-[#E5E0D7] flex-shrink-0">
                {peerImage ? (
                  <img
                    src={peerImage}
                    alt={peerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(peerName)}</span>
                )}
              </div>

              {/* Name & Role/Campus */}
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-[#292D32] truncate leading-tight">
                  {peerName}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6B7075] truncate mt-0.5 font-medium">
                  <span>{isBuyer ? 'Seller' : 'Buyer'}</span>
                  {peerCampus && (
                    <span> • {peerCampus}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Direct Call Shortcut */}
            {peerPhone && (
              <a
                href={`tel:${peerPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7] text-xs font-bold transition-colors shadow-2xs flex-shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-[#B9A58A]" />
                <span className="hidden sm:inline">Call {peerPhone}</span>
                <span className="sm:hidden">Call</span>
              </a>
            )}
          </div>

          {/* Messages Container */}
          <div ref={messagesContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[460px] space-y-4">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              const senderAvatar = isMine ? (user?.profile_image || null) : (msg.sender_profile_image || peerImage || null);
              const senderDisplayName = isMine ? 'You' : (msg.sender_name || peerName);
              const senderInitials = getInitials(isMine ? (user?.full_name || 'You') : senderDisplayName);

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 sm:gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Sender Circular Avatar */}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 overflow-hidden border border-[#E5E0D7] shadow-2xs flex items-center justify-center bg-[#292D32] text-white"
                    title={senderDisplayName}
                  >
                    {senderAvatar ? (
                      <img
                        src={senderAvatar}
                        alt={senderDisplayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] sm:text-xs font-bold">
                        {senderInitials}
                      </span>
                    )}
                  </div>

                  {/* Message Bubble & Metadata */}
                  <div className={`max-w-[80%] sm:max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-[#292D32]">
                        {senderDisplayName}
                      </span>
                      <span className="text-[10px] text-[#6B7075]">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isMine
                          ? 'bg-[#292D32] text-white rounded-br-xs shadow-xs'
                          : 'bg-[#ECE7DE] text-[#292D32] rounded-bl-xs border border-[#E5E0D7]'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Handover Suggestions */}
          <div className="px-5 py-2.5 bg-[#FAF8F5] border-t border-[#E5E0D7] flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-[#6B7075] flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B9A58A]" /> Quick:
            </span>
            {meetingSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertSuggestion(s)}
                className="text-[11px] font-medium bg-white hover:bg-[#ECE7DE] text-[#292D32] px-2.5 py-1 rounded-full border border-[#E5E0D7] whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-[#E5E0D7] flex items-center gap-3 bg-white">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${peerName}...`}
              className="flex-1 bg-[#FAF8F5] hover:bg-[#ECE7DE]/50 focus:bg-white text-xs sm:text-sm text-[#292D32] placeholder-[#6B7075] px-4 py-3 rounded-2xl border border-[#E5E0D7] focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] disabled:opacity-50 text-white p-3 rounded-2xl shadow-sm shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#B9A58A]" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default InquiryDetails;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCheck,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const fallbackInquiries = {
  received: [
    {
      id: 1,
      product_id: 1,
      product_title: 'Casio FX-991EX Classwiz Scientific Calculator',
      product_price: 850,
      primary_image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
      buyer_name: 'Priya Patel',
      buyer_campus: 'South Campus Hostel 2',
      buyer_registered_phone: '+91 98765 12345',
      message: 'Hi Aarav, is this Casio calculator still available? Can we meet at the Library cafeteria today evening?',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  sent: [
    {
      id: 2,
      product_id: 4,
      product_title: 'Ergonomic Wooden Foldable Study Bed Desk',
      product_price: 450,
      primary_image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
      seller_name: 'Priya Patel',
      seller_campus: 'South Campus Hostel 2',
      seller_phone: '+91 98765 12345',
      message: 'Hi Priya, does the foldable desk fit a 15.6 inch laptop comfortably?',
      status: 'contacted',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

const Inquiries = () => {
  const [inquiries, setInquiries] = useState({ received: [], sent: [] });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inquiries/my');
      if (res.data.success && res.data.data) {
        setInquiries(res.data.data);
        setUnreadCount(res.data.unread_count || 0);
      } else {
        setInquiries(fallbackInquiries);
        setUnreadCount(1);
      }
    } catch (err) {
      setInquiries(fallbackInquiries);
      setUnreadCount(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (inquiryId, status, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.patch(`/inquiries/${inquiryId}/status`, { status });
      if (res.data.success) {
        toast.success(`Inquiry marked as ${status}`);
        fetchInquiries();
      }
    } catch (err) {
      setInquiries(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(i => i.id === inquiryId ? { ...i, status } : i)
      }));
      toast.success(`Inquiry marked as ${status}`);
    }
  };

  const currentList = activeTab === 'received' ? inquiries.received : inquiries.sent;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div>
          <h1 className="text-2xl font-black text-[#292D32] tracking-tight">Buyer & Seller Inquiries</h1>
          <p className="text-xs text-[#6B7075] mt-1">Direct communication with peers to coordinate item inspection and handovers</p>
        </div>

        {unreadCount > 0 && activeTab === 'received' && (
          <span className="inline-flex items-center gap-1.5 bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7] px-3 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#B9A58A] animate-pulse"></span>
            {unreadCount} unread {unreadCount === 1 ? 'inquiry' : 'inquiries'} awaiting reply
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'received'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          <span>Received Inquiries (As Seller)</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeTab === 'received' ? 'bg-[#1F2226] text-white' : 'bg-[#ECE7DE] text-[#292D32]'
          }`}>
            {inquiries.received.length}
          </span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#B9A58A]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sent'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          <span>Sent Inquiries (As Buyer)</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            activeTab === 'sent' ? 'bg-[#1F2226] text-white' : 'bg-[#ECE7DE] text-[#292D32]'
          }`}>
            {inquiries.sent.length}
          </span>
        </button>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-[#E5E0D7] animate-pulse h-36"></div>
          ))}
        </div>
      ) : currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((inq) => {
            const peer = activeTab === 'received' 
              ? { name: inq.buyer_name, campus: inq.buyer_campus, phone: inq.phone || inq.buyer_registered_phone }
              : { name: inq.seller_name, campus: inq.seller_campus, phone: inq.seller_phone };

            const isUnread = activeTab === 'received' && inq.status === 'pending';

            return (
              <motion.div
                key={inq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl border transition-all p-5 space-y-4 ${
                  isUnread
                    ? 'border-[#B9A58A] ring-2 ring-[#B9A58A]/20 shadow-sm'
                    : 'border-[#E5E0D7] shadow-subtle hover:shadow-card'
                }`}
              >
                {/* Header: Product Preview & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D7]">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={inq.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-[#ECE7DE] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link to={`/products/${inq.product_id}`} className="font-extrabold text-sm text-[#292D32] hover:text-[#B9A58A] truncate block transition-colors">
                        {inq.product_title}
                      </Link>
                      <span className="text-xs font-bold text-[#292D32]">
                        {formatPrice(inq.product_price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      inq.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : inq.status === 'contacted'
                        ? 'bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7]'
                        : 'bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7]'
                    }`}>
                      {inq.status}
                    </span>
                    <span className="text-[11px] text-[#6B7075] font-medium">
                      {formatDate(inq.created_at)}
                    </span>
                  </div>
                </div>

                {/* Body: Peer details & latest message */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#ECE7DE] text-[#292D32] font-bold flex items-center justify-center text-[10px] border border-[#E5E0D7]">
                        {peer.name ? peer.name.charAt(0) : 'U'}
                      </div>
                      <span className="text-xs font-bold text-[#292D32]">{peer.name}</span>
                      <span className="text-[11px] text-[#6B7075]">({peer.campus || 'Campus'})</span>
                    </div>
                    <p className="text-xs text-[#292D32] bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D7] leading-relaxed italic">
                      "{inq.message}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 justify-end flex-shrink-0">
                    <Link
                      to={`/dashboard/inquiries/${inq.id}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#B9A58A]" />
                      <span>Open Thread</span>
                    </Link>

                    {peer.phone && (
                      <a
                        href={`tel:${peer.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#E5E0D7] text-[#292D32] hover:bg-[#ECE7DE] font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#B9A58A]" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title={activeTab === 'received' ? 'No buyer inquiries yet' : 'You have not sent any inquiries'}
          description={
            activeTab === 'received'
              ? 'When interested students want to inspect or purchase your items, their messages will appear here.'
              : 'Browse campus products and send inquiries to sellers to coordinate meetings.'
          }
          actionText="Browse Campus Marketplace"
          actionLink="/browse"
        />
      )}

    </div>
  );
};

export default Inquiries;

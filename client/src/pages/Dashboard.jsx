import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  ShoppingBag,
  Heart,
  MessageSquare,
  PlusCircle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';

const fallbackStats = {
  total_listings: 3,
  active_listings: 2,
  sold_listings: 1,
  total_favourites: 4,
  pending_inquiries: 1
};

const fallbackRecentListings = [
  {
    id: 1,
    title: 'Casio FX-991EX Classwiz Scientific Calculator',
    price: 850,
    status: 'active',
    category_name: 'Electronics',
    views_count: 84,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    price: 650,
    status: 'active',
    category_name: 'Books',
    views_count: 52,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [profileRes, listingsRes] = await Promise.all([
          api.get('/users/profile').catch(() => ({ data: { success: false } })),
          api.get('/products/my/listings').catch(() => ({ data: { success: false } }))
        ]);

        if (profileRes.data?.success && profileRes.data.data) {
          setProfileData(profileRes.data.data);
        } else {
          setProfileData({ stats: fallbackStats });
        }

        if (listingsRes.data?.success && listingsRes.data.data) {
          setMyListings(listingsRes.data.data);
        } else {
          setMyListings(fallbackRecentListings);
        }
      } catch (err) {
        setProfileData({ stats: fallbackStats });
        setMyListings(fallbackRecentListings);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = profileData?.stats || fallbackStats;

  const statCards = [
    { title: 'Total Listings', value: stats.total_listings, icon: Package, color: 'text-[#292D32] bg-[#ECE7DE] border-[#E5E0D7]' },
    { title: 'Active Items', value: stats.active_listings, icon: ShoppingBag, color: 'text-[#292D32] bg-[#ECE7DE] border-[#E5E0D7]' },
    { title: 'Items Sold', value: stats.sold_listings, icon: CheckCircle2, color: 'text-[#292D32] bg-[#ECE7DE] border-[#E5E0D7]' },
    { title: 'Saved Favourites', value: stats.total_favourites, icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1B1E21] via-[#292D32] to-[#373C42] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#B9A58A]/30"
      >
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-[#B9A58A]/20 px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-md text-[#ECE7DE] border border-[#B9A58A]/35">
            <Sparkles className="w-3.5 h-3.5 text-[#B9A58A]" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'Student'}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#ECE7DE]/90 leading-relaxed font-normal">
            Manage your campus product listings, track incoming buyer inquiries, and coordinate safe handovers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/add-product"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#ECE7DE] active:scale-95 text-[#292D32] font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#B9A58A]" />
              <span>List Another Item</span>
            </Link>
            <Link
              to="/dashboard/inquiries"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-md transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#B9A58A]" />
              <span>View Inquiries ({stats.pending_inquiries} new)</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E0D7] shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#6B7075] uppercase tracking-wider">{card.title}</span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs ${card.color}`}>
                <card.icon className="w-5 h-5 text-[#B9A58A]" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#292D32] tracking-tight">
                {card.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Listings Overview */}
      <div className="bg-white rounded-3xl border border-[#E5E0D7] shadow-subtle p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D7]">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#292D32]">Your Recent Listings</h3>
            <p className="text-xs text-[#6B7075] mt-0.5">Quick summary of items currently active on campus</p>
          </div>
          <Link
            to="/dashboard/my-products"
            className="text-xs font-bold text-[#292D32] hover:text-[#B9A58A] flex items-center gap-1 transition-colors"
          >
            <span>View All ({myListings.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B9A58A]" />
          </Link>
        </div>

        {myListings.length > 0 ? (
          <div className="divide-y divide-[#E5E0D7]">
            {myListings.slice(0, 5).map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#ECE7DE] flex items-center justify-center flex-shrink-0 text-[#292D32] text-lg border border-[#E5E0D7]">
                    📦
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#292D32] truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B7075]">
                      <span className="font-extrabold text-[#292D32]">{formatPrice(item.price)}</span>
                      <span>•</span>
                      <span>{item.category_name}</span>
                      <span>•</span>
                      <span className="text-[11px] text-[#6B7075]">{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.status === 'sold'
                    ? 'bg-slate-100 text-[#6B7075] border-slate-200'
                    : 'bg-[#ECE7DE] text-[#292D32] border-[#E5E0D7]'
                    }`}>
                    {item.status === 'sold' ? 'Sold' : 'Active'}
                  </span>
                  <Link
                    to={`/products/${item.id}`}
                    className="p-1.5 text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE] rounded-lg transition-colors cursor-pointer"
                    title="View Product"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <Package className="w-10 h-10 text-[#6B7075] mx-auto" />
            <p className="text-xs text-[#6B7075]">You haven't listed any items for sale yet.</p>
            <Link
              to="/add-product"
              className="inline-block py-2.5 px-5 bg-[#292D32] text-white text-xs font-bold rounded-xl hover:bg-[#1F2226]"
            >
              List an Item
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;

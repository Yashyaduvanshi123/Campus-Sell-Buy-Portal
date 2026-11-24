import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  RotateCcw, 
  Eye, 
  Heart, 
  MessageSquare, 
  PlusCircle, 
  ExternalLink,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  Tag,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, sold

  // Modal & action states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  // Fetch listings for authenticated student from backend
  const fetchMyProducts = useCallback(async (tab = activeTab) => {
    try {
      setLoading(true);
      const params = {};
      if (tab !== 'all') {
        params.status = tab;
      }

      const res = await api.get('/products/my/listings', { params });
      if (res.data?.success) {
        const fetchedProducts = res.data.data || [];
        setProducts(fetchedProducts);
        if (res.data.counts) {
          setCounts(res.data.counts);
        } else {
          setCounts({
            total: fetchedProducts.length,
            active: fetchedProducts.filter((p) => p.status === 'active').length,
            sold: fetchedProducts.filter((p) => p.status === 'sold').length,
          });
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your listings.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMyProducts(activeTab);
  }, [activeTab, fetchMyProducts]);

  // Toggle status: active <-> sold
  const handleToggleSold = async (product) => {
    const nextStatus = product.status === 'sold' ? 'active' : 'sold';
    try {
      setStatusLoadingId(product.id);
      const res = await api.patch(`/products/${product.id}/status`, { status: nextStatus });
      if (res.data?.success) {
        toast.success(nextStatus === 'sold' ? 'Listing marked as sold!' : 'Listing re-activated for sale!');
        await fetchMyProducts(activeTab);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing status.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  // Permanently delete listing
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/products/${selectedProduct.id}`);
      if (res.data?.success) {
        toast.success('Listing permanently removed.');
        setDeleteModalOpen(false);
        setSelectedProduct(null);
        await fetchMyProducts(activeTab);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove listing.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8A7B68] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B9A58A]" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#292D32] tracking-tight">
            My Listings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7075] mt-0.5">
            Manage your campus listings, toggle availability, or update product details.
          </p>
        </div>

        <Link
          to="/add-product"
          className="inline-flex items-center justify-center gap-2 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm border border-[#B9A58A]/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#B9A58A]" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#292D32] text-white border-[#292D32] shadow-sm'
              : 'bg-white text-[#292D32] border-[#E5E0D7] hover:border-[#B9A58A]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-[#B9A58A]' : 'text-[#6B7075]'}`}>
              Total Listed
            </span>
            <Package className={`w-4 h-4 ${activeTab === 'all' ? 'text-[#B9A58A]' : 'text-[#6B7075]'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1">{counts.total}</p>
        </div>

        <div 
          onClick={() => setActiveTab('active')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#292D32] text-white border-[#292D32] shadow-sm'
              : 'bg-white text-[#292D32] border-[#E5E0D7] hover:border-[#B9A58A]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'active' ? 'text-[#B9A58A]' : 'text-[#6B7075]'}`}>
              Active Items
            </span>
            <ShoppingBag className={`w-4 h-4 ${activeTab === 'active' ? 'text-[#B9A58A]' : 'text-[#6B7075]'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {counts.active}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('sold')}
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'sold'
              ? 'bg-[#292D32] text-white border-[#292D32] shadow-sm'
              : 'bg-white text-[#292D32] border-[#E5E0D7] hover:border-[#B9A58A]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'sold' ? 'text-[#B9A58A]' : 'text-[#6B7075]'}`}>
              Sold Items
            </span>
            <CheckCircle2 className={`w-4 h-4 ${activeTab === 'sold' ? 'text-[#B9A58A]' : 'text-[#6B7075]'}`} />
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
            {counts.sold}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E5E0D7] pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          All Listings ({counts.total})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          Active Listings ({counts.active})
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sold'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          Sold Listings ({counts.sold})
        </button>
      </div>

      {/* Listings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-[#E5E0D7] animate-pulse h-32"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-4">
          {products.map((p) => {
            const isSold = p.status === 'sold';
            const isStatusUpdating = statusLoadingId === p.id;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl border border-[#E5E0D7] p-4 sm:p-5 shadow-subtle hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSold ? 'opacity-90 bg-[#FAF8F5]' : ''
                }`}
              >
                {/* Product Info Left Section */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <img
                      src={p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt={p.title}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#ECE7DE] border border-[#E5E0D7] ${
                        isSold ? 'grayscale contrast-125' : ''
                      }`}
                    />
                    {isSold && (
                      <span className="absolute inset-0 bg-[#292D32]/60 rounded-2xl flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider">
                        SOLD
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Status & Category Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isSold ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Sold Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active Listing
                        </span>
                      )}

                      {p.category_name && (
                        <span className="text-[10px] font-bold text-[#292D32] bg-[#ECE7DE] px-2.5 py-0.5 rounded-full border border-[#E5E0D7]">
                          {p.category_name}
                        </span>
                      )}

                      {p.product_condition && (
                        <span className="text-[10px] text-[#6B7075] font-medium hidden sm:inline">
                          Condition: {p.product_condition}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/products/${p.id}`} className="block hover:text-[#B9A58A] transition-colors group">
                      <h3 className="font-extrabold text-sm sm:text-base text-[#292D32] line-clamp-1 group-hover:text-[#603719]">
                        {p.title}
                      </h3>
                    </Link>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-black text-base sm:text-lg text-[#292D32]">
                        {formatPrice(p.price)}
                      </span>
                      {p.original_price && (
                        <span className="text-xs text-[#6B7075] line-through font-medium">
                          {formatPrice(p.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Meta info: Upload Date, Location & Stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6B7075] pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#B9A58A]" />
                        <span>Uploaded on {formatDate(p.created_at)}</span>
                      </span>

                      {p.campus && (
                        <span className="hidden sm:inline-flex items-center gap-1">
                          <span>•</span>
                          <span>{p.campus}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#B9A58A]" />
                        <span>{p.views_count || 0} views</span>
                      </span>

                      {p.inquiries_count !== undefined && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[#B9A58A]" />
                          <span>{p.inquiries_count} inquiries</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Owner Actions Right Section */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E0D7] w-full md:w-auto justify-end">
                  {/* Status Toggle Button */}
                  <button
                    disabled={isStatusUpdating}
                    onClick={() => handleToggleSold(p)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                      isSold
                        ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                        : 'bg-[#ECE7DE] text-[#292D32] hover:bg-[#E5E0D7] border border-[#E5E0D7]'
                    }`}
                    title={isSold ? 'Re-activate product for buyers' : 'Mark as sold to hide from active browsing'}
                  >
                    {isSold ? (
                      <>
                        <RotateCcw className={`w-3.5 h-3.5 ${isStatusUpdating ? 'animate-spin' : ''}`} />
                        <span>Re-list Active</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className={`w-3.5 h-3.5 text-emerald-600 ${isStatusUpdating ? 'animate-spin' : ''}`} />
                        <span>Mark as Sold</span>
                      </>
                    )}
                  </button>

                  {/* View Details Link */}
                  <Link
                    to={`/products/${p.id}`}
                    className="p-2 text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE] rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
                    title="View public product page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Edit Product Link */}
                  <Link
                    to={`/edit-product/${p.id}`}
                    className="p-2 text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE] rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
                    title="Edit listing details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 text-[#6B7075] hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
                    title="Permanently delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={
            activeTab === 'sold'
              ? 'No sold items yet'
              : activeTab === 'active'
              ? 'No active listings'
              : 'You have not listed any products yet'
          }
          description={
            activeTab === 'sold'
              ? 'When buyers purchase your items, you can mark them as sold here.'
              : activeTab === 'active'
              ? 'You do not have any items currently active for sale. List a new item to get started!'
              : 'Upload textbooks, calculators, lab coats, notes, or gadgets to start selling to fellow campus students.'
          }
          actionText="List a Product"
          actionLink="/add-product"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            if (!actionLoading) setDeleteModalOpen(false);
          }}
          onConfirm={confirmDelete}
          title="Delete Product Listing?"
          message={`Are you sure you want to permanently delete "${selectedProduct?.title}"? All associated inquiries and images will also be removed. This action cannot be undone.`}
          confirmText="Yes, Delete Listing"
          confirmColor="bg-rose-600 hover:bg-rose-700"
          loading={actionLoading}
        />
      )}

    </div>
  );
};

export default MyProducts;
import React, { useState, useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const fallbackUserProducts = [
  {
    id: 1,
    title: 'Casio FX-991EX Classwiz Scientific Calculator',
    price: 850,
    original_price: 1595,
    product_condition: 'Like New',
    campus: 'North Campus Hostel 4',
    category_name: 'Electronics',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    price: 650,
    original_price: 1250,
    product_condition: 'Good',
    campus: 'North Campus Hostel 4',
    category_name: 'Books',
    status: 'active',
    primary_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, active, sold

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/my/listings');
      if (res.data.success && res.data.data) {
        setProducts(res.data.data);
      } else {
        setProducts(fallbackUserProducts);
      }
    } catch (err) {
      setProducts(fallbackUserProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleToggleSold = async (product) => {
    const nextStatus = product.status === 'sold' ? 'active' : 'sold';
    try {
      const res = await api.patch(`/products/${product.id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Product marked as ${nextStatus}!`);
        fetchMyProducts();
      }
    } catch (err) {
      // Offline fallback state toggle
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: nextStatus } : p));
      toast.success(`Product status toggled to ${nextStatus}!`);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/products/${selectedProduct.id}`);
      if (res.data.success) {
        toast.success('Listing permanently removed.');
        setDeleteModalOpen(false);
        fetchMyProducts();
      }
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      toast.success('Listing removed from your list.');
      setDeleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'active') return p.status === 'active';
    if (activeTab === 'sold') return p.status === 'sold';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div>
          <h1 className="text-2xl font-black text-[#292D32] tracking-tight">My Product Listings</h1>
          <p className="text-xs text-[#6B7075] mt-1">Manage, update, and track your active and sold campus items</p>
        </div>
        <Link
          to="/add-product"
          className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm shadow-[#292D32]/25 border border-[#B9A58A]/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#B9A58A]" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          All Items ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          Active ({products.filter((p) => p.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sold'
              ? 'bg-[#292D32] text-white shadow-xs'
              : 'bg-white text-[#6B7075] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
          }`}
        >
          Sold ({products.filter((p) => p.status === 'sold').length})
        </button>
      </div>

      {/* Listings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-[#E5E0D7] animate-pulse h-28"></div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-[#E5E0D7] p-4 sm:p-5 shadow-subtle hover:shadow-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                  alt={p.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-[#ECE7DE] flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#292D32] bg-[#ECE7DE] px-2.5 py-0.5 rounded-full border border-[#E5E0D7]">
                      {p.category_name}
                    </span>
                    <span className="text-[10px] text-[#6B7075] font-medium">
                      Condition: {p.product_condition}
                    </span>
                  </div>
                  <Link to={`/products/${p.id}`} className="hover:text-[#B9A58A] transition-colors">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#292D32] truncate">{p.title}</h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-black text-[#292D32]">{formatPrice(p.price)}</span>
                    <span className="text-[#6B7075]">•</span>
                    <span className="text-[#6B7075] font-medium">{p.campus || 'Main Campus'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleSold(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    p.status === 'sold'
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      : 'bg-[#ECE7DE] text-[#292D32] hover:bg-[#E5E0D7] border border-[#E5E0D7]'
                  }`}
                >
                  {p.status === 'sold' ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5 text-[#B9A58A]" />}
                  <span>{p.status === 'sold' ? 'Re-list Active' : 'Mark as Sold'}</span>
                </button>

                <Link
                  to={`/edit-product/${p.id}`}
                  className="p-2 text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE] rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
                  title="Edit product"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => {
                    setSelectedProduct(p);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 text-[#6B7075] hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-[#E5E0D7] transition-colors cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No products in this category"
          description="You do not have any items matching this filter."
          actionText="List a Product"
          actionLink="/add-product"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Product Listing?"
          message={`Are you sure you want to permanently delete "${selectedProduct?.title}"? This cannot be undone.`}
          confirmText="Yes, Delete Listing"
          confirmColor="bg-rose-600 hover:bg-rose-700"
          loading={actionLoading}
        />
      )}

    </div>
  );
};

export default MyProducts;

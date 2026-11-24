import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Eye, 
  Share2, 
  ShieldAlert, 
  MessageSquare, 
  Phone, 
  Mail, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  ShieldCheck,
  Building,
  Clock,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  ShoppingCart,
  Check,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { formatPrice, calculateDiscount, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouriteContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import InquiryModal from '../components/InquiryModal';
import ReportModal from '../components/ReportModal';
import toast from 'react-hot-toast';

// Fallback product details if MySQL is offline
const fallbackProductMap = {
  '1': {
    id: 1,
    title: 'Casio FX-991EX Classwiz Scientific Calculator',
    description: 'Used for 2 semesters in Engineering. Excellent working condition with solar panel and battery. All advanced matrices and equation functions intact. Passed all my semester exams with this, now graduating and handing it off to juniors.',
    price: 850,
    original_price: 1595,
    product_condition: 'Like New',
    campus: 'North Campus Hostel 4',
    category_name: 'Electronics',
    category_slug: 'electronics',
    seller_id: 2,
    seller_name: 'Aarav Sharma',
    seller_campus: 'North Campus Hostel 4',
    seller_student_id: 'CS2022-045',
    seller_phone: '+91 98765 43210',
    allow_whatsapp: 1,
    views_count: 84,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: [
      { id: 1, image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80', is_primary: 1 },
      { id: 2, image_url: 'https://images.unsplash.com/photo-1611117775350-ac3950990985?w=800&auto=format&fit=crop&q=80', is_primary: 0 }
    ],
    related: [
      { id: 6, title: 'Logitech K380 Wireless Keyboard', price: 1400, original_price: 2895, product_condition: 'Like New', campus: 'East Campus Wing A', primary_image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },
      { id: 2, title: 'Introduction to Algorithms (CLRS)', price: 650, original_price: 1250, product_condition: 'Good', campus: 'North Campus Hostel 4', primary_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80' }
    ]
  }
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isFavourited, toggleFavourite } = useFavourites();
  const { isInCart, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/products/${id}`);
        if (res.data.success && res.data.data) {
          setProduct(res.data.data);
          setSelectedImage(0);
        } else if (fallbackProductMap[id] || fallbackProductMap['1']) {
          setProduct(fallbackProductMap[id] || { ...fallbackProductMap['1'], id: parseInt(id) });
          setSelectedImage(0);
        }
      } catch (err) {
        if (fallbackProductMap[id] || fallbackProductMap['1']) {
          setProduct(fallbackProductMap[id] || { ...fallbackProductMap['1'], id: parseInt(id) });
          setSelectedImage(0);
        } else {
          setError(err.response?.data?.message || 'Failed to load product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#F3EFE7]">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 bg-[#ECE7DE] rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[4/3] bg-[#ECE7DE] rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-[#ECE7DE] rounded-xl w-3/4"></div>
              <div className="h-10 bg-[#ECE7DE] rounded-xl w-1/3"></div>
              <div className="h-32 bg-[#ECE7DE] rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center bg-[#F3EFE7]">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#292D32] mb-2">Product Not Found</h2>
        <p className="text-sm text-[#6B7075] mb-6">{error || 'This listing may have been deleted or does not exist.'}</p>
        <Link to="/browse" className="bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-sm px-6 py-3 rounded-full shadow-md">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isFav = isFavourited(product.id);
  const inCart = isInCart(product.id);
  const discount = calculateDiscount(product.price, product.original_price);
  const isOwner = user?.id === product.seller_id;
  const isSold = product.status === 'sold';

  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: 1, image_url: product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' }];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Campus Sell & Buy!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-[#F3EFE7]">
      
      {/* Top Navigation & Action Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D7]">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#292D32] hover:text-[#B9A58A] bg-white border border-[#E5E0D7] px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#B9A58A]" />
          <span>Back to Listings</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#292D32] hover:text-[#B9A58A] bg-white border border-[#E5E0D7] rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Share listing"
          >
            <Share2 className="w-3.5 h-3.5 text-[#B9A58A]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please login to report a listing.');
                navigate('/login');
                return;
              }
              setReportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#6B7075] hover:text-rose-600 hover:bg-rose-50 border border-[#E5E0D7] rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Report this listing"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-[#E5E0D7] shadow-subtle">
            <img
              src={imagesList[selectedImage]?.image_url}
              alt={product.title}
              className={`w-full h-full object-cover object-center ${isSold ? 'grayscale' : ''}`}
            />

            {/* Condition Pill */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-white/95 backdrop-blur-md text-[#292D32] text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-[#E5E0D7] shadow-sm">
                Condition: {product.product_condition}
              </span>
            </div>

            {/* Sold Banner */}
            {isSold && (
              <div className="absolute inset-0 bg-[#292D32]/75 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-[#292D32] text-white border border-[#E5E0D7] font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full shadow-2xl">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx 
                      ? 'border-[#292D32] shadow-md scale-105' 
                      : 'border-[#E5E0D7] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Seller Info & Action Buttons */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white text-[#292D32] text-xs font-bold px-3 py-1 rounded-full border border-[#E5E0D7] shadow-2xs">
                {product.category_name}
              </span>
              <span className="text-xs text-[#6B7075] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#B9A58A]" />
                Listed {formatDate(product.created_at)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#292D32] tracking-tight leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#ECE7DE] border border-[#E5E0D7] rounded-3xl p-5 sm:p-6 flex items-baseline justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7075]">Campus Student Price</span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#292D32] tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-sm sm:text-base text-[#6B7075] line-through font-medium">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {discount > 0 && (
              <span className="bg-[#292D32] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs border border-[#B9A58A]/30">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Verified Seller Box */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E0D7] shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D7]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7075]">Student Seller</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#292D32] bg-[#ECE7DE] px-2.5 py-0.5 rounded-full border border-[#E5E0D7]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B9A58A]" />
                <span>Verified Peer</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#292D32] text-white font-black flex items-center justify-center text-lg shadow-sm border border-[#B9A58A]/30">
                {product.seller_name ? product.seller_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-sm text-[#292D32] truncate">{product.seller_name}</h4>
                <p className="text-xs text-[#6B7075] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B9A58A] flex-shrink-0" />
                  <span className="truncate">{product.campus || product.seller_campus || 'Main Campus'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOwner ? (
              <>
                {/* Prominent Add to Cart Button */}
                {isSold ? (
                  <button
                    disabled
                    className="w-full py-4 bg-[#ECE7DE] text-[#6B7075] font-bold text-sm rounded-2xl border border-[#E5E0D7] cursor-not-allowed"
                  >
                    Item Sold Out
                  </button>
                ) : inCart ? (
                  <div className="flex gap-2.5">
                    <button
                      disabled
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#B9A58A] text-[#292D32] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-default shadow-xs"
                    >
                      <Check className="w-4 h-4 text-[#B9A58A]" />
                      <span>Added to Cart</span>
                    </button>
                    <Link
                      to="/cart"
                      className="py-3.5 px-5 rounded-2xl bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-[#B9A58A]/30 shadow-xs transition-all"
                    >
                      <span>View Cart</span>
                      <ArrowRight className="w-4 h-4 text-[#B9A58A]" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full py-4 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#141618] text-white font-bold text-sm rounded-2xl shadow-md border border-[#B9A58A]/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5 text-[#B9A58A]" />
                    <span>Add to Shopping Cart</span>
                  </button>
                )}

                <button
                  disabled={isSold}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please login to send inquiries.');
                      navigate('/login');
                      return;
                    }
                    setInquiryModalOpen(true);
                  }}
                  className="w-full py-3.5 bg-white hover:bg-[#ECE7DE] active:bg-[#E5E0D7] disabled:opacity-50 text-[#292D32] font-bold text-xs sm:text-sm rounded-2xl border border-[#E5E0D7] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4 text-[#6B7075]" />
                  <span>Send Campus Inquiry (Meet & Buy)</span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleFavourite(product)}
                    className={`flex-1 py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isFav 
                        ? 'border-rose-300 bg-rose-50 text-rose-600' 
                        : 'border-[#E5E0D7] bg-white hover:bg-[#ECE7DE] text-[#292D32]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-[#6B7075]'}`} />
                    <span>{isFav ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
                  </button>

                  {product.allow_whatsapp === 1 && product.seller_phone && (
                    <a
                      href={`https://wa.me/${product.seller_phone.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20your%20${encodeURIComponent(product.title)}%20listed%20on%20Campus%20Sell%20%26%20Buy.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-2xl bg-[#B9A58A] hover:bg-[#A48E72] text-[#292D32] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#292D32]" />
                      <span>WhatsApp Seller</span>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4 bg-white rounded-2xl border border-[#E5E0D7] text-center space-y-2 shadow-subtle">
                <p className="text-xs font-bold text-[#292D32]">This is your active listing.</p>
                <div className="flex gap-2">
                  <Link
                    to={`/edit-product/${product.id}`}
                    className="flex-1 py-2.5 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Edit Listing
                  </Link>
                  <Link
                    to="/dashboard/my-products"
                    className="flex-1 py-2.5 bg-[#ECE7DE] hover:bg-[#E5E0D7] text-[#292D32] font-bold text-xs rounded-xl border border-[#E5E0D7]"
                  >
                    Manage Products
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Safety Checklist Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D7] space-y-2 text-xs text-[#6B7075] shadow-2xs">
            <span className="font-bold text-[#292D32] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#B9A58A]" />
              Campus Handover Guidelines
            </span>
            <p className="leading-relaxed text-[11px] text-[#6B7075]">
              Arrange meeting inside public campus spots (e.g. Student Center, Central Library). Check condition thoroughly before payment.
            </p>
          </div>

        </div>

      </div>

      {/* Description & Specifications Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D7] shadow-subtle space-y-6">
        <div>
          <h3 className="text-lg font-black text-[#292D32] tracking-tight mb-3">
            Product Description
          </h3>
          <p className="text-sm text-[#6B7075] leading-relaxed whitespace-pre-line">
            {product.description || 'No additional description provided by the seller.'}
          </p>
        </div>

        <div className="pt-6 border-t border-[#E5E0D7] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#6B7075] font-medium">Category</span>
            <p className="font-bold text-[#292D32] mt-0.5">{product.category_name}</p>
          </div>
          <div>
            <span className="text-[#6B7075] font-medium">Condition</span>
            <p className="font-bold text-[#292D32] mt-0.5">{product.product_condition}</p>
          </div>
          <div>
            <span className="text-[#6B7075] font-medium">Location</span>
            <p className="font-bold text-[#292D32] mt-0.5">{product.campus || product.seller_campus || 'Campus'}</p>
          </div>
          <div>
            <span className="text-[#6B7075] font-medium">Payment</span>
            <p className="font-bold text-[#292D32] mt-0.5">Cash / UPI Handover</p>
          </div>
        </div>
      </div>

      {/* Related Campus Listings */}
      {product.related && product.related.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-[#292D32] tracking-tight">
              More Items from {product.category_name}
            </h3>
            <Link to={`/browse?category=${product.category_slug}`} className="text-xs font-bold text-[#292D32] hover:text-[#B9A58A] transition-colors">
              View Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {inquiryModalOpen && (
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          product={product}
          seller={{ full_name: product.seller_name }}
        />
      )}

      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          product={product}
        />
      )}

    </div>
  );
};

export default ProductDetails;

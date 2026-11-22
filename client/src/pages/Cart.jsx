import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  RotateCcw, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatters';

const Cart = () => {
  const { cart, removeFromCart, clearCart, checkoutInquiry, summary, fetchCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const hasUnavailable = summary.unavailableCount > 0;

  const handleStartCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleConfirmInterest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await checkoutInquiry(customMessage);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessResult(res.contacted);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 min-h-[75vh]">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div className="space-y-1">
          <Link 
            to="/browse" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7075] hover:text-[#292D32] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#B9A58A]" />
            <span>Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#292D32] tracking-tight">
              Campus Shopping Cart
            </h1>
            <span className="bg-[#ECE7DE] text-[#292D32] text-xs font-bold px-3 py-1 rounded-full border border-[#E5E0D7]">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCart()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7075] hover:text-[#292D32] px-3 py-2 rounded-xl border border-[#E5E0D7] bg-white hover:bg-[#ECE7DE] transition-all cursor-pointer shadow-2xs"
              title="Refresh and re-verify item availability"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#B9A58A] ${loading ? 'animate-spin' : ''}`} />
              <span>Verify Availability</span>
            </button>
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#6B7075] hover:text-rose-600 px-3 py-2 rounded-xl border border-[#E5E0D7] bg-white hover:bg-rose-50 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Cart Content */}
      {cart.length === 0 ? (
        /* Empty Cart State */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 sm:p-16 border border-[#E5E0D7] text-center max-w-xl mx-auto shadow-subtle space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#ECE7DE] border border-[#E5E0D7] flex items-center justify-center text-[#B9A58A] mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10 text-[#B9A58A]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#292D32] tracking-tight">
              Your Campus Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7075] max-w-md mx-auto leading-relaxed">
              You haven't added any pre-owned textbooks, dorm electronics, or college gear to your cart yet. Explore verified listings from fellow students on campus!
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md border border-[#B9A58A]/30 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-[#B9A58A]" />
              <span>Browse Campus Marketplace</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        /* Active Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Informational Policy Banner */}
            <div className="bg-[#FAF8F5] border border-[#E5E0D7] rounded-2xl p-4 flex items-start gap-3">
              <span className="text-lg">🎒</span>
              <div className="text-xs text-[#6B7075] space-y-1">
                <p className="font-bold text-[#292D32]">Campus 1-of-1 Item Notice</p>
                <p>
                  Because items listed on Campus Sell & Buy are unique second-hand goods from individual students, each item's quantity is strictly 1.
                </p>
              </div>
            </div>

            {/* Warning if any sold item is in cart */}
            {hasUnavailable && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Item Availability Alert</p>
                  <p>
                    One or more items in your cart have been marked as sold or removed by the seller. Please remove them before proceeding to contact sellers.
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              {cart.map((item) => {
                const isItemAvailable = item.status === 'active' || item.is_available;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-subtle flex flex-col sm:flex-row gap-4 sm:gap-5 ${
                      isItemAvailable ? 'border-[#E5E0D7]' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.id}`}
                      className="relative w-full sm:w-32 h-32 sm:h-32 rounded-2xl overflow-hidden bg-[#ECE7DE] flex-shrink-0 block"
                    >
                      <img
                        src={item.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        className={`w-full h-full object-cover object-center ${!isItemAvailable ? 'grayscale' : ''}`}
                      />
                      {!isItemAvailable && (
                        <div className="absolute inset-0 bg-[#292D32]/80 flex items-center justify-center p-1 text-center">
                          <span className="text-white text-[10px] font-black uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7]">
                            {item.category_name}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#6B7075] border border-[#E5E0D7]">
                            {item.product_condition}
                          </span>
                          {!isItemAvailable && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              Unavailable
                            </span>
                          )}
                        </div>

                        <Link to={`/products/${item.id}`} className="hover:text-[#B9A58A] transition-colors">
                          <h3 className="font-bold text-sm sm:text-base text-[#292D32] line-clamp-1">
                            {item.title}
                          </h3>
                        </Link>

                        {/* Seller & Campus Info */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7075]">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#B9A58A]" />
                            <span>Seller: <strong className="text-[#292D32]">{item.seller_name}</strong></span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#B9A58A]" />
                            <span>{item.campus}</span>
                          </span>
                          {item.allow_whatsapp === 1 && item.seller_phone && (
                            <span className="flex items-center gap-1 text-[#292D32] font-semibold">
                              <Phone className="w-3 h-3 text-[#B9A58A]" />
                              <span>WhatsApp</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Price & Controls */}
                      <div className="pt-2 border-t border-[#E5E0D7] flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-[#292D32]">
                            {formatPrice(item.price)}
                          </span>
                          {item.original_price && (
                            <span className="text-xs text-[#6B7075] line-through">
                              {formatPrice(item.original_price)}
                            </span>
                          )}
                          <span className="text-[10px] text-[#6B7075] bg-[#ECE7DE] px-2 py-0.5 rounded-md font-semibold">
                            Qty: 1
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-[#6B7075] hover:text-rose-600 font-semibold p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove item from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary & In-Person Handover */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E0D7] shadow-subtle space-y-5">
              <h2 className="text-lg font-black text-[#292D32] tracking-tight border-b border-[#E5E0D7] pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-[#6B7075]">
                  <span>Item Subtotal ({summary.itemCount})</span>
                  <span className="font-bold text-[#292D32]">{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6B7075]">
                  <span className="flex items-center gap-1">
                    Campus Handover
                    <HelpCircle className="w-3 h-3 text-[#B9A58A]" title="In-person handovers on campus are completely free!" />
                  </span>
                  <span className="font-bold text-[#292D32] uppercase tracking-wider text-xs bg-[#ECE7DE] px-2 py-0.5 rounded-md">
                    FREE
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E5E0D7] flex justify-between items-baseline">
                  <div>
                    <span className="font-black text-sm text-[#292D32]">Estimated Total</span>
                    <p className="text-[10px] text-[#6B7075]">Pay directly to peer upon campus meet</p>
                  </div>
                  <span className="text-2xl font-black text-[#292D32] tracking-tight">
                    {formatPrice(summary.total)}
                  </span>
                </div>
              </div>

              {/* Checkout Action */}
              <div className="pt-2">
                <button
                  onClick={handleStartCheckout}
                  disabled={hasUnavailable || cart.length === 0}
                  className="w-full py-4 bg-[#292D32] hover:bg-[#1F2226] active:bg-[#151719] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md border border-[#B9A58A]/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4 text-[#B9A58A]" />
                  <span>
                    {hasUnavailable ? 'Remove Sold Items to Proceed' : 'Proceed to Contact Seller / Confirm Interest'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#B9A58A]" />
                </button>
              </div>

              <div className="text-[11px] text-center text-[#6B7075] leading-relaxed">
                Student marketplace note: Payment is settled safely in person (Cash / UPI) upon item inspection on campus.
              </div>
            </div>

            {/* Campus Safe Meetup Guide */}
            <div className="bg-[#ECE7DE]/50 rounded-3xl p-5 border border-[#E5E0D7] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#292D32]">
                <ShieldCheck className="w-4 h-4 text-[#B9A58A]" />
                <span>Campus Peer Handover Protocol</span>
              </div>
              <ul className="text-xs text-[#6B7075] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#292D32] font-bold">1.</span>
                  <span>Meet at high-traffic campus landmarks (Library lobby, Student Union, Quad).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#292D32] font-bold">2.</span>
                  <span>Inspect books and test electronic devices before making peer payment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#292D32] font-bold">3.</span>
                  <span>All buyer-seller communication is saved securely in your Inquiries inbox.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation & Inquiry Checkout Modal */}
      <AnimatePresence>
        {checkoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#E5E0D7] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {successResult ? (
                /* Success Screen */
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-[#ECE7DE] text-[#292D32] border border-[#E5E0D7] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-[#B9A58A]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#292D32] tracking-tight">
                    Inquiries Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7075] leading-relaxed max-w-sm mx-auto">
                    We've notified the seller(s) with your interest. You can now chat, negotiate, and coordinate campus handovers in your Inquiries dashboard.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setCheckoutModalOpen(false);
                        navigate('/dashboard/inquiries');
                      }}
                      className="flex-1 py-3 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#B9A58A]/30 transition-all cursor-pointer"
                    >
                      View Inquiries Inbox
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutModalOpen(false);
                        navigate('/browse');
                      }}
                      className="flex-1 py-3 bg-[#ECE7DE] hover:bg-[#E5E0D7] text-[#292D32] font-bold text-xs sm:text-sm rounded-xl border border-[#E5E0D7] transition-all cursor-pointer"
                    >
                      Keep Browsing
                    </button>
                  </div>
                </div>
              ) : (
                /* Inquiry Form */
                <form onSubmit={handleConfirmInterest} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D7]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#292D32] text-[#B9A58A] flex items-center justify-center font-bold text-xs border border-[#B9A58A]/30">
                        🤝
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[#292D32]">
                        Confirm Interest & Contact Seller(s)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutModalOpen(false)}
                      className="text-[#6B7075] hover:text-[#292D32] text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-[#6B7075]">
                    You are confirming interest for <strong>{cart.length} item(s)</strong> with an estimated total of <strong>{formatPrice(summary.total)}</strong>.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-[#292D32] uppercase tracking-wider mb-1.5">
                      Personalize Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Hi, I am interested in buying your listed item. Can we meet on campus around the Library / Quad tomorrow?"
                      className="w-full text-xs sm:text-sm border border-[#E5E0D7] rounded-xl p-3 outline-none focus:border-[#B9A58A] focus:ring-2 focus:ring-[#B9A58A]/20 text-[#292D32] bg-white"
                    />
                  </div>

                  <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5E0D7] text-xs text-[#6B7075] space-y-1">
                    <p className="font-bold text-[#292D32]">Next Steps:</p>
                    <p>• The seller receives your inquiry immediately.</p>
                    <p>• Discuss meetup timing and inspect the item on campus.</p>
                    <p>• Complete payment directly with the student via Cash or UPI.</p>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutModalOpen(false)}
                      className="flex-1 py-3 bg-[#ECE7DE] hover:bg-[#E5E0D7] text-[#292D32] font-bold text-xs sm:text-sm rounded-xl border border-[#E5E0D7] transition-all cursor-pointer"
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-[#292D32] hover:bg-[#1F2226] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#B9A58A]/30 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Sending Inquiries...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#B9A58A]" />
                          <span>Send Inquiry & Confirm</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Cart;

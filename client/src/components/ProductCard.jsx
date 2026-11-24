import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Sparkles, CheckCircle2, ShoppingCart, Check, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice, calculateDiscount, formatDate, getMediaUrl, handleImageError, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/formatters';
import { useFavourites } from '../context/FavouriteContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { isFavourited, toggleFavourite } = useFavourites();
  const { isInCart, addToCart } = useCart();
  const fav = isFavourited(product.id);
  const inCart = isInCart(product.id);
  const discount = calculateDiscount(product.price, product.original_price);
  const isOwner = !!(user && product.seller_id && user.id === product.seller_id);

  const getConditionStyle = (cond) => {
    switch (cond) {
      case 'Brand New':
        return 'bg-[#ECE7DE] text-[#292D32] border-[#E5E0D7] font-bold';
      case 'Like New':
        return 'bg-[#FAF8F5] text-[#292D32] border-[#E5E0D7] font-semibold';
      case 'Good':
        return 'bg-[#FAF8F5] text-[#6B7075] border-[#E5E0D7] font-medium';
      case 'Fair':
        return 'bg-[#ECE7DE] text-[#6B7075] border-[#E5E0D7] font-medium';
      default:
        return 'bg-[#ECE7DE] text-[#292D32] border-[#E5E0D7] font-medium';
    }
  };

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(product);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart || product.status === 'sold') return;
    addToCart(product);
  };

  const isSold = product.status === 'sold';

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative bg-white rounded-3xl border border-[#E5E0D7] shadow-subtle hover:shadow-card-hover hover:border-[#B9A58A]/60 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE7DE] block">
        <img
          src={getMediaUrl(product.primary_image, DEFAULT_PRODUCT_PLACEHOLDER)}
          alt={product.title}
          onError={handleImageError}
          className={`w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out ${
            isSold ? 'grayscale contrast-125' : ''
          }`}
          loading="lazy"
        />

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-[#292D32]/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-[#292D32] text-white border border-[#E5E0D7] font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Condition & Discount Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`text-[11px] px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${getConditionStyle(product.product_condition)}`}>
            {product.product_condition}
          </span>
          {discount > 0 && !isSold && (
            <span className="bg-[#292D32] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm w-fit tracking-wide border border-[#B9A58A]/40">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Favourite Button with micro-animation */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleHeartClick}
          aria-label="Add to favourites"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-md text-[#6B7075] hover:text-rose-500 shadow-md hover:shadow-lg transition-all z-10 border border-[#E5E0D7] cursor-pointer"
        >
          <Heart className={`w-4 h-4 transition-colors ${fav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </motion.button>

        {/* Category Pill */}
        {product.category_name && (
          <div className="absolute bottom-3 left-3 bg-[#292D32]/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/15">
            {product.category_name}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Label */}
          {product.category_name && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B68] block mb-1">
              {product.category_name}
            </span>
          )}

          <Link to={`/products/${product.id}`} className="block transition-colors">
            <h3 className="font-bold text-[#292D32] text-sm line-clamp-2 leading-snug group-hover:text-[#603719] transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#292D32] tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-xs text-[#6B7075] line-through font-medium">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-3.5 pt-3 border-t border-[#E5E0D7] flex items-center justify-between text-xs text-[#6B7075]">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-[#B9A58A] flex-shrink-0" />
            <span className="truncate font-medium text-[#6B7075]">
              {product.campus || product.seller_campus || 'Main Campus'}
            </span>
          </div>
          <span className="text-[11px] text-[#6B7075] flex-shrink-0">
            {formatDate(product.created_at)}
          </span>
        </div>

        {/* Add to Cart or Owner Manage Button */}
        <div className="mt-3">
          {isOwner ? (
            <Link
              to={`/edit-product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2.5 px-3 rounded-xl bg-[#ECE7DE] hover:bg-[#E5E0D7] text-[#292D32] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#E5E0D7] transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#B9A58A]" />
              <span>Manage Your Listing</span>
            </Link>
          ) : isSold ? (
            <button
              disabled
              className="w-full py-2.5 px-3 rounded-xl bg-[#ECE7DE] text-[#6B7075] text-xs font-semibold cursor-not-allowed border border-[#E5E0D7]"
            >
              Sold Out
            </button>
          ) : inCart ? (
            <button
              onClick={handleCartClick}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F1] text-[#603719] border border-[#603719]/40 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-default"
            >
              <Check className="w-3.5 h-3.5 text-[#603719]" />
              <span>Added to Cart</span>
            </button>
          ) : (
            <button
              onClick={handleCartClick}
              className="w-full py-2.5 px-3 rounded-xl bg-[#603719] hover:bg-[#442514] active:bg-[#2E180D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-white/90" />
              <span>Add to Instant cart</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

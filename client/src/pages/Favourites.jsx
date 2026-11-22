import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { useFavourites } from '../context/FavouriteContext';

const fallbackFavourites = [
  {
    id: 1,
    title: 'Casio FX-991EX Classwiz Scientific Calculator',
    price: 850,
    original_price: 1595,
    product_condition: 'Like New',
    campus: 'North Campus Hostel 4',
    category_name: 'Electronics',
    primary_image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Logitech K380 Multi-Device Bluetooth Wireless Keyboard',
    price: 1400,
    original_price: 2895,
    product_condition: 'Like New',
    campus: 'East Campus Wing A',
    category_name: 'Electronics',
    primary_image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }
];

const Favourites = () => {
  const { favouriteIds } = useFavourites();
  const [favouriteProducts, setFavouriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favourites');
      if (res.data.success && res.data.data) {
        setFavouriteProducts(res.data.data);
      } else {
        setFavouriteProducts(fallbackFavourites);
      }
    } catch (err) {
      setFavouriteProducts(fallbackFavourites);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavProducts();
  }, [favouriteIds]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">
        <div>
          <h1 className="text-2xl font-black text-[#292D32] tracking-tight flex items-center gap-2">
            <span>Saved Wishlist</span>
            <span className="text-xs bg-[#ECE7DE] text-[#292D32] font-extrabold px-3 py-0.5 rounded-full border border-[#E5E0D7]">
              {favouriteProducts.length} items
            </span>
          </h1>
          <p className="text-xs text-[#6B7075] mt-1">Keep track of interesting college listings you want to purchase</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-[#E5E0D7] animate-pulse h-64"></div>
          ))}
        </div>
      ) : favouriteProducts.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {favouriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Browse textbooks, lecture notes, electronics and tap the heart icon on any product to save it here."
          actionText="Explore Campus Marketplace"
          actionLink="/browse"
        />
      )}
    </div>
  );
};

export default Favourites;

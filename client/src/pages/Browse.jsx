import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Sparkles,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { formatItemCount } from '../utils/formatters';

// Fallback categories & products for seamless UX
const fallbackCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics' },
  { id: 2, name: 'Books', slug: 'books' },
  { id: 3, name: 'Notes', slug: 'notes' },
  { id: 4, name: 'Furniture', slug: 'furniture' },
  { id: 5, name: 'Sports Equipment', slug: 'sports-equipment' },
  { id: 6, name: 'Fashion', slug: 'fashion' },
  { id: 7, name: 'Accessories', slug: 'accessories' },
  { id: 8, name: 'Other Products', slug: 'other-products' }
];

const fallbackProducts = [
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
    id: 2,
    title: 'Introduction to Algorithms (CLRS 3rd Edition)',
    price: 650,
    original_price: 1250,
    product_condition: 'Good',
    campus: 'North Campus Hostel 4',
    category_name: 'Books',
    primary_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Complete Electrical Machines & Power Systems Notes (Sem 4 & 5)',
    price: 250,
    original_price: 500,
    product_condition: 'Like New',
    campus: 'South Campus Hostel 2',
    category_name: 'Notes',
    primary_image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Ergonomic Wooden Foldable Study Bed Desk',
    price: 450,
    original_price: 999,
    product_condition: 'Good',
    campus: 'South Campus Hostel 2',
    category_name: 'Furniture',
    primary_image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Yonex Nanoray 7000 Badminton Racket with Cover',
    price: 1100,
    original_price: 2400,
    product_condition: 'Like New',
    campus: 'East Campus Wing A',
    category_name: 'Sports Equipment',
    primary_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
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
  },
  {
    id: 7,
    title: 'Official College Navy Blue Hoodie - Size L',
    price: 550,
    original_price: 1200,
    product_condition: 'Like New',
    campus: 'North Campus Hostel 4',
    category_name: 'Fashion',
    primary_image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    title: 'Wildcraft 35L Water-Resistant Campus Backpack',
    price: 750,
    original_price: 1899,
    product_condition: 'Good',
    campus: 'South Campus Hostel 2',
    category_name: 'Accessories',
    primary_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 8, totalPages: 1 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Sync URL searchParams to filter state when URL changes (e.g. from category click on Home)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlCondition = searchParams.get('condition') || '';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlSortBy = searchParams.get('sortBy') || 'newest';
    const urlPage = parseInt(searchParams.get('page')) || 1;

    setCategory(prev => prev !== urlCategory ? urlCategory : prev);
    setSearch(prev => prev !== urlSearch ? urlSearch : prev);
    setCondition(prev => prev !== urlCondition ? urlCondition : prev);
    setMinPrice(prev => prev !== urlMinPrice ? urlMinPrice : prev);
    setMaxPrice(prev => prev !== urlMaxPrice ? urlMaxPrice : prev);
    setSortBy(prev => prev !== urlSortBy ? urlSortBy : prev);
    setPage(prev => prev !== urlPage ? urlPage : prev);
  }, [searchParams]);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);
    if (page > 1) params.set('page', page);

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [search, category, condition, minPrice, maxPrice, sortBy, page]);

  // Fetch Categories
  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setCategories(res.data.data);
        } else {
          setCategories(fallbackCategories);
        }
      })
      .catch(() => setCategories(fallbackCategories));
  }, []);

  // Fetch Filtered Products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category) queryParams.append('category', category);
        if (condition) queryParams.append('condition', condition);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (sortBy) queryParams.append('sortBy', sortBy);
        queryParams.append('page', page);
        queryParams.append('limit', 12);

        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.data?.success && res.data.data) {
          setProducts(res.data.data);
          if (res.data.pagination) setPagination(res.data.pagination);
        } else {
          filterFallbackProducts();
        }
      } catch (error) {
        filterFallbackProducts();
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [search, category, condition, minPrice, maxPrice, sortBy, page]);

  // Client-side filtering fallback
  const filterFallbackProducts = () => {
    let filtered = [...fallbackProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q)
      );
    }

    if (category) {
      filtered = filtered.filter(p =>
        p.category_name.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (condition) {
      filtered = filtered.filter(p => p.product_condition === condition);
    }

    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
    setPagination({ page: 1, limit: 12, total: filtered.length, totalPages: 1 });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  const conditionsList = ['Brand New', 'Like New', 'Good', 'Fair'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 bg-[#F3EFE7]">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B1E21] via-[#292D32] to-[#626e7d] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-[#B9A58A]/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#B9A58A]/20 text-[#ECE7DE] border border-[#B9A58A]/40 px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#B9A58A]" />
            <span>Campus Verified Listings</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Explore All Campus Listings
          </h1>
          <p className="text-xs sm:text-sm text-[#ECE7DE]/90 mt-2">
            Showing {pagination.total} second-hand student items ready for safe campus handover
          </p>
        </div>

        {/* Search Input in Header Banner */}
        <div className="mt-6 max-w-xl">
          <div className="relative flex items-center bg-white rounded-2xl shadow-md p-1.5 border border-[#E5E0D7]">
            <Search className="w-5 h-5 text-[#6B7075] ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by keywords, subject, brand or author..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm text-[#292D32] placeholder-[#6B7075] outline-none bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-1.5 text-[#6B7075] hover:text-[#292D32] mr-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E0D7]">

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden inline-flex items-center gap-2 bg-white border border-[#E5E0D7] px-4 py-2.5 rounded-xl text-xs font-bold text-[#292D32] shadow-xs active:bg-[#ECE7DE] cursor-pointer"
        >
          <Filter className="w-4 h-4 text-[#B9A58A]" />
          <span>Filters {category || condition || minPrice || maxPrice ? '(Active)' : ''}</span>
        </button>

        {/* Active Filter Chips */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap text-xs">
          {category && (
            <span className="inline-flex items-center gap-1.5 bg-white text-[#292D32] border border-[#E5E0D7] px-3 py-1 rounded-full font-bold shadow-2xs">
              <span>Category: {category}</span>
              <button onClick={() => setCategory('')} className="cursor-pointer"><X className="w-3.5 h-3.5 text-[#6B7075]" /></button>
            </span>
          )}
          {condition && (
            <span className="inline-flex items-center gap-1.5 bg-white text-[#292D32] border border-[#E5E0D7] px-3 py-1 rounded-full font-bold shadow-2xs">
              <span>Condition: {condition}</span>
              <button onClick={() => setCondition('')} className="cursor-pointer"><X className="w-3.5 h-3.5 text-[#6B7075]" /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 bg-white text-[#292D32] border border-[#E5E0D7] px-3 py-1 rounded-full font-bold shadow-2xs">
              <span>Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}</span>
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="cursor-pointer"><X className="w-3.5 h-3.5 text-[#6B7075]" /></button>
            </span>
          )}
          {(category || condition || minPrice || maxPrice || search) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#6B7075] hover:text-[#292D32] flex items-center gap-1 ml-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#B9A58A]" />
              <span>Reset All</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-bold text-[#6B7075] hidden sm:inline">Sort By:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-white border border-[#E5E0D7] rounded-xl px-3.5 py-2 text-xs font-bold text-[#292D32] focus:outline-none focus:border-[#B9A58A] shadow-2xs"
            >
              <option value="newest">Recently Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="flex flex-col md:flex-row gap-8">

        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-[#E5E0D7] p-5 shadow-subtle space-y-6 sticky top-24">

            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D7]">
              <div className="flex items-center gap-2 font-black text-sm text-[#292D32]">
                <SlidersHorizontal className="w-4 h-4 text-[#B9A58A]" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#6B7075] hover:text-[#292D32] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-[#B9A58A]" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#292D32] mb-3">
                Categories
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setCategory(''); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${category === ''
                    ? 'bg-[#292D32] text-white font-bold'
                    : 'text-[#6B7075] hover:bg-[#ECE7DE] hover:text-[#292D32]'
                    }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${category === cat.slug
                      ? 'bg-[#292D32] text-white font-bold'
                      : 'text-[#6B7075] hover:bg-[#ECE7DE] hover:text-[#292D32]'
                      }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.product_count !== undefined && (
                      <span className={`text-[10px] flex-shrink-0 ml-1.5 font-medium ${category === cat.slug ? 'text-white/80' : 'text-[#8A7B68]'}`}>
                        {formatItemCount(cat.product_count)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div className="pt-3 border-t border-[#E5E0D7]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#292D32] mb-3">
                Condition
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setCondition(''); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${condition === ''
                    ? 'bg-[#292D32] text-white font-bold'
                    : 'text-[#6B7075] hover:bg-[#ECE7DE] hover:text-[#292D32]'
                    }`}
                >
                  Any Condition
                </button>
                {conditionsList.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => { setCondition(cond); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${condition === cond
                      ? 'bg-[#292D32] text-white font-bold'
                      : 'text-[#6B7075] hover:bg-[#ECE7DE] hover:text-[#292D32]'
                      }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="pt-3 border-t border-[#E5E0D7]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#292D32] mb-3">
                Price Range (₹)
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-1/2 text-xs border border-[#E5E0D7] rounded-xl px-2.5 py-2 outline-none focus:border-[#B9A58A] text-[#292D32]"
                />
                <span className="text-[#6B7075] text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-1/2 text-xs border border-[#E5E0D7] rounded-xl px-2.5 py-2 outline-none focus:border-[#B9A58A] text-[#292D32]"
                />
              </div>

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice('500'); setPage(1); }}
                  className="text-[10px] font-bold bg-[#ECE7DE] hover:bg-[#E5E0D7] px-2.5 py-1 rounded-lg text-[#292D32] transition-colors cursor-pointer"
                >
                  Under ₹500
                </button>
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice('2000'); setPage(1); }}
                  className="text-[10px] font-bold bg-[#ECE7DE] hover:bg-[#E5E0D7] px-2.5 py-1 rounded-lg text-[#292D32] transition-colors cursor-pointer"
                >
                  Under ₹2k
                </button>
                <button
                  onClick={() => { setMinPrice('2000'); setMaxPrice(''); setPage(1); }}
                  className="text-[10px] font-bold bg-[#ECE7DE] hover:bg-[#E5E0D7] px-2.5 py-1 rounded-lg text-[#292D32] transition-colors cursor-pointer"
                >
                  ₹2k+
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-[#E5E0D7] animate-pulse h-80">
                  <div className="aspect-[4/3] bg-[#ECE7DE] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-[#ECE7DE] rounded w-3/4 mb-2"></div>
                  <div className="h-5 bg-[#ECE7DE] rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#E5E0D7]">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="p-2 rounded-xl border border-[#E5E0D7] disabled:opacity-40 hover:bg-[#ECE7DE] transition-colors text-[#292D32] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 text-xs font-bold text-[#292D32]">
                    Page {page} of {pagination.totalPages}
                  </div>

                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
                    className="p-2 rounded-xl border border-[#E5E0D7] disabled:opacity-40 hover:bg-[#ECE7DE] transition-colors text-[#292D32] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="No campus listings matched your filter"
              description="Try adjusting your keyword search, removing price constraints, or exploring all categories."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </main>

      </div>

      {/* Mobile Filters Slide-over / Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-[#292D32]/70 backdrop-blur-xs"
            ></motion.div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 border-l border-[#E5E0D7]"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D7]">
                  <h3 className="font-extrabold text-base text-[#292D32]">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 text-[#6B7075] hover:text-[#292D32] cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#292D32] mb-2">Categories</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => { setCategory(''); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${category === '' ? 'bg-[#292D32] text-white font-bold' : 'text-[#6B7075] hover:bg-[#ECE7DE]'}`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setCategory(c.slug); setMobileFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${category === c.slug ? 'bg-[#292D32] text-white font-bold' : 'text-[#6B7075] hover:bg-[#ECE7DE]'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#292D32] mb-2">Condition</h4>
                  <div className="space-y-1">
                    {conditionsList.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => { setCondition(cond); setMobileFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${condition === cond ? 'bg-[#292D32] text-white font-bold' : 'text-[#6B7075] hover:bg-[#ECE7DE]'}`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E0D7]">
                <button
                  onClick={() => { handleResetFilters(); setMobileFilterOpen(false); }}
                  className="w-full py-2.5 bg-[#ECE7DE] text-[#292D32] text-xs font-bold rounded-xl mb-2 hover:bg-[#E5E0D7] cursor-pointer"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#292D32] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#1F2226] cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Browse;

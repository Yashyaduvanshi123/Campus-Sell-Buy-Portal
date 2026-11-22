import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  MessageSquare,
  HeartHandshake,
  ArrowUpRight,
  Lock,
  BadgePercent,
  MessageCircle,
  CheckCircle2,
  Users,
  Sparkles
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatItemCount } from '../utils/formatters';

// 6 Photographic categories matching Figma reference
const categoryCards = [
  {
    id: 1,
    title: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700&h=500&fit=crop&auto=format'
  },
  {
    id: 2,
    title: 'Textbooks',
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=700&h=500&fit=crop&auto=format'
  },
  {
    id: 3,
    title: 'Furniture',
    slug: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=500&fit=crop&auto=format'
  },
  {
    id: 4,
    title: 'Bags & Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&h=500&fit=crop&auto=format'
  },
  {
    id: 5,
    title: 'Sports & Fitness',
    slug: 'sports-equipment',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&h=500&fit=crop&auto=format'
  },
  {
    id: 6,
    title: 'More Categories',
    slug: '',
    isMore: true,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&h=500&fit=crop&auto=format'
  }
];

// 5 Featured products matching Figma Screenshot 4
const fallbackFeatured = [
  {
    id: 101,
    title: 'HP Pavilion Laptop',
    price: 28000,
    original_price: 45000,
    product_condition: 'Like new',
    campus: 'North campus',
    category_name: 'ELECTRONICS',
    primary_image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    title: 'CSE Textbook Set',
    price: 1500,
    original_price: 3200,
    product_condition: 'Good',
    campus: 'Central library',
    category_name: 'TEXTBOOKS',
    primary_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 103,
    title: 'Ergonomic Study Chair',
    price: 2999,
    original_price: 5500,
    product_condition: 'Like new',
    campus: 'East hostel',
    category_name: 'FURNITURE',
    primary_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 104,
    title: 'Casio fx-991EX',
    price: 1899,
    original_price: 2400,
    product_condition: 'Brand new',
    campus: 'Tech block',
    category_name: 'ELECTRONICS',
    primary_image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 105,
    title: 'Campus Backpack',
    price: 799,
    original_price: 1500,
    product_condition: 'Good',
    campus: 'South campus',
    category_name: 'ACCESSORIES',
    primary_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }
];

// 4 Recently listed products matching Figma Screenshot 4
const fallbackRecent = [
  {
    id: 201,
    title: 'Campus Backpack',
    price: 799,
    original_price: 1500,
    product_condition: 'Good',
    campus: 'North hostel 3',
    category_name: 'ACCESSORIES',
    primary_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 202,
    title: 'Sony WH-1000XM4',
    price: 9500,
    original_price: 18000,
    product_condition: 'Like new',
    campus: 'Central campus',
    category_name: 'ELECTRONICS',
    primary_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 203,
    title: 'Wooden Bedside Table',
    price: 1100,
    original_price: 2200,
    product_condition: 'Good',
    campus: 'East wing',
    category_name: 'FURNITURE',
    primary_image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 204,
    title: 'Badminton Racket Pair',
    price: 1100,
    original_price: 2500,
    product_condition: 'Good',
    campus: 'Sports complex',
    category_name: 'SPORTS',
    primary_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }
];

const Home = () => {
  const shouldReduceMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState(fallbackFeatured);
  const [recentProducts, setRecentProducts] = useState(fallbackRecent);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, featRes, recRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: { success: false } })),
          api.get('/products?limit=5&sortBy=popular').catch(() => ({ data: { success: false } })),
          api.get('/products?limit=4&sortBy=newest').catch(() => ({ data: { success: false } }))
        ]);

        if (catRes.data?.success && Array.isArray(catRes.data.data)) {
          setCategories(catRes.data.data);
        }

        if (featRes.data?.success && featRes.data.data?.length >= 3) {
          setFeaturedProducts(featRes.data.data.slice(0, 5));
        }

        if (recRes.data?.success && recRes.data.data?.length > 0) {
          setRecentProducts(recRes.data.data.slice(0, 4));
        }
      } catch (error) {
        // Fallbacks already in state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dynamic count formatting matching exact conditions:
  // - 0 -> "No items yet"
  // - 1-50 -> exact count e.g. "12 items", "24 items"
  // - >50 -> "50+ items"
  const getCategoryCountDisplay = (slug, isMore) => {
    if (!categories || categories.length === 0) {
      return 'No items yet';
    }

    if (isMore) {
      const primarySlugs = ['electronics', 'books', 'furniture', 'accessories', 'sports-equipment'];
      const otherCount = categories
        .filter(c => !primarySlugs.includes(c.slug))
        .reduce((sum, c) => sum + (parseInt(c.product_count, 10) || 0), 0);
      return formatItemCount(otherCount);
    }

    const matched = categories.find(c => c.slug === slug);
    const count = matched ? (parseInt(matched.product_count, 10) || 0) : 0;
    return formatItemCount(count);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="-mt-20 pb-20">

      {/* 1. Hero Section - Extends to the very top behind the transparent navbar */}
      <section className="relative overflow-hidden min-h-[500px] lg:min-h-[760px] pt-20 sm:pt-24 lg:pt-24 flex items-center bg-[#292D32]">

        {/* Real Campus Student Photography Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/hero-campus.jpg"
            alt="Students on university campus"
            className="w-full h-full object-cover object-[center_30%] lg:object-[center_25%]"
          />
          {/* Subtle dark gradient overlay on the left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 via-0% to-transparent"></div>

          {/* Low, subtle bottom fade into the warm ivory background */}
          <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 lg:h-[4rem] pointer-events-none bg-gradient-to-b from-transparent via-[#F3EFE7]/30 via-75% to-[#F3EFE7]"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 sm:pb-28 lg:pb-36 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Column: Heading, Search & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 xl:col-span-6 space-y-6"
            >
              {/* Main Headline - Matches Screenshot 1 */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.12]">
                Good finds. <br />
                <span className="text-[#B9A58A] font-black">Closer than ever.</span>
              </h1>

              {/* Subtitle - Matches Screenshot 1 */}
              <p className="text-sm sm:text-base text-[#ECE7DE]/90 leading-relaxed max-w-xl font-normal">
                Buy and sell second-hand gear within your college campus. Turn unused textbooks, calculators, dorm furniture and electronics into cash — with verified students.
              </p>

              {/* Search Bar - Warm White Pill with Dark Chocolate Button */}
              <div className="pt-2">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl border border-white/50 max-w-xl"
                >
                  <div className="relative flex-1 flex items-center pl-3">
                    <Search className="w-5 h-5 text-[#6B7075] flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="What are you looking for? Laptop, textbook..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-4 py-2.5 text-xs sm:text-sm text-[#292D32] placeholder-[#6B7075] outline-none bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#442514] hover:bg-[#321B0E] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl sm:rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Popular Keywords Under Search Bar - Matches Screenshot 2 */}
                <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-white/90 pl-1 font-medium">
                  <span className="text-white font-bold">Popular:</span>
                  <button
                    onClick={() => navigate('/browse?search=laptop')}
                    className="bg-black/35 hover:bg-black/50 border border-white/20 px-3.5 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    Laptops
                  </button>
                  <button
                    onClick={() => navigate('/browse?category=books')}
                    className="bg-black/35 hover:bg-black/50 border border-white/20 px-3.5 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    Textbooks
                  </button>
                  <button
                    onClick={() => navigate('/browse?search=calculator')}
                    className="bg-black/35 hover:bg-black/50 border border-white/20 px-3.5 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    Calculators
                  </button>
                  <button
                    onClick={() => navigate('/browse?category=furniture')}
                    className="bg-black/35 hover:bg-black/50 border border-white/20 px-3.5 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    Hostel Essentials
                  </button>
                </div>
              </div>

              {/* Action Buttons - Matches Screenshot 2 */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/add-product"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF8F5] text-[#292D32] font-bold text-sm px-7 py-3.5 rounded-full shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="font-extrabold text-[#292D32]">Start selling </span>
                  <ArrowRight className="w-4 h-4 text-[#292D32]" />
                </Link>
                <Link
                  to="/browse"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black/25 hover:bg-black/40 text-white border border-white/30 font-semibold text-sm px-7 py-3.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
                >
                  <span>Browse all listings</span>
                </Link>
              </div>

            </motion.div>

            {/* Right Column: Floating Product Cards - Subtle vertical floating animation & static tilts */}
            <div className="lg:col-span-5 xl:col-span-6 relative h-[380px] sm:h-[440px] lg:h-[480px] pointer-events-none sm:pointer-events-auto">
              {/* Floating Card 1: Semester Textbooks (-4deg static tilt, reduced ~18%, shifted down ~40px and right ~50px) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  y: shouldReduceMotion ? 0 : [0, -12, 0]
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: shouldReduceMotion
                    ? { duration: 0 }
                    : {
                      duration: 5.0,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0
                    }
                }}
                className="absolute top-16 left-8 sm:left-14 lg:left-20 z-10"
              >
                <div
                  className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/80 flex flex-col gap-2 cursor-pointer w-36 sm:w-40 lg:w-[165px] transition-shadow hover:shadow-2xl"
                  style={{ transform: 'rotate(-4deg)', willChange: 'transform' }}
                  onClick={() => navigate('/browse?category=books')}
                >
                  <div className="h-24 w-full rounded-xl bg-[#292D32] text-white flex flex-col items-center justify-center p-2.5 relative overflow-hidden shadow-inner">
                    <div className="text-xl mb-1">📖</div>
                    <div className="text-[9px] font-bold text-center text-white/90">milk and honey</div>
                    <div className="text-[7px] text-white/60">rupi kaur</div>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <h4 className="text-[11px] font-bold text-[#292D32] truncate">Semester textbooks</h4>
                    <p className="text-xs font-black text-[#292D32]">₹1,500</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2: HP Pavilion Laptop (3deg static tilt, reduced ~18%, shifted down ~45px and right) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  y: shouldReduceMotion ? 0 : [0, -13, 0]
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: shouldReduceMotion
                    ? { duration: 0 }
                    : {
                      duration: 5.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.4
                    }
                }}
                className="absolute top-48 right-0 sm:right-2 lg:right-4 z-10"
              >
                <div
                  className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/80 flex flex-col gap-2 cursor-pointer w-40 sm:w-48 lg:w-[190px] transition-shadow hover:shadow-2xl"
                  style={{ transform: 'rotate(3deg)', willChange: 'transform' }}
                  onClick={() => navigate('/browse?search=laptop')}
                >
                  <div className="h-20 sm:h-22 w-full rounded-xl bg-[#ECE7DE] flex items-center justify-center relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80"
                      alt="HP Pavilion Laptop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <h4 className="text-[11px] font-bold text-[#292D32]">HP Pavilion</h4>
                    <p className="text-xs font-black text-[#292D32]">₹28,000</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 3: Sony Headphones with Yellow Card (-3deg static tilt, reduced ~18%, shifted down ~40px and right ~55px) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  y: shouldReduceMotion ? 0 : [0, -11, 0]
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: shouldReduceMotion
                    ? { duration: 0 }
                    : {
                      duration: 4.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 2.6
                    }
                }}
                className="absolute bottom-2 sm:bottom-4 lg:bottom-5 left-12 sm:left-20 lg:left-28 z-10"
              >
                <div
                  className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/80 flex flex-col gap-2 cursor-pointer w-36 sm:w-44 lg:w-[175px] transition-shadow hover:shadow-2xl"
                  style={{ transform: 'rotate(-3deg)', willChange: 'transform' }}
                  onClick={() => navigate('/browse?search=headphones')}
                >
                  <div className="h-20 w-full rounded-xl bg-[#F4B41A] flex items-center justify-center p-2 relative overflow-hidden">
                    <span className="text-3xl filter drop-shadow-md">🎧</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <h4 className="text-[11px] font-bold text-[#292D32]">Sony headphones</h4>
                    <p className="text-xs font-black text-[#292D32]">₹9,500</p>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* Subsequent Sections on Warm Ivory #F3EFE7 */}
      <div className="space-y-20 sm:space-y-28 mt-12 sm:mt-16">

        {/* 2. Category Section: "Find it by category" - Exact match to Figma Reference */}
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292D32] tracking-tight">
                Find it by category
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7075] mt-1">
                The things students need most, already waiting a short walk away.
              </p>
            </div>
            <Link
              to="/browse"
              className="text-xs sm:text-sm font-semibold text-[#8A5A36] hover:text-[#603719] flex items-center gap-1 group flex-shrink-0"
            >
              <span>View everything</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#8A5A36]" />
            </Link>
          </div>

          {/* 6 Category Cards matching exact width, font size and hover styling of Figma reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {categoryCards.map((cat) => (
              <Link
                key={cat.id}
                to={cat.slug ? `/browse?category=${cat.slug}` : '/browse'}
                className="group relative h-64 overflow-hidden rounded-[24px] bg-[#292D32]/10 shadow-sm hover:shadow-xl transition-all duration-300 block w-full"
              >
                {/* Photographic Background with smooth outward hover zoom */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>

                {/* Bottom Content & Circular Arrow Button */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between text-white">
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight font-heading">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/65 font-normal">
                      {getCategoryCountDisplay(cat.slug, cat.isMore)}
                    </p>
                  </div>

                  {/* Circular Arrow Button - turns solid white on card hover */}
                  <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-[#292D32] flex-shrink-0 shadow-sm">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. How It Works Section: "From shelf to sold" - Matches Screenshot 3 & 4 */}
        <section id="how-it-works-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#8A7B68] tracking-widest uppercase block mb-1.5">
              THREE SIMPLE STEPS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292D32] tracking-tight">
              From shelf to sold
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7075] mt-2">
              No shipping hassles, no platform fees. Just simple student-to-student transactions.
            </p>
          </div>

          {/* 3 Steps connected horizontally by dashed line on desktop */}
          <div className="relative">
            {/* Desktop horizontal dashed connecting line */}
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px border-t-2 border-dashed border-[#D9CFC1] z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

              {/* Step 1: List your item */}
              <div className="flex flex-col items-center text-center px-4">
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex items-center justify-center text-[#292D32]">
                    <ShoppingBag className="w-6 h-6 text-[#603719]" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#603719] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#292D32] mb-1.5">
                  List your item
                </h3>
                <p className="text-xs text-[#6B7075] leading-relaxed max-w-xs">
                  Add photos, description, and price. Done in under 60 seconds.
                </p>
              </div>

              {/* Step 2: Find & connect */}
              <div className="flex flex-col items-center text-center px-4">
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex items-center justify-center text-[#292D32]">
                    <MessageSquare className="w-6 h-6 text-[#603719]" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#603719] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    2
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#292D32] mb-1.5">
                  Find & connect
                </h3>
                <p className="text-xs text-[#6B7075] leading-relaxed max-w-xs">
                  Browse campus listings and chat directly with verified students.
                </p>
              </div>

              {/* Step 3: Meet & exchange */}
              <div className="flex flex-col items-center text-center px-4">
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E0D7] shadow-sm flex items-center justify-center text-[#292D32]">
                    <HeartHandshake className="w-6 h-6 text-[#603719]" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#603719] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    3
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-[#292D32] mb-1.5">
                  Meet & exchange
                </h3>
                <p className="text-xs text-[#6B7075] leading-relaxed max-w-xs">
                  Choose a public campus spot and complete a safe in-person transaction.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Featured Listings: "Featured listings" - Matches Screenshot 4 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#8A7B68] tracking-widest uppercase block mb-1.5">
                HANDPICKED FOR CAMPUS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292D32] tracking-tight">
                Featured listings
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7075] mt-1">
                Quality second-hand items from verified students across campus.
              </p>
            </div>
            <Link
              to="/browse?sortBy=popular"
              className="text-xs sm:text-sm font-bold text-[#292D32] hover:text-[#603719] flex items-center gap-1 group flex-shrink-0"
            >
              <span>Browse all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#8A7B68]" />
            </Link>
          </div>

          {/* 5 Cards in a row matching Figma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 5. Campus Trust Banner: "People nearby. Deals that feel right." - Matches Screenshot 4 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#442514] text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl border border-[#603719]/40 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Column: Heading & Subtitle */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#D4C3AC] block">
                  BUILT ON CAMPUS TRUST
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  People nearby. <br />
                  Deals that feel right.
                </h2>
                <p className="text-xs sm:text-sm text-[#E5DED3]/90 leading-relaxed max-w-md">
                  No marketplaces or anonymous sellers — just students passing useful things along in one place.
                </p>
              </div>

              {/* Right Column: 2×2 Grid of 4 Benefit Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Benefit 1 */}
                <div className="bg-[#341C0F]/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#D4C3AC]" />
                    <h3 className="font-bold text-white text-sm">Students only</h3>
                  </div>
                  <p className="text-xs text-[#E5DED3]/80 leading-relaxed">
                    A closed campus ecosystem designed around student life.
                  </p>
                </div>

                {/* Benefit 2 */}
                <div className="bg-[#341C0F]/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4C3AC]" />
                    <h3 className="font-bold text-white text-sm">Safer exchanges</h3>
                  </div>
                  <p className="text-xs text-[#E5DED3]/80 leading-relaxed">
                    Meet on familiar, public campus spots within your community.
                  </p>
                </div>

                {/* Benefit 3 */}
                <div className="bg-[#341C0F]/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgePercent className="w-4 h-4 text-[#D4C3AC]" />
                    <h3 className="font-bold text-white text-sm">Zero platform fees</h3>
                  </div>
                  <p className="text-xs text-[#E5DED3]/80 leading-relaxed">
                    Keep the full value of every sale with zero fees.
                  </p>
                </div>

                {/* Benefit 4 */}
                <div className="bg-[#341C0F]/80 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-[#D4C3AC]" />
                    <h3 className="font-bold text-white text-sm">Direct conversation</h3>
                  </div>
                  <p className="text-xs text-[#E5DED3]/80 leading-relaxed">
                    Agree on details without a middleman.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 6. Recently Listed Section: "Recently listed" - Matches Screenshot 4 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[#8A7B68] tracking-widest uppercase block mb-1.5">
                JUST ARRIVED
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292D32] tracking-tight">
                Recently listed
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7075] mt-1">
                Fresh finds from students across campus, updated daily.
              </p>
            </div>
            <Link
              to="/browse?sortBy=newest"
              className="text-xs sm:text-sm font-bold text-[#292D32] hover:text-[#603719] flex items-center gap-1 group flex-shrink-0"
            >
              <span>Browse all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#8A7B68]" />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;

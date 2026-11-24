import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Home,
  LayoutGrid,
  Tag,
  MessageSquare,
  Info,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  LogIn,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouriteContext';
import { useCart } from '../context/CartContext';
import { getMediaUrl } from '../utils/formatters';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { favouriteIds } = useFavourites();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [navbarImgError, setNavbarImgError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  // Transparent only when on the homepage and not scrolled down
  const isTransparent = isHome && !scrolled;

  // Reset image error when user's profile photo updates
  useEffect(() => {
    setNavbarImgError(false);
  }, [user?.profile_image]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/inquiries/my').then((res) => {
        if (res.data.success) {
          setUnreadInquiries(res.data.unread_count || 0);
        }
      }).catch(() => { });
    }
  }, [isAuthenticated, location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  const scrollToHowItWorks = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('how-it-works-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-none border-b-0 shadow-none outline-none ${isTransparent
        ? 'bg-transparent'
        : 'bg-[#FAF8F5]/95 backdrop-blur-xl'
        }`}
      style={{ border: 'none', borderBottom: 'none', outline: 'none' }}
    >
      <div className="w-full h-[4rem] px-6 sm:px-8 lg:px-10 flex items-center justify-between gap-4">

        {/* Left: Only a circular graduation-cap icon/logo (matches Screenshot 1) */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <Link
            to="/"
            className="flex items-center group flex-shrink-0"
            title="Campus Sell & Buy"
            aria-label="Campus Sell & Buy Home"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${isTransparent
              ? 'bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white'
              : 'bg-[#292D32] text-white hover:bg-[#1F2226]'
              }`}>
              <GraduationCap className="w-5 h-5 -rotate-6 group-hover:rotate-0 transition-transform duration-300" />
            </div>
          </Link>
        </div>

        {/* Center: Center Nav Links (Home, Browse, Sell Item, Inquiries, How It Works) */}
        <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 flex-shrink-0 pr-[650px]">

          {/* Home */}
          <Link
            to="/"
            className={`relative py-1.5 text-xs xl:text-sm font-medium transition-colors ${location.pathname === '/'
              ? (isTransparent ? 'text-white font-semibold' : 'text-[#292D32] font-semibold')
              : (isTransparent ? 'text-white/80 hover:text-white' : 'text-[#6B7075] hover:text-[#292D32]')
              }`}
          >
            <span>Home</span>
          </Link>

          {/* Browse */}
          <Link
            to="/browse"
            className={`relative py-1.5 text-xs xl:text-sm font-medium transition-colors ${location.pathname === '/browse'
              ? (isTransparent ? 'text-white font-semibold' : 'text-[#292D32] font-semibold')
              : (isTransparent ? 'text-white/80 hover:text-white' : 'text-[#6B7075] hover:text-[#292D32]')
              }`}
          >
            <span>Browse</span>
          </Link>

          {/* Sell Item */}
          <Link
            to="/add-product"
            className={`relative py-1.5 text-xs xl:text-sm font-medium transition-colors ${location.pathname === '/add-product'
              ? (isTransparent ? 'text-white font-semibold' : 'text-[#292D32] font-semibold')
              : (isTransparent ? 'text-white/80 hover:text-white' : 'text-[#6B7075] hover:text-[#292D32]')
              }`}
          >
            <span>Sell Item</span>
          </Link>

          {/* Inquiries */}
          <Link
            to={isAuthenticated ? "/dashboard/inquiries" : "/login"}
            className={`relative flex items-center gap-1.5 py-1.5 text-xs xl:text-sm font-medium transition-colors ${location.pathname.includes('/inquiries')
              ? (isTransparent ? 'text-white font-semibold' : 'text-[#292D32] font-semibold')
              : (isTransparent ? 'text-white/80 hover:text-white' : 'text-[#6B7075] hover:text-[#292D32]')
              }`}
          >
            <span>Inquiries</span>
            {unreadInquiries > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9A58A] animate-pulse"></span>
            )}
          </Link>

          {/* How It Works */}
          <a
            href="/#how-it-works-section"
            onClick={scrollToHowItWorks}
            className={`py-1.5 text-xs xl:text-sm font-medium transition-colors cursor-pointer ${isTransparent
              ? 'text-white/80 hover:text-white'
              : 'text-[#6B7075] hover:text-[#292D32]'
              }`}
          >
            <span>How It Works</span>
          </a>
        </nav>

        {/* Right: Cart and Student Profile Avatar (matches Screenshot 1) */}
        <div className="flex-1 flex items-center justify-end ml-auto gap-3.5 sm:gap-4 flex-shrink-0">

          {/* Shopping Cart Button */}
          <Link
            to="/cart"
            className={`relative p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${isTransparent
              ? 'text-white hover:text-white/80'
              : 'text-[#292D32] hover:text-[#292D32]/80'
              }`}
            title="Campus Cart"
            aria-label="View shopping cart"
          >
            <ShoppingCart className="w-5 h-5 drop-shadow-sm" />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border ${isTransparent
                ? 'bg-[#B9A58A] text-[#1A1C1E] border-white/60'
                : 'bg-[#292D32] text-white border-white'
                }`}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* When not logged in: Login and Register buttons */}
          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${isTransparent
                  ? 'text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md'
                  : 'text-[#292D32] border border-[#E5E0D7] hover:bg-[#ECE7DE]'
                  }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-all ${isTransparent
                  ? 'bg-[#B9A58A] hover:bg-[#A48E72] text-[#292D32]'
                  : 'bg-[#292D32] hover:bg-[#1F2226] text-white'
                  }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          ) : (
            /* Student Profile Avatar and Dropdown Arrow (compact) */
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-0 bg-transparent border-none outline-none shadow-none cursor-pointer transition-opacity hover:opacity-85"
                style={{ background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none' }}
                title="Campus Profile"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0 overflow-hidden ${isTransparent
                  ? 'bg-[#292D32] text-white border border-white/30'
                  : 'bg-[#292D32] text-white border border-[#B9A58A]/30'
                  }`}>
                  {user?.profile_image && !navbarImgError ? (
                    <img
                      src={getMediaUrl(user.profile_image)}
                      alt={user.full_name || 'Student Profile'}
                      className="w-full h-full object-cover"
                      onError={() => setNavbarImgError(true)}
                    />
                  ) : (
                    <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'Y'}</span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${isTransparent ? 'text-white/90 drop-shadow-sm' : 'text-[#6B7075]'
                  } ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#E5E0D7] py-2 z-50 overflow-hidden text-[#292D32]"
                  >
                    <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#E5E0D7] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#292D32] text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0 overflow-hidden border border-[#B9A58A]/30">
                        {user?.profile_image && !navbarImgError ? (
                          <img
                            src={getMediaUrl(user.profile_image)}
                            alt={user.full_name || 'Student Profile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'Y'}</span>
                        )}
                      </div>
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#292D32] truncate">{user?.full_name}</p>
                        <p className="text-[11px] text-[#6B7075] truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B9A58A]"></span>
                          <span className="text-[10px] font-bold text-[#292D32] uppercase tracking-wide truncate">
                            {user?.campus || 'Campus Student'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#292D32] hover:bg-[#ECE7DE] hover:text-[#292D32] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#6B7075]" />
                        <span>Student Dashboard</span>
                      </Link>
                      <Link
                        to="/dashboard/my-products"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#292D32] hover:bg-[#ECE7DE] hover:text-[#292D32] transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#6B7075]" />
                        <span>My Listings</span>
                      </Link>
                      <Link
                        to="/favourites"
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#292D32] hover:bg-[#ECE7DE] hover:text-[#292D32] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-[#B9A58A]" />
                          <span>Saved Wishlist</span>
                        </div>
                        {favouriteIds.size > 0 && (
                          <span className="bg-[#B9A58A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {favouriteIds.size}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/dashboard/inquiries"
                        className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#292D32] hover:bg-[#ECE7DE] hover:text-[#292D32] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-[#6B7075]" />
                          <span>Inquiries</span>
                        </div>
                        {unreadInquiries > 0 && (
                          <span className="bg-[#292D32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadInquiries}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#292D32] hover:bg-[#ECE7DE] hover:text-[#292D32] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#6B7075]" />
                        <span>Profile Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 mt-1 border-t border-[#E5E0D7]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${isTransparent
              ? 'text-white hover:bg-white/10'
              : 'text-[#292D32] hover:bg-[#ECE7DE]'
              }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[#E5E0D7]/80 bg-[#FAF8F5]/98 backdrop-blur-xl px-4 pt-3 pb-6 shadow-xl overflow-hidden text-[#292D32]"
          >
            <div className="space-y-1 py-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <Home className="w-4 h-4 text-[#B9A58A]" />
                <span>Home</span>
              </Link>
              <Link
                to="/browse"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <LayoutGrid className="w-4 h-4 text-[#6B7075]" />
                <span>Browse Listings</span>
              </Link>
              <Link
                to="/add-product"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <Tag className="w-4 h-4 text-[#6B7075]" />
                <span>Sell an Item</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-[#B9A58A]" />
                  <span>Campus Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#292D32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/favourites"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#B9A58A]" />
                  <span>Saved Wishlist</span>
                </div>
                {favouriteIds.size > 0 && (
                  <span className="bg-[#B9A58A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {favouriteIds.size}
                  </span>
                )}
              </Link>
              <Link
                to={isAuthenticated ? "/dashboard/inquiries" : "/login"}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#6B7075]" />
                  <span>Inquiries</span>
                </div>
                {unreadInquiries > 0 && (
                  <span className="bg-[#292D32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadInquiries}
                  </span>
                )}
              </Link>
              <a
                href="/#how-it-works-section"
                onClick={scrollToHowItWorks}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]"
              >
                <Info className="w-4 h-4 text-[#6B7075]" />
                <span>How It Works</span>
              </a>
            </div>

            {/* Mobile Auth Actions */}
            <div className="pt-3 mt-2 border-t border-[#E5E0D7] flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E0D7] rounded-xl text-sm font-semibold text-[#292D32] hover:bg-[#ECE7DE]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#292D32] text-white rounded-xl text-sm font-bold shadow-sm"
                  >
                    <UserPlus className="w-4 h-4 text-[#B9A58A]" />
                    <span>Register Account</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#292D32] text-white rounded-xl text-sm font-bold shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 border border-rose-200 bg-white/60 rounded-xl text-sm font-semibold hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

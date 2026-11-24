import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Heart,
  User,
  LogOut,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../utils/formatters';
import api from '../services/api';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadInquiries, setUnreadInquiries] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/inquiries/my');
        if (res.data.success) {
          setUnreadInquiries(res.data.unread_count || 0);
        }
      } catch (e) {
        // Ignore unread fetch failure
      }
    };
    fetchUnread();
  }, []);

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'My Listings', to: '/dashboard/my-products', icon: Package },
    { name: 'Add Product', to: '/add-product', icon: PlusCircle },
    { name: 'Buyer Inquiries', to: '/dashboard/inquiries', icon: MessageSquare, badge: unreadInquiries },
    { name: 'Saved Wishlist', to: '/favourites', icon: Heart },
    { name: 'Profile Settings', to: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3EFE7] text-[#292D32]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Dashboard Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-[#E5E0D7] p-5 shadow-subtle sticky top-24">

              {/* User Mini Profile */}
              <div className="flex items-center gap-3.5 pb-5 border-b border-[#E5E0D7]">
                <div className="w-12 h-12 rounded-2xl bg-[#292D32] text-white font-black flex items-center justify-center text-lg shadow-sm border border-[#B9A58A]/30 overflow-hidden flex-shrink-0">
                  {user?.profile_image ? (
                    <img
                      src={getMediaUrl(user.profile_image)}
                      alt={user.full_name || 'Student Profile'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'inline';
                        }
                      }}
                    />
                  ) : null}
                  <span style={{ display: user?.profile_image ? 'none' : 'inline' }}>
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'Y'}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-extrabold text-[#292D32] truncate">{user?.full_name}</h4>
                  <p className="text-xs text-[#6B7075] truncate font-mono">{user?.student_id}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-[#292D32] bg-[#ECE7DE] px-2.5 py-0.5 rounded-full border border-[#E5E0D7]">
                    <ShieldCheck className="w-3 h-3 text-[#B9A58A]" />
                    <span className="truncate">{user?.campus || 'Campus Student'}</span>
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="mt-5 space-y-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive
                        ? 'bg-[#292D32] text-white shadow-sm shadow-[#292D32]/25'
                        : 'text-[#6B7075] hover:text-[#292D32] hover:bg-[#ECE7DE]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-[#B9A58A]" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge > 0 ? (
                      <span className="bg-[#B9A58A] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </NavLink>
                ))}

                <div className="pt-2 mt-2 border-t border-[#E5E0D7]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Dashboard Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
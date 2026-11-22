import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Check } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#1F130B] text-[#ECE7DE] pt-16 pb-12 border-t border-[#331E12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#331E12]">
          
          {/* Col 1: Brand & Description (Figma Screenshot 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-9 h-9 rounded-full bg-[#2E1A0F] border border-[#52301B] flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5 -rotate-6 text-[#D4C3AC]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Campus Sell & Buy
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#BDB2A3] max-w-sm leading-relaxed">
              A trusted marketplace built for college life. Move useful things around campus, digitally where you study.
            </p>
          </div>

          {/* Col 2: Marketplace Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-[#BDB2A3]">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  Browse all
                </Link>
              </li>
              <li>
                <Link to="/add-product" className="hover:text-white transition-colors">
                  Sell an item
                </Link>
              </li>
              <li>
                <Link to="/dashboard/inquiries" className="hover:text-white transition-colors">
                  My inquiries
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="hover:text-white transition-colors">
                  Saved items
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Popular
            </h4>
            <ul className="space-y-2.5 text-xs text-[#BDB2A3]">
              <li>
                <Link to="/browse?category=electronics" className="hover:text-white transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/browse?category=books" className="hover:text-white transition-colors">
                  Textbooks
                </Link>
              </li>
              <li>
                <Link to="/browse?category=furniture" className="hover:text-white transition-colors">
                  Furniture
                </Link>
              </li>
              <li>
                <Link to="/browse?search=calculator" className="hover:text-white transition-colors">
                  Calculators
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Stay in the loop (Newsletter form) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Stay in the loop
            </h4>
            <p className="text-xs text-[#BDB2A3] leading-relaxed">
              Get the latest campus deals and buying tips. No spam.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your campus email..."
                className="flex-1 bg-[#2C190F] border border-[#4A2D1B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#8F8170] outline-none focus:border-[#B9A58A] transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="bg-[#603719] hover:bg-[#78441F] active:bg-[#442514] text-white p-2.5 rounded-xl transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                {subscribed ? <Check className="w-4 h-4 text-emerald-400" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-emerald-400 font-medium">
                Thanks! You're in the campus loop.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policy Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F8170]">
          <p>© {new Date().getFullYear()} Campus Sell & Buy. Built exclusively for students.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs">
            <Link to="/browse" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/browse" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/browse" className="hover:text-white transition-colors">
              Community Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

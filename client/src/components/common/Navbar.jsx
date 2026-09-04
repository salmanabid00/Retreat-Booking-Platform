import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  Home, 
  Calendar, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/button';

const Navbar = ({ unreadNotifications = 0 }) => {
  const { user, logout, isOwner, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' || path === '/properties') {
      return location.pathname === path || (path === '/properties' && location.pathname === '/');
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-950/85 border-b border-stone-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-stone-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-stone-100 flex items-center gap-1">
                Haven<span className="text-amber-400">Hideaway</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium tracking-widest uppercase -mt-1 font-sans">
                Retreat Sanctuary
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-900/70 p-1.5 rounded-2xl border border-stone-800/80">
            <Link
              to="/properties"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/properties' || location.pathname === '/'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              Explore Retreats
            </Link>

            {user && (
              <>
                {/* Customer Bookings */}
                {isCustomer && (
                  <Link
                    to="/my-bookings"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/my-bookings')
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                        : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    My Bookings
                  </Link>
                )}

                {/* Owner Dashboard */}
                {isOwner && (
                  <Link
                    to="/owner-dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/owner-dashboard')
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                        : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                    }`}
                  >
                    <Home className="w-4 h-4 text-amber-400" />
                    Owner Portal
                  </Link>
                )}

                {/* Admin Dashboard */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive('/admin')
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                        : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Control
                  </Link>
                )}

                {/* Real-time Chat */}
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive('/chat')
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Messages
                </Link>
              </>
            )}
          </nav>

          {/* User Auth Action & Profile */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700 transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-950 font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* Owner Create Property Quick Action */}
                {isOwner && (
                  <Link
                    to="/create-property"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    Add Sanctuary
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition cursor-pointer"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-500/30"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-stone-200 leading-tight truncate max-w-[120px]">{user.name}</p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-800 text-amber-300 border border-stone-700">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-900 border border-stone-800 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-stone-800 mb-1">
                        <p className="text-xs font-bold text-stone-100 truncate">{user.name}</p>
                        <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition"
                      >
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-stone-100 hover:bg-stone-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-md shadow-amber-600/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-900 text-stone-300 hover:text-stone-100 border border-stone-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-t border-stone-800 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-200 hover:bg-stone-900"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            Explore Retreats
          </Link>
          {user ? (
            <>
              {isCustomer && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-200 hover:bg-stone-900"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  My Bookings
                </Link>
              )}
              {isOwner && (
                <Link
                  to="/owner-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-200 hover:bg-stone-900"
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  Owner Portal
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-200 hover:bg-stone-900"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Control
                </Link>
              )}
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-200 hover:bg-stone-900"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Messages
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-stone-800 text-xs font-semibold text-stone-200 bg-stone-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-xs font-bold text-stone-950"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

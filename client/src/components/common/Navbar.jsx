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

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-outfit font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Haven<span className="gradient-text">Hideaway</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase -mt-1">
                Retreat Booking Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            <Link
              to="/properties"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive('/properties') || isActive('/')
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Retreats
            </Link>

            {user && (
              <>
                {/* Customer Bookings */}
                {isCustomer && (
                  <Link
                    to="/my-bookings"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive('/my-bookings')
                        ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    My Bookings
                  </Link>
                )}

                {/* Owner Dashboard */}
                {isOwner && (
                  <Link
                    to="/owner-dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive('/owner-dashboard')
                        ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Owner Portal
                  </Link>
                )}

                {/* Admin Dashboard */}
                {isAdmin && (
                  <Link
                    to="/admin-dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive('/admin-dashboard')
                        ? 'bg-purple-600/90 text-white shadow-md shadow-purple-500/20'
                        : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Control
                  </Link>
                )}

                {/* Real-time Chat */}
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/chat')
                      ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
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
                  className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* Owner Create Property Quick Action */}
                {isOwner && (
                  <Link
                    to="/create-property"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Retreat
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">{user.name}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isAdmin ? 'bg-purple-500/20 text-purple-300' :
                        isOwner ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-2xl border border-slate-800 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
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
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium gradient-button text-white shadow-lg shadow-indigo-600/30"
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
              className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <Compass className="w-5 h-5 text-indigo-400" />
            Explore Retreats
          </Link>
          {user ? (
            <>
              {isCustomer && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  My Bookings
                </Link>
              )}
              {isOwner && (
                <Link
                  to="/owner-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <Home className="w-5 h-5 text-emerald-400" />
                  Owner Portal
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  Admin Control
                </Link>
              )}
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Messages
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out ({user.name})
              </button>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl gradient-button text-sm font-medium text-white"
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

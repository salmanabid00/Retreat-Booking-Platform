import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Compass, 
  LayoutDashboard 
} from 'lucide-react';

const OwnerLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Host Overview', path: '/owner-dashboard/overview', icon: LayoutDashboard },
    { name: 'My Properties', path: '/owner-dashboard/properties', icon: Home },
    { name: 'Booking Requests', path: '/owner-dashboard/bookings', icon: Calendar },
    { name: 'Guest Messages', path: '/chat', icon: MessageSquare },
  ];

  const isNavActive = (item) => {
    if (item.path === '/owner-dashboard/overview') {
      return location.pathname === '/owner-dashboard' || location.pathname === '/owner-dashboard/overview';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Host Management Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Owner Host Sanctuary Portal</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your retreat listings, review incoming guest reservations, and configure availability calendars
          </p>
        </div>

        <Link
          to="/create-property"
          className="px-6 py-3 rounded-xl gradient-button text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" /> List New Retreat
        </Link>
      </div>

      {/* Main Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Persistent Sidebar */}
        <aside className="lg:col-span-1 glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl lg:sticky lg:top-28">
          <div className="px-3 py-2 flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Host Navigation</span>
          </div>

          <nav className="space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800/80 hidden lg:block space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1 text-slate-400">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Verified Host</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <p className="text-[10px] text-slate-500">Fast 24/7 guest communications</p>
            </div>

            <Link
              to="/properties"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition"
            >
              <Compass className="w-4 h-4 text-indigo-400" /> Explore Public Catalog
            </Link>
          </div>
        </aside>

        {/* Dynamic Nested Content Area */}
        <main className="lg:col-span-3 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default OwnerLayout;

import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Home, 
  Calendar, 
  TrendingUp, 
  ArrowLeft,
  Sparkles,
  Layers
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'User Accounts', path: '/admin/users', icon: Users },
    { name: 'Properties', path: '/admin/properties', icon: Home },
    { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: TrendingUp },
  ];

  const isNavActive = (item) => {
    if (item.exact) {
      return location.pathname === '/admin' || location.pathname === '/admin/overview';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Platform Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Governance Center</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enterprise system overview, multi-role user management, listing approvals, and platform audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/properties"
            className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Guest View
          </Link>
          <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hidden sm:flex">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Persistent Sidebar */}
        <aside className="lg:col-span-1 glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl lg:sticky lg:top-28">
          <div className="px-3 py-2 flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Admin Modules</span>
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
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-purple-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800/80 hidden lg:block">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1 text-slate-400">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Security Clearance</span>
                <span className="text-purple-400 font-bold">Root Admin</span>
              </div>
              <p className="text-[10px] text-slate-500">Live Socket & DB connected</p>
            </div>
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

export default AdminLayout;

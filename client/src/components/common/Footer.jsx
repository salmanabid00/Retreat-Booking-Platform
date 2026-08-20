import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-outfit font-extrabold text-xl text-white">
                Haven<span className="gradient-text">Hideaway</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Curated sanctuary rentals and wellness retreat properties with real-time verified booking and direct host messaging.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/properties?type=Villa" className="hover:text-white transition">Villas & Estates</Link></li>
              <li><Link to="/properties?type=Cabin" className="hover:text-white transition">Mountain Cabins</Link></li>
              <li><Link to="/properties?type=Beachfront" className="hover:text-white transition">Beachfront Sanctuaries</Link></li>
              <li><Link to="/properties?type=Glamping" className="hover:text-white transition">Eco Glamping</Link></li>
            </ul>
          </div>

          {/* Platform Standards */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-4 uppercase tracking-wider">Standards & Trust</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Verified Host Identity</li>
              <li>Enforced Overlap Protection</li>
              <li>Real-Time Host Messaging</li>
              <li>Automated Booking Lifecycle</li>
            </ul>
          </div>

          {/* Account & Portals */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-4 uppercase tracking-wider">Account & Hosting</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/properties" className="hover:text-white transition">Browse All Listings</Link></li>
              <li><Link to="/register" className="hover:text-white transition">List a Property</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HavenHideaway. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

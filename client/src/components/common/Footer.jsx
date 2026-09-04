import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-stone-800/80 bg-stone-950/90 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 inline-flex group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Compass className="w-5 h-5 text-stone-950" />
              </div>
              <span className="font-serif font-bold text-xl text-stone-100">
                Haven<span className="text-amber-400">Hideaway</span>
              </span>
            </Link>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Curated sanctuary rentals and wellness retreat properties with real-time verified booking and direct host messaging.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-stone-200 text-xs font-semibold mb-4 uppercase tracking-wider">Explore Sanctuaries</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li><Link to="/properties?type=Villa" className="hover:text-amber-300 transition">Villas & Estates</Link></li>
              <li><Link to="/properties?type=Cabin" className="hover:text-amber-300 transition">Mountain Cabins</Link></li>
              <li><Link to="/properties?type=Beachfront" className="hover:text-amber-300 transition">Beachfront Sanctuaries</Link></li>
              <li><Link to="/properties?type=Glamping" className="hover:text-amber-300 transition">Eco Glamping</Link></li>
            </ul>
          </div>

          {/* Platform Standards */}
          <div>
            <h4 className="text-stone-200 text-xs font-semibold mb-4 uppercase tracking-wider">Standards & Trust</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>Verified Host Identity</li>
              <li>Enforced Overlap Protection</li>
              <li>Real-Time Host Messaging</li>
              <li>Automated Booking Lifecycle</li>
            </ul>
          </div>

          {/* Account & Portals */}
          <div>
            <h4 className="text-stone-200 text-xs font-semibold mb-4 uppercase tracking-wider">Account & Hosting</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li><Link to="/properties" className="hover:text-amber-300 transition">Browse All Listings</Link></li>
              <li><Link to="/register" className="hover:text-amber-300 transition">List a Sanctuary</Link></li>
              <li><Link to="/login" className="hover:text-amber-300 transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-amber-300 transition">Create Account</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} HavenHideaway Retreats. All rights reserved.</p>
          <div className="flex items-center gap-3 text-stone-500">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Safety & Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

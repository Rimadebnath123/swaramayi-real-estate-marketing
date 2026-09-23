import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-gray-300 border-t-2 border-gold-500/30 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block bg-white p-2 rounded-2xl border border-gold-500/40 shadow-md">
              <img src={logoImg} alt="Swarnamayi Real Estate Marketing Logo" className="h-14 sm:h-16 w-auto object-contain" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Swarnamayi Real Estate Marketing is Kolkata's premier property discovery and consulting platform.
              Guiding property buyers, sellers, and investors with total transparency and local market expertise.
            </p>
            <div className="bg-navy-800/80 p-4 rounded-xl border border-gold-500/20 max-w-sm">
              <div className="text-xs text-gold-500 uppercase tracking-widest font-bold">Official Tagline</div>
              <div className="text-sm font-semibold text-white mt-1">"Your Dream Property. Our Trusted Guidance."</div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-gold-500 hover:text-navy-900 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-gold-500 hover:text-navy-900 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-gold-500 hover:text-navy-900 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-navy-800 hover:bg-gold-500 hover:text-navy-900 flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-3">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-gold-400 transition-colors flex items-center space-x-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors flex items-center space-x-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                  <span>About Swarnamayi</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-gold-400 transition-colors flex items-center space-x-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                  <span>Real Estate Services</span>
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-gold-400 transition-colors flex items-center space-x-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                  <span>All Properties</span>
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-gold-400 transition-colors flex items-center space-x-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                  <span>Verified Stock</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-400 transition-colors flex items-center space-x-1.5">
                  <ArrowRight className="w-3 h-3 text-gold-500" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kolkata Prime Locations */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-3">
              Kolkata Locations
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/locations/new-town" className="hover:text-gold-400 transition-colors">
                  New Town Kolkata
                </Link>
              </li>
              <li>
                <Link to="/locations/rajarhat" className="hover:text-gold-400 transition-colors">
                  Rajarhat Chowmatha
                </Link>
              </li>
              <li>
                <Link to="/locations/salt-lake" className="hover:text-gold-400 transition-colors">
                  Salt Lake Sector V
                </Link>
              </li>
              <li>
                <Link to="/locations/em-bypass" className="hover:text-gold-400 transition-colors">
                  EM Bypass Corridor
                </Link>
              </li>
              <li>
                <Link to="/locations/ballygunge" className="hover:text-gold-400 transition-colors">
                  Ballygunge South
                </Link>
              </li>
              <li>
                <Link to="/locations/alipore" className="hover:text-gold-400 transition-colors">
                  Alipore Luxury Sector
                </Link>
              </li>
              <li>
                <Link to="/locations/garia" className="hover:text-gold-400 transition-colors">
                  Garia Metro Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Office & Helpdesk Contact */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-3">
              Office Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  4, Samarkunja Apartment, Sarada Sarani, Udayrajpur, North 24 Parganas, Madhyamgram, Kolkata-700129
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold-500 shrink-0" />
                <a href="tel:+918902130791" className="hover:text-gold-400 font-semibold text-white">
                  +91 89021 30791
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold-500 shrink-0" />
                <a href="mailto:avishek@swaramayi.info" className="hover:text-gold-400">
                  avishek@swaramayi.info
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <span>Mon - Sat: 10:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 space-y-4 md:space-y-0">
          <div>
            © {new Date().getFullYear()} <span className="text-gold-500 font-bold">SWARNAMAYI REAL ESTATE MARKETING</span>. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center space-x-6">
            <Link to="/privacy-policy" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-gold-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/disclaimer" className="hover:text-gold-400 transition-colors">
              Disclaimer
            </Link>
            <Link to="/cookie-policy" className="hover:text-gold-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

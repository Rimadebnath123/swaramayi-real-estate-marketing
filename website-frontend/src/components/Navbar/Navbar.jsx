import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  Search,
  Menu,
  X,
  ChevronDown,
  Building2,
  MapPin,
  FileText,
  HelpCircle,
  Briefcase,
  Heart,
  Layers,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const { favorites } = useFavorites();
  const { compareItems } = useCompare();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-navy-900 shadow-navy py-2' : 'bg-navy-900/95 backdrop-blur-md py-3'
        } border-b border-gold-500/20`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* LEFT: Swarnamayi Official Logo */}
            <Link to="/" className="flex items-center space-x-3 group bg-white p-1.5 sm:p-2 rounded-xl shadow-md border border-gold-500/40">
              <img
                src={logoImg}
                alt="Swarnamayi Real Estate Marketing Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* CENTER: Main Navigation Links - Home, About, Properties, More */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/' ? 'text-gold-500 font-bold' : 'text-gray-200 hover:text-gold-400'
                }`}
              >
                Home
              </Link>

              <Link
                to="/about"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname === '/about' ? 'text-gold-500 font-bold' : 'text-gray-200 hover:text-gold-400'
                }`}
              >
                About
              </Link>

              <Link
                to="/properties"
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  location.pathname.startsWith('/properties') ? 'text-gold-500 font-bold' : 'text-gray-200 hover:text-gold-400'
                }`}
              >
                Properties
              </Link>

              {/* MORE DROPDOWN */}
              <div className="relative" onMouseLeave={() => setMoreDropdownOpen(false)}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  onMouseEnter={() => setMoreDropdownOpen(true)}
                  className="flex items-center space-x-1 text-sm font-semibold text-gray-200 hover:text-gold-400 py-2 tracking-wide focus:outline-none"
                >
                  <span>More</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${moreDropdownOpen ? 'rotate-180 text-gold-500' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div
                    className="absolute top-full left-0 w-60 bg-navy-900 border border-gold-500/30 rounded-xl shadow-2xl py-3 px-2 z-50 animate-fadeIn"
                    onMouseEnter={() => setMoreDropdownOpen(true)}
                  >
                    <Link
                      to="/services"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-200 hover:bg-navy-800 hover:text-gold-400 rounded-lg"
                    >
                      <Briefcase className="w-4 h-4 text-gold-500" />
                      <span>Services</span>
                    </Link>
                    <Link
                      to="/locations"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-200 hover:bg-navy-800 hover:text-gold-400 rounded-lg"
                    >
                      <MapPin className="w-4 h-4 text-gold-500" />
                      <span>Kolkata Locations</span>
                    </Link>
                    <Link
                      to="/files"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-200 hover:bg-navy-800 hover:text-gold-400 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-gold-500" />
                      <span>Resources & Files</span>
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-200 hover:bg-navy-800 hover:text-gold-400 rounded-lg"
                    >
                      <Phone className="w-4 h-4 text-gold-500" />
                      <span>Contact Us</span>
                    </Link>
                    <Link
                      to="/faq"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-200 hover:bg-navy-800 hover:text-gold-400 rounded-lg"
                    >
                      <HelpCircle className="w-4 h-4 text-gold-500" />
                      <span>FAQs</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* RIGHT: Actions */}
            <div className="hidden xl:flex items-center space-x-5">
              {/* Quick Search */}
              <button
                onClick={() => navigate('/properties')}
                className="p-2 text-gray-300 hover:text-gold-400 hover:bg-navy-800 rounded-full transition-colors"
                title="Search Properties"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Favorites Badge */}
              <Link
                to="/favorites"
                className="relative p-2 text-gray-300 hover:text-gold-400 hover:bg-navy-800 rounded-full transition-colors"
                title="Favorite Properties"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Property Compare */}
              <Link
                to="/compare"
                className="relative p-2 text-gray-300 hover:text-gold-400 hover:bg-navy-800 rounded-full transition-colors"
                title="Compare Properties"
              >
                <Layers className="w-5 h-5" />
                {compareItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {compareItems.length}
                  </span>
                )}
              </Link>

              {/* Phone Helpline */}
              <a
                href="tel:+918902130791"
                className="flex items-center space-x-2 text-xs font-medium text-gray-300 hover:text-gold-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/40 flex items-center justify-center text-gold-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Help Desk</div>
                  <div className="font-semibold text-white">+91 89021 30791</div>
                </div>
              </a>

              {/* Contact Us CTA */}
              <Link
                to="/contact"
                className="px-4 py-2 text-xs font-bold text-white bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-lg transition-colors shadow-sm"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center space-x-3 lg:hidden">
              <Link to="/favorites" className="relative p-1.5 text-gray-300 hover:text-gold-400">
                <Heart className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-200 hover:text-gold-400 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-7 h-7 text-gold-500" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm bg-navy-900 border-l border-gold-500/30 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                <div className="bg-white p-2 rounded-xl border border-gold-500/40">
                  <img src={logoImg} alt="Swarnamayi Logo" className="h-10 w-auto object-contain" />
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-gold-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="py-6 space-y-4">
                <Link
                  to="/"
                  className="block text-base font-semibold text-gray-200 hover:text-gold-400 py-1"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="block text-base font-semibold text-gray-200 hover:text-gold-400 py-1"
                >
                  About
                </Link>
                <Link
                  to="/properties"
                  className="block text-base font-semibold text-gray-200 hover:text-gold-400 py-1"
                >
                  Properties
                </Link>

                <div className="pt-2 pb-2 border-t border-gray-800">
                  <div className="text-xs uppercase font-bold text-gold-500 tracking-wider mb-2">More Options</div>
                  <div className="space-y-3 pl-2">
                    <Link to="/services" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-gold-400">
                      <Briefcase className="w-4 h-4 text-gold-500" />
                      <span>Services</span>
                    </Link>
                    <Link to="/locations" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-gold-400">
                      <MapPin className="w-4 h-4 text-gold-500" />
                      <span>Kolkata Locations</span>
                    </Link>
                    <Link to="/files" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-gold-400">
                      <FileText className="w-4 h-4 text-gold-500" />
                      <span>Resources & Files</span>
                    </Link>
                    <Link to="/contact" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-gold-400">
                      <Phone className="w-4 h-4 text-gold-500" />
                      <span>Contact Us</span>
                    </Link>
                    <Link to="/faq" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-gold-400">
                      <HelpCircle className="w-4 h-4 text-gold-500" />
                      <span>FAQs</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Actions Bottom */}
            <div className="space-y-4 pt-6 border-t border-gray-800">
              <a
                href="tel:+918902130791"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gold-500 text-navy-900 font-bold rounded-lg text-sm shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call +91 89021 30791</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

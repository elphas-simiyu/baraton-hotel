
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, Settings, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ContinueWithEmailButton from './ContinueWithEmailButton';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    // Only scroll if we're on the home page
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with section hash
      window.location.href = `/#${sectionId}`;
    }
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-hotel-gold rounded-lg flex items-center justify-center">
              <span className="text-hotel-navy font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-xl text-hotel-navy">Baraton Community</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`transition-colors ${isActive('/') ? 'text-hotel-navy font-semibold' : 'text-gray-700 hover:text-hotel-navy'}`}>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </div>
            </Link>
            
            {location.pathname === '/' ? (
              <>
                <button 
                  onClick={() => scrollToSection('rooms')}
                  className="text-gray-700 hover:text-hotel-navy transition-colors"
                >
                  Rooms
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-gray-700 hover:text-hotel-navy transition-colors"
                >
                  Services
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-gray-700 hover:text-hotel-navy transition-colors"
                >
                  Contact
                </button>
              </>
            ) : (
              <>
                <Link to="/#rooms" className="text-gray-700 hover:text-hotel-navy transition-colors">
                  Rooms
                </Link>
                <Link to="/#services" className="text-gray-700 hover:text-hotel-navy transition-colors">
                  Services
                </Link>
                <Link to="/#contact" className="text-gray-700 hover:text-hotel-navy transition-colors">
                  Contact
                </Link>
              </>
            )}
            
            <ContinueWithEmailButton />
            
            <Link to="/bookings">
              <Button 
                variant={isActive('/bookings') ? "default" : "outline"} 
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                My Bookings
              </Button>
            </Link>
            
            <Link to="/admin">
              <Button 
                variant={isActive('/admin') ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-left transition-colors flex items-center gap-2 ${isActive('/') ? 'text-hotel-navy font-semibold' : 'text-gray-700 hover:text-hotel-navy'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              
              {location.pathname === '/' ? (
                <>
                  <button 
                    onClick={() => scrollToSection('rooms')}
                    className="text-left text-gray-700 hover:text-hotel-navy transition-colors"
                  >
                    Rooms
                  </button>
                  <button 
                    onClick={() => scrollToSection('services')}
                    className="text-left text-gray-700 hover:text-hotel-navy transition-colors"
                  >
                    Services
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="text-left text-gray-700 hover:text-hotel-navy transition-colors"
                  >
                    Contact
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/#rooms" 
                    className="text-left text-gray-700 hover:text-hotel-navy transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Rooms
                  </Link>
                  <Link 
                    to="/#services" 
                    className="text-left text-gray-700 hover:text-hotel-navy transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link 
                    to="/#contact" 
                    className="text-left text-gray-700 hover:text-hotel-navy transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
              
              <div className="pt-2">
                <ContinueWithEmailButton />
              </div>
              
              <Link to="/bookings" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant={isActive('/bookings') ? "default" : "outline"} 
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Button>
              </Link>
              
              <Link to="/admin" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"} 
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

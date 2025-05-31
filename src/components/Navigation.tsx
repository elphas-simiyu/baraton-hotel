
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-hotel-gold rounded-lg flex items-center justify-center">
              <span className="text-hotel-navy font-bold text-lg">B</span>
            </div>
            <div>
              <div className="text-hotel-navy font-bold text-lg leading-tight">Baraton</div>
              <div className="text-hotel-gold text-xs">Community & Research Center</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-hotel-navy hover:text-hotel-gold transition-colors duration-300 font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('rooms')}
              className="text-hotel-navy hover:text-hotel-gold transition-colors duration-300 font-medium"
            >
              Rooms
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="text-hotel-navy hover:text-hotel-gold transition-colors duration-300 font-medium"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-hotel-navy hover:text-hotel-gold transition-colors duration-300 font-medium"
            >
              Contact
            </button>
          </div>

          {/* Contact Info & Book Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-hotel-navy">
              <Phone className="h-4 w-4 text-hotel-gold" />
              <span>+254 53 2013 412</span>
            </div>
            <Button className="bg-hotel-gold hover:bg-hotel-gold-dark text-hotel-navy font-semibold">
              Book Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-hotel-navy" />
            ) : (
              <Menu className="h-6 w-6 text-hotel-navy" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left px-4 py-2 text-hotel-navy hover:text-hotel-gold hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('rooms')}
                className="text-left px-4 py-2 text-hotel-navy hover:text-hotel-gold hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                Rooms
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-left px-4 py-2 text-hotel-navy hover:text-hotel-gold hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left px-4 py-2 text-hotel-navy hover:text-hotel-gold hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                Contact
              </button>
              <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-hotel-navy mb-2">
                  <Phone className="h-4 w-4 text-hotel-gold" />
                  <span>+254 53 2013 412</span>
                </div>
                <Button className="w-full bg-hotel-gold hover:bg-hotel-gold-dark text-hotel-navy font-semibold">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

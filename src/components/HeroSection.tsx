
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-r from-hotel-navy via-hotel-navy-light to-blue-600">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Hero content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center text-white max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Baraton Community
            <span className="block text-hotel-gold">& Research Center</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto animate-slide-in">
            Experience luxury and comfort in the heart of Kenya's educational excellence. 
            Where hospitality meets academic distinction.
          </p>
          
          {/* Booking form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-semibold text-hotel-navy mb-6">Reserve Your Stay</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-white">
                <Calendar className="text-hotel-gold h-5 w-5" />
                <div>
                  <label className="text-sm text-gray-600">Check-in</label>
                  <Input type="date" className="border-0 p-0 text-hotel-charcoal font-medium" />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-white">
                <Calendar className="text-hotel-gold h-5 w-5" />
                <div>
                  <label className="text-sm text-gray-600">Check-out</label>
                  <Input type="date" className="border-0 p-0 text-hotel-charcoal font-medium" />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-white">
                <Users className="text-hotel-gold h-5 w-5" />
                <div>
                  <label className="text-sm text-gray-600">Guests</label>
                  <select className="border-0 p-0 text-hotel-charcoal font-medium bg-transparent w-full">
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
              </div>
              
              <Button className="bg-hotel-gold hover:bg-hotel-gold-dark text-hotel-navy font-semibold py-6 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                Search Rooms
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

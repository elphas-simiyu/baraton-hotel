
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Tv, Coffee, Car, Users, Bed } from 'lucide-react';

const RoomShowcase = () => {
  const rooms = [
    {
      id: 1,
      name: "Executive Suite",
      price: "KSh 12,500",
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop",
      amenities: ["King Bed", "City View", "Work Desk", "Mini Bar"],
      capacity: "2 Guests",
      size: "45 sqm"
    },
    {
      id: 2,
      name: "Deluxe Room",
      price: "KSh 8,500",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=300&fit=crop",
      amenities: ["Queen Bed", "Garden View", "Seating Area", "Coffee Maker"],
      capacity: "2 Guests",
      size: "32 sqm"
    },
    {
      id: 3,
      name: "Standard Room",
      price: "KSh 6,500",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=300&fit=crop",
      amenities: ["Twin Beds", "Mountain View", "Work Area", "Tea/Coffee"],
      capacity: "2 Guests",
      size: "28 sqm"
    },
    {
      id: 4,
      name: "Conference Suite",
      price: "KSh 15,000",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
      amenities: ["Meeting Room", "Presentation Tech", "Kitchenette", "Lounge"],
      capacity: "8 Guests",
      size: "65 sqm"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6 animate-fade-in">
            Exceptional Accommodations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-in">
            Choose from our thoughtfully designed rooms and suites, each offering modern amenities 
            and stunning views of the surrounding landscape.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {rooms.map((room, index) => (
            <Card key={room.id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="relative">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                />
                <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-navy font-semibold">
                  {room.price}/night
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-hotel-navy">{room.name}</h3>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {room.capacity}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Bed className="h-4 w-4 mr-1" />
                      {room.size}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {room.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-hotel-gold rounded-full mr-2"></div>
                      {amenity}
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2 mb-6">
                  <Wifi className="h-5 w-5 text-hotel-gold" />
                  <Tv className="h-5 w-5 text-hotel-gold" />
                  <Coffee className="h-5 w-5 text-hotel-gold" />
                  <Car className="h-5 w-5 text-hotel-gold" />
                </div>
                
                <Button className="w-full bg-hotel-navy hover:bg-hotel-charcoal text-white py-3 rounded-lg transition-all duration-300">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomShowcase;

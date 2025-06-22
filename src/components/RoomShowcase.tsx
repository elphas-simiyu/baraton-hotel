
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Tv, Coffee, Car, Users, Bed } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BookingDialog from './BookingDialog';
import RoomAvailabilityInfo from './RoomAvailabilityInfo';

const RoomShowcase = () => {
  const queryClient = useQueryClient();
  
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      console.log('Fetching rooms for showcase');
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('price_per_night', { ascending: true });
      
      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }
      
      console.log('Rooms fetched for showcase:', data?.length);
      return data;
    }
  });

  // Set up real-time subscription for bookings changes to update room availability
  useEffect(() => {
    console.log('Setting up real-time subscription for room showcase');
    
    const channel = supabase
      .channel('room-showcase-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change detected in room showcase:', payload);
          queryClient.invalidateQueries({ queryKey: ['room-availability'] });
          queryClient.invalidateQueries({ queryKey: ['rooms'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up room showcase real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-hotel-navy mb-6">
              Exceptional Accommodations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading our available rooms...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-96 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
          {rooms?.map((room, index) => (
            <Card key={room.id} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="relative">
                <img 
                  src={room.image_url || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=300&fit=crop"} 
                  alt={room.name}
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                />
                <Badge className="absolute top-4 right-4 bg-hotel-gold text-hotel-navy font-semibold">
                  KSh {(room.price_per_night / 100).toLocaleString()}/night
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-hotel-navy">{room.name}</h3>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {room.capacity} Guests
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Bed className="h-4 w-4 mr-1" />
                      {room.size_sqm} sqm
                    </div>
                  </div>
                </div>

                <RoomAvailabilityInfo roomType={room.type} />
                
                <p className="text-gray-600 mb-4 mt-4">{room.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {room.amenities?.slice(0, 4).map((amenity, i) => (
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
                
                <BookingDialog room={room}>
                  <Button className="w-full bg-hotel-navy hover:bg-hotel-charcoal text-white py-3 rounded-lg transition-all duration-300">
                    Book Now
                  </Button>
                </BookingDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomShowcase;

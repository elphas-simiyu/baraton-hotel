
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, MapPin, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Bookings = () => {
  const queryClient = useQueryClient();
  
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      console.log('Fetching all bookings');
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (
            name,
            type,
            image_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
      
      console.log('Bookings fetched:', data?.length);
      return data;
    }
  });

  // Set up real-time subscription for bookings changes
  useEffect(() => {
    console.log('Setting up real-time subscription for bookings page');
    
    const channel = supabase
      .channel('bookings-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change detected on bookings page:', payload);
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up bookings page real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'checked_in': return 'bg-blue-500';
      case 'checked_out': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-hotel-navy mb-8">Your Bookings</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-hotel-navy mb-8">Your Bookings</h1>
        
        {bookings && bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
              <p className="text-gray-500">When you make a booking, it will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings?.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{booking.rooms?.name}</CardTitle>
                    <Badge className={`${getStatusColor(booking.status || 'pending')} text-white`}>
                      {booking.status?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-sm text-gray-600">Check-in</p>
                        <p className="font-semibold">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-sm text-gray-600">Check-out</p>
                        <p className="font-semibold">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="font-semibold">{booking.guests}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">KSh {(booking.total_amount / 100).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Guest Information</h4>
                    <p><span className="text-gray-600">Name:</span> {booking.guest_name}</p>
                    <p><span className="text-gray-600">Email:</span> {booking.guest_email}</p>
                    {booking.guest_phone && (
                      <p><span className="text-gray-600">Phone:</span> {booking.guest_phone}</p>
                    )}
                    {booking.special_requests && (
                      <div className="mt-2">
                        <p className="text-gray-600">Special Requests:</p>
                        <p className="italic">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    Booking created: {new Date(booking.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Bookings;


import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Users, Mail, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const reference = searchParams.get('reference');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!reference) {
        setLoading(false);
        return;
      }

      try {
        // Find the payment record with this reference
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select(`
            *,
            bookings (
              *,
              rooms (
                name,
                type
              )
            )
          `)
          .eq('stripe_session_id', reference)
          .single();

        if (paymentError) {
          console.error('Error fetching payment:', paymentError);
        } else {
          setBooking(payment?.bookings);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing your payment...</p>
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
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <p className="text-gray-600 mt-2">
                Thank you for your booking. Your reservation has been confirmed.
              </p>
            </CardHeader>
            
            {booking && (
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-gray-600">Check-in</p>
                        <p className="font-semibold">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-gray-600">Check-out</p>
                        <p className="font-semibold">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-gray-600">Guests</p>
                        <p className="font-semibold">{booking.guests}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-hotel-gold" />
                      <div>
                        <p className="text-gray-600">Room</p>
                        <p className="font-semibold">{booking.rooms?.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">KSh {(booking.total_amount / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Name:</span> {booking.guest_name}</p>
                    <p><span className="text-gray-600">Email:</span> {booking.guest_email}</p>
                    {booking.guest_phone && (
                      <p><span className="text-gray-600">Phone:</span> {booking.guest_phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to {booking.guest_email}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/bookings">View My Bookings</Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/">Return Home</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}

            {!booking && (
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We're processing your booking. Please check your email for confirmation.
                </p>
                <Button asChild>
                  <Link to="/">Return Home</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;

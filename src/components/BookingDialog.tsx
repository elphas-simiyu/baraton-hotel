
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Users, Mail, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import PaymentMethodSelector from './PaymentMethodSelector';
import RoomAvailabilityCalendar from './RoomAvailabilityCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

type Room = Tables<'rooms'>;

interface BookingDialogProps {
  room: Room;
  children: React.ReactNode;
}

const BookingDialog = ({ room, children }: BookingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    paymentMethod: 'card'
  });

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * room.price_per_night;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const totalAmount = calculateTotal();
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          room_id: room.id,
          check_in_date: checkInDate!.toISOString().split('T')[0],
          check_out_date: checkOutDate!.toISOString().split('T')[0],
          guests: formData.guests,
          total_amount: totalAmount,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          special_requests: formData.specialRequests || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create payment record
      await supabase
        .from('payments')
        .insert({
          booking_id: data.id,
          amount: totalAmount,
          status: formData.paymentMethod === 'cash' ? 'pending' : 'pending'
        });

      toast({
        title: "Booking Submitted!",
        description: `Your booking request has been submitted successfully. Payment method: ${formData.paymentMethod === 'mpesa' ? 'M-Pesa' : formData.paymentMethod === 'card' ? 'Card' : 'Cash on Arrival'}. We'll contact you soon to confirm.`,
      });

      setIsOpen(false);
      setFormData({
        guests: 1,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: '',
        paymentMethod: 'card'
      });
      setCheckInDate(undefined);
      setCheckOutDate(undefined);

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return checkInDate && 
           checkOutDate && 
           formData.guestName && 
           formData.guestEmail &&
           calculateNights() > 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-hotel-navy">
            Book {room.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkIn" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Check-in Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <RoomAvailabilityCalendar
                        roomId={room.id}
                        onDateSelect={setCheckInDate}
                        selectedDate={checkInDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="checkOut" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Check-out Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <RoomAvailabilityCalendar
                        roomId={room.id}
                        onDateSelect={setCheckOutDate}
                        selectedDate={checkOutDate}
                        isCheckOut={true}
                        checkInDate={checkInDate?.toISOString().split('T')[0]}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Guests
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="guestName"
                    value={formData.guestName}
                    onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="guestEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guestPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number (Optional)
                </Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  placeholder="Any special requirements or requests..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <PaymentMethodSelector
                value={formData.paymentMethod}
                onChange={(value) => setFormData({...formData, paymentMethod: value})}
              />

              {calculateNights() > 0 && (
                <div className="bg-hotel-cream p-4 rounded-lg">
                  <h4 className="font-semibold text-hotel-navy mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span>{room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span>{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per night:</span>
                      <span>KSh {(room.price_per_night / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="capitalize">
                        {formData.paymentMethod === 'mpesa' ? 'M-Pesa' : 
                         formData.paymentMethod === 'card' ? 'Card' : 'Cash on Arrival'}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>KSh {(calculateTotal() / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-hotel-navy hover:bg-hotel-charcoal"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Processing...' : 'Submit Booking Request'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;

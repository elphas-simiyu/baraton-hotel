
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

type Room = Tables<'rooms'>;

interface BookingDialogProps {
  room: Room;
  children: React.ReactNode;
}

const BookingDialog = ({ room, children }: BookingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
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
          check_in_date: formData.checkInDate,
          check_out_date: formData.checkOutDate,
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

      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted successfully. We'll contact you soon to confirm.",
      });

      setIsOpen(false);
      setFormData({
        checkInDate: '',
        checkOutDate: '',
        guests: 1,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      });

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
    return formData.checkInDate && 
           formData.checkOutDate && 
           formData.guestName && 
           formData.guestEmail &&
           calculateNights() > 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-hotel-navy">
            Book {room.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkIn" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Check-in Date
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="checkOut" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Check-out Date
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                required
              />
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
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Total:</span>
                  <span>KSh {(calculateTotal() / 100).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

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

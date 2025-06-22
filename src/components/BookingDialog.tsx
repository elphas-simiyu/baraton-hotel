
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
import PaystackPayment from './PaystackPayment';
import RoomAvailabilityCalendar from './RoomAvailabilityCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { validateEmail, validatePhone, sanitizeInput, validateAmount, validateGuestCount, validateDateRange } from '@/utils/security';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate dates
    if (!checkInDate || !checkOutDate) {
      newErrors.dates = 'Please select both check-in and check-out dates';
    } else if (!validateDateRange(checkInDate.toISOString().split('T')[0], checkOutDate.toISOString().split('T')[0])) {
      newErrors.dates = 'Invalid date range. Check-in must be today or later, check-out must be after check-in';
    }

    // Validate guest name
    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    } else if (formData.guestName.trim().length < 2) {
      newErrors.guestName = 'Guest name must be at least 2 characters';
    }

    // Validate email
    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email address is required';
    } else if (!validateEmail(formData.guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email address';
    }

    // Validate phone (optional but if provided, must be valid)
    if (formData.guestPhone && !validatePhone(formData.guestPhone)) {
      newErrors.guestPhone = 'Please enter a valid Kenyan phone number';
    }

    // Validate guest count
    if (!validateGuestCount(formData.guests, room.capacity)) {
      newErrors.guests = `Number of guests must be between 1 and ${room.capacity}`;
    }

    // Validate amount
    const totalAmount = calculateTotal();
    if (!validateAmount(totalAmount)) {
      newErrors.amount = 'Invalid booking amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * room.price_per_night;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? sanitizeInput(value) : value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBookingSuccess = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before proceeding.",
        variant: "destructive",
      });
      return;
    }

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
          guest_name: formData.guestName.trim(),
          guest_email: formData.guestEmail.toLowerCase().trim(),
          guest_phone: formData.guestPhone.trim() || null,
          special_requests: formData.specialRequests.trim() || null,
          status: 'confirmed'
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
          status: 'completed',
          currency: 'kes'
        });

      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been confirmed and payment processed successfully.",
      });

      setIsOpen(false);
      setFormData({
        guests: 1,
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialRequests: ''
      });
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setErrors({});

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Error",
        description: "There was an error processing your booking. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return checkInDate && 
           checkOutDate && 
           formData.guestName.trim() && 
           validateEmail(formData.guestEmail) &&
           calculateNights() > 0 &&
           Object.keys(errors).length === 0;
  };

  const bookingData = {
    room_id: room.id, // Add room_id for database insertion
    roomName: room.name,
    guestName: formData.guestName.trim(),
    guestEmail: formData.guestEmail.toLowerCase().trim(),
    guestPhone: formData.guestPhone.trim(),
    checkInDate: checkInDate?.toISOString().split('T')[0],
    checkOutDate: checkOutDate?.toISOString().split('T')[0],
    guests: formData.guests,
    specialRequests: formData.specialRequests.trim()
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
        
        <div className="space-y-6">
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
                        className={`w-full justify-start text-left font-normal ${errors.dates ? 'border-red-500' : ''}`}
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
                        className={`w-full justify-start text-left font-normal ${errors.dates ? 'border-red-500' : ''}`}
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
              {errors.dates && <p className="text-sm text-red-500">{errors.dates}</p>}

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
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                  className={errors.guests ? 'border-red-500' : ''}
                  required
                />
                {errors.guests && <p className="text-sm text-red-500">{errors.guests}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="guestName"
                    value={formData.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    className={errors.guestName ? 'border-red-500' : ''}
                    required
                  />
                  {errors.guestName && <p className="text-sm text-red-500">{errors.guestName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="guestEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                    className={errors.guestEmail ? 'border-red-500' : ''}
                    required
                  />
                  {errors.guestEmail && <p className="text-sm text-red-500">{errors.guestEmail}</p>}
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
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  placeholder="e.g., +254712345678 or 0712345678"
                  className={errors.guestPhone ? 'border-red-500' : ''}
                />
                {errors.guestPhone && <p className="text-sm text-red-500">{errors.guestPhone}</p>}
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requirements or requests..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
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

              {isFormValid() && (
                <PaystackPayment
                  amount={calculateTotal()}
                  email={formData.guestEmail}
                  bookingData={bookingData}
                  onSuccess={handleBookingSuccess}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;

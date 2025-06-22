
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  bookingData: any;
  onSuccess: () => void;
  disabled?: boolean;
}

const PaystackPayment = ({ amount, email, bookingData, onSuccess, disabled }: PaystackPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const validateInputs = () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address to proceed with payment.",
        variant: "destructive",
      });
      return false;
    }

    if (amount < 100) { // Minimum 1 KES
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be at least 1 KES.",
        variant: "destructive",
      });
      return false;
    }

    if (!bookingData?.roomName) {
      toast({
        title: "Booking Error",
        description: "Room information is missing. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Initiating payment for:', {
        email: email,
        amount: amount,
        room: bookingData.roomName
      });

      // Call our edge function to initialize Paystack payment
      const { data, error } = await supabase.functions.invoke('create-paystack-payment', {
        body: {
          amount: amount,
          email: email.toLowerCase().trim(),
          bookingData: {
            ...bookingData,
            room_name: bookingData.roomName || 'Hotel Room'
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to initialize payment');
      }

      if (data?.success) {
        console.log('Payment URL received, redirecting...');
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data?.error || 'Failed to initialize payment');
      }

    } catch (error) {
      console.error('Payment initialization error:', error);
      
      // Show user-friendly error messages
      let errorMessage = "Failed to initialize payment. Please try again.";
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes('email')) {
        errorMessage = "Please provide a valid email address.";
      } else if (error.message.includes('amount')) {
        errorMessage = "Invalid payment amount. Please try again.";
      }

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-green-600" />
          Secure Payment with Paystack
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-green-600" />
          <p className="text-sm text-gray-600">
            Your payment is protected by bank-level security
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Pay securely using your debit/credit card or mobile money. You'll be redirected to complete your payment.
        </p>
        <Button 
          onClick={handlePayment}
          disabled={disabled || isLoading || !email || amount < 100}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Initializing Payment...' : `Pay KSh ${(amount / 100).toLocaleString()} Securely`}
        </Button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Paystack • Secure Payment Gateway
        </p>
      </div>
    </div>
  );
};

export default PaystackPayment;

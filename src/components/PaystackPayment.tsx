
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
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

  const handlePayment = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide an email address to proceed with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call our edge function to initialize Paystack payment
      const { data, error } = await supabase.functions.invoke('create-paystack-payment', {
        body: {
          amount: amount, // Amount in cents (already in the right format)
          email: email,
          bookingData: {
            ...bookingData,
            room_name: bookingData.roomName || 'Hotel Room'
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || 'Failed to initialize payment');
      }

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
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
          Paystack Payment
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Secure payment powered by Paystack. You'll be redirected to complete your payment.
        </p>
        <Button 
          onClick={handlePayment}
          disabled={disabled || isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Initializing Payment...' : `Pay KSh ${(amount / 100).toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
};

export default PaystackPayment;

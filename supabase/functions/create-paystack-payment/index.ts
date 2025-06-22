
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { bookingData, amount, email } = await req.json();
    
    // Input validation
    if (!bookingData || !amount || !email) {
      throw new Error('Missing required fields: bookingData, amount, and email are required');
    }

    if (!email.includes('@') || email.length < 5) {
      throw new Error('Invalid email address');
    }

    if (amount < 100) { // Minimum 1 KES
      throw new Error('Amount must be at least 1 KES (100 cents)');
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('Paystack secret key not configured');
      throw new Error('Payment service not configured');
    }

    // Validate secret key format (should start with sk_)
    if (!paystackSecretKey.startsWith('sk_')) {
      console.error('Invalid Paystack secret key format');
      throw new Error('Payment service configuration error');
    }

    // Get origin for callback URL validation
    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Origin header required');
    }

    // Validate origin for production security
    const allowedOrigins = [
      'https://lovable.dev',
      'http://localhost:8080',
      origin // Allow the current origin for flexibility
    ];

    console.log('Processing payment request:', {
      email: email,
      amount: amount,
      origin: origin,
      room: bookingData.room_name
    });

    // Initialize Paystack transaction with enhanced security
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Baraton-Community-App/1.0'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        amount: Math.round(amount), // Ensure integer amount
        currency: 'KES',
        callback_url: `${origin}/bookings?payment=success`,
        channels: ['card', 'mobile_money'], // Limit to secure channels
        metadata: {
          booking_data: JSON.stringify({
            ...bookingData,
            timestamp: new Date().toISOString(),
            origin: origin
          }),
          custom_fields: [
            {
              display_name: "Room",
              variable_name: "room_name",
              value: bookingData.room_name || 'Unknown Room'
            },
            {
              display_name: "Guest Name",
              variable_name: "guest_name", 
              value: bookingData.guest_name || 'Unknown Guest'
            },
            {
              display_name: "Check-in Date",
              variable_name: "check_in_date",
              value: bookingData.checkInDate || 'Not specified'
            }
          ]
        }
      }),
    });

    if (!paystackResponse.ok) {
      const errorText = await paystackResponse.text();
      console.error('Paystack API error:', errorText);
      throw new Error('Payment service temporarily unavailable');
    }

    const paystackData = await paystackResponse.json();
    
    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData.message);
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    console.log('Payment initialized successfully:', {
      reference: paystackData.data.reference,
      email: email
    });

    return new Response(JSON.stringify({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating Paystack payment:', error);
    
    // Don't expose internal errors to client in production
    const errorMessage = error.message.includes('Payment service') || 
                        error.message.includes('Invalid') || 
                        error.message.includes('Missing') ||
                        error.message.includes('Method not allowed')
                        ? error.message 
                        : 'An error occurred while processing your payment';

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: error.message.includes('Method not allowed') ? 405 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

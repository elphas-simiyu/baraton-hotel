
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, email, bookingData, callback_url, cancel_url } = await req.json();
    const origin = req.headers.get('origin') || '';
    
    console.log('Processing payment request:', {
      email,
      amount,
      origin,
      room: bookingData?.room_name
    });

    // Validate inputs
    if (!amount || amount < 100) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid amount. Minimum is 100 kobo (1 KES)'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Valid email address is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate origin for additional security
    const allowedOrigins = [
      'https://preview--baraton-oasis-booking.lovable.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    if (origin && !allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
      console.warn('Payment request from unrecognized origin:', origin);
    }

    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system configuration error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate a unique reference
    const reference = `baraton_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare webhook URL
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/paystack-webhook`;

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        amount: amount, // Amount in kobo
        reference: reference,
        callback_url: callback_url || `${origin}/payment-success`,
        cancel_url: cancel_url || origin,
        metadata: {
          bookingData: {
            ...bookingData,
            room_id: bookingData.room_id || null,
            guestName: bookingData.guestName,
            guestEmail: email.toLowerCase().trim(),
            guestPhone: bookingData.guestPhone || null,
            checkInDate: bookingData.checkInDate,
            checkOutDate: bookingData.checkOutDate,
            guests: bookingData.guests || 1,
            specialRequests: bookingData.specialRequests || null
          },
          custom_fields: [
            {
              display_name: "Room",
              variable_name: "room_name",
              value: bookingData.room_name || 'Hotel Room'
            },
            {
              display_name: "Guest Name",
              variable_name: "guest_name", 
              value: bookingData.guestName || 'Guest'
            }
          ]
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return new Response(JSON.stringify({
        success: false,
        error: paystackData.message || 'Failed to initialize payment with Paystack'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Payment initialized successfully:', {
      reference: reference,
      email: email
    });

    return new Response(JSON.stringify({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: reference
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error occurred while processing payment request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

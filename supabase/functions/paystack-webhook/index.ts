
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')

    // Verify webhook signature
    const crypto = await import('node:crypto')
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
    
    if (hash !== signature) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Webhook event received:', event.event, event.data?.reference)

    if (event.event === 'charge.success') {
      const paymentData = event.data
      const reference = paymentData.reference
      const metadata = paymentData.metadata

      console.log('Processing successful payment:', {
        reference,
        amount: paymentData.amount,
        email: paymentData.customer.email,
        metadata
      })

      // Verify payment with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${secret}`,
          'Content-Type': 'application/json'
        }
      })

      const verificationResult = await verifyResponse.json()
      
      if (!verificationResult.status || verificationResult.data.status !== 'success') {
        console.error('Payment verification failed:', verificationResult)
        return new Response('Payment verification failed', { status: 400 })
      }

      // Extract booking data from metadata
      const bookingData = metadata.bookingData || {}
      
      // Create the booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          room_id: bookingData.room_id,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          guests: parseInt(bookingData.guests) || 1,
          total_amount: verificationResult.data.amount, // Amount in kobo
          guest_name: bookingData.guestName,
          guest_email: bookingData.guestEmail.toLowerCase().trim(),
          guest_phone: bookingData.guestPhone || null,
          special_requests: bookingData.specialRequests || null,
          status: 'confirmed'
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        return new Response('Error creating booking', { status: 500 })
      }

      console.log('Booking created successfully:', booking.id)

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: verificationResult.data.amount,
          status: 'completed',
          currency: 'ngn',
          stripe_session_id: reference,
          paid_at: new Date().toISOString()
        })

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
      }

      console.log('Payment processed successfully for booking:', booking.id)
    }

    return new Response('Webhook processed', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})

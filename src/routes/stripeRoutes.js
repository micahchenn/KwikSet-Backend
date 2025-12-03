import express from 'express';
import paymentService from '../services/paymentService.js';

const router = express.Router();

/**
 * POST /api/stripe/webhook
 * Stripe-specific webhook handler
 * Configure this endpoint in your Stripe dashboard
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Note: In production, you should verify the webhook signature
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  try {
    const event = req.body;

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
      const paymentIntent = event.data.object;

      // Extract customer and metadata information
      const paymentData = {
        paymentId: paymentIntent.id,
        customerEmail: paymentIntent.customer_details?.email || paymentIntent.receipt_email,
        customerName: paymentIntent.customer_details?.name || paymentIntent.metadata?.customer_name,
        customerPhone: paymentIntent.customer_details?.phone || paymentIntent.metadata?.customer_phone,
        deviceId: paymentIntent.metadata?.device_id,
        checkIn: paymentIntent.metadata?.check_in,
        checkOut: paymentIntent.metadata?.check_out,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
      };

      // Process payment and create access code
      const result = await paymentService.processPaymentAndCreateAccessCode(paymentData);

      return res.status(200).json({
        success: true,
        message: 'Stripe payment processed and access code created',
        data: result,
      });
    }

    // Handle other event types if needed
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


import express from 'express';
import paymentService from '../services/paymentService.js';

const router = express.Router();

/**
 * POST /api/payments/webhook
 * Generic payment webhook handler
 * This endpoint accepts payment confirmations from various payment providers
 */
router.post('/webhook', express.json(), async (req, res) => {
  try {
    // Extract payment data from webhook payload
    // This is a generic handler - adapt based on your payment provider
    const paymentData = {
      paymentId: req.body.id || req.body.payment_id || req.body.transaction_id,
      customerEmail: req.body.customer?.email || req.body.customer_email || req.body.email,
      customerName: req.body.customer?.name || req.body.customer_name || req.body.name,
      customerPhone: req.body.customer?.phone || req.body.customer_phone || req.body.phone,
      deviceId: req.body.metadata?.device_id || req.body.device_id,
      checkIn: req.body.metadata?.check_in || req.body.check_in,
      checkOut: req.body.metadata?.check_out || req.body.check_out,
      amount: req.body.amount || req.body.amount_total,
      currency: req.body.currency || 'USD',
      status: req.body.status || req.body.payment_status,
    };

    // Process payment and create access code
    const result = await paymentService.processPaymentAndCreateAccessCode(paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment processed and access code created',
      data: result,
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/payments/process
 * Manual payment processing endpoint
 * Use this if you want to manually trigger access code creation after payment
 */
router.post('/process', express.json(), async (req, res) => {
  try {
    const paymentData = req.body;

    // Validate required fields
    if (!paymentData.paymentId || !paymentData.customerEmail || !paymentData.customerName || 
        !paymentData.deviceId || !paymentData.checkIn || !paymentData.checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: paymentId, customerEmail, customerName, deviceId, checkIn, checkOut',
      });
    }

    // Set default status if not provided
    if (!paymentData.status) {
      paymentData.status = 'paid';
    }

    const result = await paymentService.processPaymentAndCreateAccessCode(paymentData);

    res.status(200).json({
      success: true,
      message: 'Access code created and sent to customer',
      data: result,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


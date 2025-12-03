import express from 'express';
import database from '../models/database.js';
import accessCodeService from '../services/accessCodeService.js';
import notificationService from '../services/notificationService.js';
import seamService from '../services/seamService.js';

const router = express.Router();

// Get Crappie House device ID from environment or use default
const CRAPPIE_HOUSE_DEVICE_ID = process.env.CRAPPIE_HOUSE_DEVICE_ID || 'demo_device_001';

/**
 * POST /api/crappie-house/checkout
 * Process checkout for Crappie House day passes
 */
router.post('/checkout', express.json(), async (req, res) => {
  try {
    const {
      selectedDates,
      adults,
      children,
      paymentInfo,
    } = req.body;

    // Validate input
    if (!selectedDates || selectedDates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one date',
      });
    }

    if (!adults || adults.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one adult is required',
      });
    }

    // Validate payment (mock validation - accept any card for testing)
    if (!paymentInfo || !paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv) {
      return res.status(400).json({
        success: false,
        error: 'Payment information is required',
      });
    }

    // Mock payment processing - accept any card number for testing
    // In production, this would integrate with Square or another payment processor
    const mockCardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
    console.log('Processing payment with card:', mockCardNumber.substring(0, 4) + '****');
    
    // Accept any card number for testing (no validation)

    // Calculate total
    const totalDays = selectedDates.length;
    const totalAdults = adults.length;
    const totalChildren = children || 0;
    const pricePerDay = 15;
    // Children also pay $15 per day, they just share codes with adults
    const totalAmount = totalDays * pricePerDay * (totalAdults + totalChildren);

    // Create purchase record
    const purchase = database.createPurchase({
      type: 'crappie_house_day_pass',
      selectedDates,
      adults,
      children: totalChildren,
      totalDays,
      totalAdults,
      totalAmount,
      paymentInfo: {
        last4: mockCardNumber.slice(-4),
        cardType: 'visa', // Mock
      },
      status: 'completed',
    });

    // Generate access codes for each adult for each day
    const accessCodes = [];
    const notifications = [];

    // Get purchase time (now) - this is when the code should start
    const purchaseTime = new Date();
    
    for (const date of selectedDates) {
      // Parse the date string (format: YYYY-MM-DD)
      const dateParts = date.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2]);
      
      // Start code at 12:00 AM (midnight) of the selected date
      const codeStartTime = new Date(year, month, day, 0, 0, 0, 0);
      
      // End at end of day (11:59:59.999 PM) on the selected date
      const endDate = new Date(year, month, day, 23, 59, 59, 999);
      
      // For Seam API, we need to ensure start time is at least 15 minutes in the future
      // If the selected date is in the past or today but already past, adjust
      const now = new Date();
      const minSeamStartTime = new Date(now.getTime() + 15 * 60 * 1000);
      
      // If the code start time is in the past or too soon, use minimum time
      // But only if it's for today - future dates should start at midnight
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const selectedMidnight = new Date(year, month, day, 0, 0, 0, 0);
      
      let actualStartTime = codeStartTime;
      // Only adjust if it's today and we're past midnight
      if (selectedMidnight.getTime() === todayMidnight.getTime() && codeStartTime < minSeamStartTime) {
        actualStartTime = minSeamStartTime;
      }
      
      // If purchase time is after the selected date, that's an error
      if (purchaseTime > endDate) {
        console.warn(`Warning: Purchase time is after selected date ${date}. Code will still be created but may not work.`);
      }

      // Create code for each adult
      for (const adult of adults) {
        try {
          // Generate 6-digit PIN
          const pinCode = accessCodeService.generatePinCode(6);
          
          // Create access code name
          const codeName = `${adult.name.substring(0, 12)}`.padEnd(2, 'X');

          // Create access code on lock
          let seamAccessCode = null;
          try {
            seamAccessCode = await seamService.createAccessCode(CRAPPIE_HOUSE_DEVICE_ID, {
              name: codeName,
              code: pinCode,
              startsAt: actualStartTime,
              endsAt: endDate,
            });
          } catch (seamError) {
            console.error('Error creating Seam access code:', seamError);
            // Continue even if Seam fails (demo mode)
          }

          // Store access code in database
          // Always store the intended start time (midnight) in the database
          // even if Seam API uses a slightly later time for today's codes
          const accessCode = database.createAccessCode({
            purchaseId: purchase.id,
            deviceId: CRAPPIE_HOUSE_DEVICE_ID,
            accessCodeId: seamAccessCode?.access_code_id || `demo_${Date.now()}`,
            pinCode,
            codeName,
            customerName: adult.name,
            customerEmail: adult.email,
            customerPhone: adult.phone,
            date: date,
            startsAt: codeStartTime.toISOString(), // Store midnight as the start time
            endsAt: endDate.toISOString(),
            type: 'adult',
          });

          accessCodes.push(accessCode);

          // Send email/SMS
          try {
            const notificationResult = await notificationService.sendAccessCode({
              customerName: adult.name,
              customerEmail: adult.email,
              customerPhone: adult.phone,
              pinCode: pinCode,
              checkIn: codeStartTime, // Show midnight as the start time to customer
              checkOut: endDate,
              codeName: codeName,
              location: 'Crappie House',
              date: date,
            });
            notifications.push({
              accessCodeId: accessCode.id,
              ...notificationResult,
            });
          } catch (notifError) {
            console.error('Error sending notification:', notifError);
            notifications.push({
              accessCodeId: accessCode.id,
              email: { success: false, error: notifError.message },
              sms: { success: false, error: notifError.message },
            });
          }
        } catch (error) {
          console.error(`Error creating access code for ${adult.name}:`, error);
        }
      }

      // Children share codes with adults, so we don't create separate codes for them
      // But we track them in the purchase
    }

    res.json({
      success: true,
      purchase: {
        id: purchase.id,
        totalAmount,
        totalDays,
        selectedDates,
      },
      accessCodes: accessCodes.map(ac => ({
        id: ac.id,
        pinCode: ac.pinCode,
        customerName: ac.customerName,
        date: ac.date,
        startsAt: ac.startsAt,
        endsAt: ac.endsAt,
      })),
      notifications,
      message: 'Purchase completed successfully. Access codes have been sent.',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process checkout',
    });
  }
});

/**
 * GET /api/crappie-house/purchases
 * Get all purchases (admin)
 */
router.get('/purchases', async (req, res) => {
  try {
    const purchases = database.getAllPurchases();
    res.json({
      success: true,
      purchases: purchases.map(p => ({
        id: p.id,
        type: p.type,
        selectedDates: p.selectedDates,
        totalAdults: p.totalAdults,
        children: p.children,
        totalAmount: p.totalAmount,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/crappie-house/purchase/:purchaseId
 * Get purchase details with access codes
 */
router.get('/purchase/:purchaseId', async (req, res) => {
  try {
    const purchase = database.getPurchase(req.params.purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found',
      });
    }

    const accessCodes = database.getAccessCodesByPurchase(purchase.id);

    res.json({
      success: true,
      purchase,
      accessCodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


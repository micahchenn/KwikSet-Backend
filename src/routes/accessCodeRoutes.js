import express from 'express';
import accessCodeService from '../services/accessCodeService.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/access-codes/:accessCodeId
 * Get access code details
 */
router.get('/:accessCodeId', async (req, res) => {
  try {
    const accessCode = await accessCodeService.getAccessCode(req.params.accessCodeId);
    res.json({
      success: true,
      accessCode: accessCode,
    });
  } catch (error) {
    console.error('Error fetching access code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/access-codes/:accessCodeId
 * Delete an access code
 */
router.delete('/:accessCodeId', async (req, res) => {
  try {
    await accessCodeService.deleteAccessCode(req.params.accessCodeId);
    res.json({
      success: true,
      message: 'Access code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting access code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/access-codes/resend
 * Resend access code to customer
 */
router.post('/resend', express.json(), async (req, res) => {
  try {
    const { accessCodeId, customerEmail, customerPhone } = req.body;

    if (!accessCodeId) {
      return res.status(400).json({
        success: false,
        error: 'accessCodeId is required',
      });
    }

    // Get access code details
    const accessCode = await accessCodeService.getAccessCode(accessCodeId);

    // Resend notification (handle both API response formats)
    const notificationResults = await notificationService.sendAccessCode({
      customerName: req.body.customerName || 'Customer',
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      pinCode: accessCode.code || accessCode.pin_code,
      checkIn: accessCode.starts_at || accessCode.startsAt,
      checkOut: accessCode.ends_at || accessCode.endsAt,
      codeName: accessCode.name || accessCode.code_name,
    });

    res.json({
      success: true,
      message: 'Access code resent to customer',
      notifications: notificationResults,
    });
  } catch (error) {
    console.error('Error resending access code:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


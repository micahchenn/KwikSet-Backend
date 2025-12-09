import express from 'express';
import notificationService from '../services/notificationService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * POST /api/debug/test-email
 * Test email sending with detailed logging
 */
router.post('/test-email', express.json(), async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
      });
    }

    const debugInfo = {
      hasEmailTransporter: !!notificationService.emailTransporter,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      smtpPassLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
    };

    console.log('📧 Email Debug Info:', debugInfo);

    if (!notificationService.emailTransporter) {
      return res.json({
        success: false,
        error: 'Email transporter not configured',
        debug: debugInfo,
        message: 'Email is running in DEMO mode. Please configure SMTP settings.',
        instructions: [
          '1. Go to http://localhost:3000/email-config',
          '2. Enter your Gmail SMTP settings',
          '3. Use an App Password (not your regular password)',
          '4. Or set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env file',
        ],
      });
    }

    // Try to send test email
    try {
      const result = await notificationService.sendAccessCodeEmail({
        customerName: name || 'Test User',
        customerEmail: email,
        pinCode: '123456',
        checkIn: new Date(),
        checkOut: new Date(),
        codeName: 'Test Code',
        location: 'Crappie House',
        date: new Date().toISOString().split('T')[0],
      });

      res.json({
        success: true,
        message: 'Test email sent successfully',
        result,
        debug: debugInfo,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      res.status(500).json({
        success: false,
        error: emailError.message,
        debug: debugInfo,
        fullError: emailError.toString(),
      });
    }
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/debug/email-status
 * Get email configuration status
 */
router.get('/email-status', async (req, res) => {
  const status = {
    hasEmailTransporter: !!notificationService.emailTransporter,
    envConfig: {
      SMTP_HOST: process.env.SMTP_HOST || 'Not set',
      SMTP_PORT: process.env.SMTP_PORT || 'Not set',
      SMTP_USER: process.env.SMTP_USER || 'Not set',
      hasSmtpPass: !!process.env.SMTP_PASS,
      smtpPassLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
    },
    mode: notificationService.emailTransporter ? 'PRODUCTION' : 'DEMO',
  };

  res.json({
    success: true,
    status,
  });
});

export default router;




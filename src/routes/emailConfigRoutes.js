import express from 'express';
import database from '../models/database.js';
import notificationService from '../services/notificationService.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * GET /api/email-config
 * Get current email configuration
 */
router.get('/', async (req, res) => {
  try {
    const config = database.getEmailConfig();
    
    // Also check environment variables
    const envConfig = {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpUser: process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
    };

    res.json({
      success: true,
      config: config || envConfig,
      hasConfig: !!config || !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/email-config
 * Set email configuration
 */
router.post('/', express.json(), async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      saveToEnv,
    } = req.body;

    // Validate
    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(400).json({
        success: false,
        error: 'SMTP host, user, and password are required',
      });
    }

    // Test the configuration
    try {
      const testTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await testTransporter.verify();
    } catch (testError) {
      return res.status(400).json({
        success: false,
        error: `Email configuration test failed: ${testError.message}`,
      });
    }

    // Save to database
    const config = database.setEmailConfig({
      smtpHost,
      smtpPort: parseInt(smtpPort) || 587,
      smtpUser,
      smtpPass, // In production, encrypt this
    });

    // Update notification service
    notificationService.updateEmailConfig({
      smtpHost,
      smtpPort: parseInt(smtpPort) || 587,
      smtpUser,
      smtpPass,
    });

    // Optionally save to .env file (would need file system write permissions)
    if (saveToEnv) {
      // Note: In production, you'd want to update the .env file
      // For now, we'll just store in database
      console.log('Email config saved to database. To persist to .env, update manually.');
    }

    res.json({
      success: true,
      message: 'Email configuration saved and tested successfully',
      config: {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        hasSmtpPass: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/email-config/test
 * Send a test email
 */
router.post('/test', express.json(), async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        error: 'Test email address is required',
      });
    }

    const config = database.getEmailConfig();
    if (!config && !process.env.SMTP_HOST) {
      return res.status(400).json({
        success: false,
        error: 'Email configuration not set. Please configure email first.',
      });
    }

    // Use notification service to send test email
    await notificationService.sendAccessCodeEmail({
      customerName: 'Test User',
      customerEmail: testEmail,
      pinCode: '123456',
      checkIn: new Date(),
      checkOut: new Date(),
      codeName: 'Test Code',
      location: 'Crappie House',
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


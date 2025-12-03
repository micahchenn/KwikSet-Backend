import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmail();
    
    // Initialize Twilio client if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.log('📱 SMS not configured - will simulate SMS sending in demo mode');
    }
  }

  initializeEmail() {
    // Only use environment variables for email configuration
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('📧 Email configured from environment variables');
    } else {
      console.log('📧 Email not configured - will simulate email sending in demo mode');
      console.log('   To enable real emails, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env file');
    }
  }

  // Email config is now only via .env file - this method kept for backwards compatibility
  updateEmailConfig(config) {
    // Update email transporter with new config (for backwards compatibility)
    this.emailTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort || 587,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
    console.log('📧 Email configuration updated (temporary - use .env for persistence)');
  }

  /**
   * Send access code via email
   * @param {Object} accessCodeData - Access code and customer information
   * @returns {Promise<Object>} Email send result
   */
  async sendAccessCodeEmail(accessCodeData) {
    // Re-initialize email if not configured (in case .env was updated)
    if (!this.emailTransporter) {
      this.initializeEmail();
    }
    
    if (!this.emailTransporter) {
      // Demo mode - log the email but don't throw error (allow checkout to complete)
      console.log('📧 DEMO MODE: Would send email to', accessCodeData.customerEmail);
      console.log('   Subject: Your Access Code for Your Stay');
      console.log('   Access Code:', accessCodeData.pinCode);
      console.log('   ⚠️  EMAIL NOT CONFIGURED - Running in demo mode');
      console.log('   To enable real emails, configure SMTP settings at /email-config');
      console.log('   Or set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env file');
      return { 
        success: false, 
        demo: true, 
        error: 'Email not configured. Please set up SMTP at /email-config',
        messageId: 'demo_email_' + Date.now(), 
        method: 'email' 
      };
    }

    const {
      customerName,
      customerEmail,
      pinCode,
      checkIn,
      checkOut,
      codeName,
      location,
      date,
    } = accessCodeData;

    const checkInFormatted = new Date(checkIn).toLocaleString();
    const checkOutFormatted = new Date(checkOut).toLocaleString();
    
    // Customize subject and content for Crappie House
    const isCrappieHouse = location === 'Crappie House';
    const subject = isCrappieHouse 
      ? `Your Crappie House Day Pass Access Code - ${date || new Date(checkIn).toLocaleDateString()}`
      : 'Your Access Code for Your Stay';

    // Get the email user from environment variables
    const fromEmail = process.env.SMTP_USER || 'noreply@example.com';
    
    const mailOptions = {
      from: fromEmail,
      to: customerEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .code-box { background-color: #fff; border: 2px solid #4CAF50; border-radius: 5px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; }
            .info { margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, ${customerName}!</h1>
            </div>
            <div class="content">
              <p>${isCrappieHouse 
                ? `Your Crappie House day pass payment has been confirmed. Here is your access code for ${date || new Date(checkIn).toLocaleDateString()}:`
                : 'Your payment has been confirmed. Here is your access code for your stay:'}</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Access Code:</p>
                <div class="code">${pinCode}</div>
              </div>

              <div class="info">
                <p><strong>Check-in:</strong> ${checkInFormatted}</p>
                <p><strong>Check-out:</strong> ${checkOutFormatted}</p>
              </div>

              <p style="margin-top: 20px;">
                <strong>Instructions:</strong><br>
                1. Enter the code ${pinCode} on the keypad at the Crappie House gate<br>
                2. The code will be active from ${checkInFormatted} to ${checkOutFormatted}<br>
                3. <strong>⚠️ IMPORTANT: You cannot share your access code with others</strong><br>
                4. If you have any issues, please contact us immediately
              </p>
              ${isCrappieHouse ? '<p style="margin-top: 10px; color: #dc3545; font-weight: bold;">⚠️ Each adult must use their own unique access code. Codes cannot be shared.</p>' : ''}
            </div>
            <div class="footer">
              <p>Thank you for your booking!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome, ${customerName}!
        
        ${isCrappieHouse 
          ? `Your Crappie House day pass payment has been confirmed. Here is your access code for ${date || new Date(checkIn).toLocaleDateString()}:`
          : 'Your payment has been confirmed. Here is your access code for your stay:'}
        
        Access Code: ${pinCode}
        
        Active: ${checkInFormatted} to ${checkOutFormatted}
        
        Instructions:
        1. Enter the code ${pinCode} on the keypad${isCrappieHouse ? ' at the Crappie House gate' : ''}
        2. The code will be active from ${checkInFormatted} to ${checkOutFormatted}
        3. ⚠️ IMPORTANT: You cannot share your access code with others
        ${isCrappieHouse ? '4. Each adult must use their own unique access code. Codes cannot be shared.' : ''}
        5. If you have any issues, please contact us immediately
        
        Thank you for your booking!
      `,
    };

    try {
      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log('Access code email sent:', info.messageId);
      return { success: true, messageId: info.messageId, method: 'email' };
    } catch (error) {
      console.error('Error sending access code email:', error);
      throw error;
    }
  }

  /**
   * Send access code via SMS
   * @param {Object} accessCodeData - Access code and customer information
   * @returns {Promise<Object>} SMS send result
   */
  async sendAccessCodeSMS(accessCodeData) {
    if (!this.twilioClient) {
      // Demo mode - just log the SMS
      console.log('📱 DEMO MODE: Would send SMS to', accessCodeData.customerPhone);
      console.log('   Access Code:', accessCodeData.pinCode);
      return { success: true, messageSid: 'demo_sms_' + Date.now(), method: 'sms', demo: true };
    }

    const {
      customerPhone,
      pinCode,
      checkIn,
      checkOut,
    } = accessCodeData;

    if (!customerPhone) {
      throw new Error('Customer phone number is required for SMS');
    }

    const checkInFormatted = new Date(checkIn).toLocaleString();
    const checkOutFormatted = new Date(checkOut).toLocaleString();

    const message = `Your access code is: ${pinCode}\n\nActive from ${checkInFormatted} to ${checkOutFormatted}. Enter this code on the keypad to unlock.`;

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customerPhone,
      });

      console.log('Access code SMS sent:', result.sid);
      return { success: true, messageSid: result.sid, method: 'sms' };
    } catch (error) {
      console.error('Error sending access code SMS:', error);
      throw error;
    }
  }

  /**
   * Send access code via both email and SMS if available
   * @param {Object} accessCodeData - Access code and customer information
   * @returns {Promise<Object>} Notification results
   */
  async sendAccessCode(accessCodeData) {
    const results = {
      email: null,
      sms: null,
    };

    // Send email if configured
    if (accessCodeData.customerEmail) {
      try {
        results.email = await this.sendAccessCodeEmail(accessCodeData);
      } catch (error) {
        console.error('Failed to send email:', error.message);
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS if configured and phone number provided
    if (accessCodeData.customerPhone) {
      try {
        results.sms = await this.sendAccessCodeSMS(accessCodeData);
      } catch (error) {
        console.error('Failed to send SMS:', error.message);
        results.sms = { success: false, error: error.message };
      }
    }

    return results;
  }
}

export default new NotificationService();

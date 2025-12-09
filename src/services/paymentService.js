import accessCodeService from './accessCodeService.js';
import notificationService from './notificationService.js';

class PaymentService {
  /**
   * Process payment confirmation and generate access code
   * This is called when a payment webhook is received
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.paymentId - Payment transaction ID
   * @param {string} paymentData.customerEmail - Customer email
   * @param {string} paymentData.customerName - Customer name
   * @param {string} paymentData.customerPhone - Customer phone (optional)
   * @param {string} paymentData.deviceId - Seam device ID for the lock
   * @param {Date|string} paymentData.checkIn - Check-in date/time
   * @param {Date|string} paymentData.checkOut - Check-out date/time
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Payment currency
   * @param {string} paymentData.status - Payment status (should be 'paid' or 'succeeded')
   * @returns {Promise<Object>} Result with access code information
   */
  async processPaymentAndCreateAccessCode(paymentData) {
    const {
      paymentId,
      customerEmail,
      customerName,
      customerPhone,
      deviceId,
      checkIn,
      checkOut,
      amount,
      currency = 'USD',
      status,
    } = paymentData;

    // Validate payment status
    if (status !== 'paid' && status !== 'succeeded' && status !== 'completed') {
      throw new Error(`Payment status "${status}" does not allow access code creation. Payment must be confirmed.`);
    }

    // Convert string dates to Date objects if needed
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut);

    // Validate required fields
    if (!paymentId || !customerEmail || !customerName || !deviceId || !checkIn || !checkOut) {
      throw new Error('Missing required payment data fields');
    }

    try {
      // Create access code for the customer
      const accessCodeData = await accessCodeService.createCustomerAccessCode({
        deviceId,
        customerName,
        customerEmail,
        customerPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
      });

      // Send access code to customer via email/SMS
      const notificationResults = await notificationService.sendAccessCode({
        customerName,
        customerEmail,
        customerPhone,
        pinCode: accessCodeData.pinCode,
        checkIn: accessCodeData.checkIn,
        checkOut: accessCodeData.checkOut,
        codeName: accessCodeData.codeName,
      });

      return {
        success: true,
        paymentId,
        accessCode: {
          accessCodeId: accessCodeData.accessCodeId,
          pinCode: accessCodeData.pinCode,
          codeName: accessCodeData.codeName,
          checkIn: accessCodeData.checkIn,
          checkOut: accessCodeData.checkOut,
        },
        notifications: notificationResults,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error processing payment and creating access code:', error);
      throw error;
    }
  }
}

export default new PaymentService();




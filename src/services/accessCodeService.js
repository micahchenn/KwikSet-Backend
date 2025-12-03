import crypto from 'crypto';
import seamService from './seamService.js';

class AccessCodeService {
  /**
   * Generate a random numeric PIN code
   * @param {number} length - Length of the code (4-8 for Kwikset)
   * @returns {string} Generated PIN code
   */
  generatePinCode(length = 6) {
    // Ensure length is between 4 and 8 for Kwikset
    const codeLength = Math.max(4, Math.min(8, length));
    
    // Generate random numeric code
    const min = Math.pow(10, codeLength - 1);
    const max = Math.pow(10, codeLength) - 1;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return code.toString();
  }

  /**
   * Create an access code for a customer after payment
   * @param {Object} customerData - Customer information
   * @param {string} customerData.deviceId - Seam device ID
   * @param {string} customerData.customerName - Customer name
   * @param {string} customerData.customerEmail - Customer email
   * @param {string} customerData.customerPhone - Customer phone (optional)
   * @param {Date} customerData.checkIn - Check-in date/time
   * @param {Date} customerData.checkOut - Check-out date/time
   * @param {number} customerData.codeLength - PIN code length (default: 6)
   * @returns {Promise<Object>} Created access code with customer info
   */
  async createCustomerAccessCode(customerData) {
    const {
      deviceId,
      customerName,
      customerEmail,
      customerPhone,
      checkIn,
      checkOut,
      codeLength = parseInt(process.env.DEFAULT_CODE_LENGTH) || 6
    } = customerData;

    // Validate required fields
    if (!deviceId || !customerName || !customerEmail || !checkIn || !checkOut) {
      throw new Error('Missing required fields: deviceId, customerName, customerEmail, checkIn, checkOut');
    }

    // Generate PIN code
    const pinCode = this.generatePinCode(codeLength);

    // Create code name (truncate to 14 chars for Kwikset)
    const codeName = `${customerName.substring(0, 12)}`.padEnd(2, 'X');

    // Ensure check-in is at least 15 minutes in the future
    const minStartTime = new Date(Date.now() + 15 * 60 * 1000);
    const startsAt = checkIn < minStartTime ? minStartTime : new Date(checkIn);
    const endsAt = new Date(checkOut);

    // Validate time range
    if (endsAt <= startsAt) {
      throw new Error('Check-out time must be after check-in time');
    }

    try {
      // Create access code via Seam API
      const accessCode = await seamService.createAccessCode(deviceId, {
        name: codeName,
        code: pinCode,
        startsAt: startsAt,
        endsAt: endsAt,
      });

      return {
        accessCodeId: accessCode.access_code_id || accessCode.id,
        deviceId: deviceId,
        pinCode: pinCode,
        codeName: codeName,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        checkIn: startsAt,
        checkOut: endsAt,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating customer access code:', error);
      throw error;
    }
  }

  /**
   * Delete an access code
   * @param {string} accessCodeId - Seam access code ID
   * @returns {Promise<void>}
   */
  async deleteAccessCode(accessCodeId) {
    try {
      await seamService.deleteAccessCode(accessCodeId);
    } catch (error) {
      console.error(`Error deleting access code ${accessCodeId}:`, error);
      throw error;
    }
  }

  /**
   * Get access code details
   * @param {string} accessCodeId - Seam access code ID
   * @returns {Promise<Object>} Access code details
   */
  async getAccessCode(accessCodeId) {
    try {
      return await seamService.getAccessCode(accessCodeId);
    } catch (error) {
      console.error(`Error getting access code ${accessCodeId}:`, error);
      throw error;
    }
  }
}

export default new AccessCodeService();


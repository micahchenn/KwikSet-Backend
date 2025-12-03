import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class SeamService {
  constructor() {
    if (!process.env.SEAM_API_KEY || process.env.SEAM_API_KEY.includes('your_api_key')) {
      console.warn('⚠️  SEAM_API_KEY not configured. Running in DEMO mode.');
      this.apiKey = null;
      this.demoMode = true;
    } else {
      this.apiKey = process.env.SEAM_API_KEY;
      this.demoMode = false;
    }
    
    this.baseURL = 'https://connect.getseam.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey || 'demo'}`,
        'Content-Type': 'application/json',
      },
    });
    
    // Demo data storage
    this.demoDevices = [
      {
        device_id: 'demo_device_001',
        name: 'Front Door Lock',
        device_type: 'kwikset_lock',
        properties: { manufacturer: 'kwikset' },
        connected_account: { provider: 'kwikset' },
      },
      {
        device_id: 'demo_device_002',
        name: 'Back Door Lock',
        device_type: 'kwikset_lock',
        properties: { manufacturer: 'kwikset' },
        connected_account: { provider: 'kwikset' },
      },
    ];
    
    this.demoAccessCodes = [];
  }

  /**
   * Get all Kwikset devices for a workspace
   * @returns {Promise<Array>} List of devices
   */
  async getKwiksetDevices() {
    try {
      if (this.demoMode) {
        console.log('📱 DEMO MODE: Returning demo devices');
        return this.demoDevices;
      }
      
      const response = await this.client.get('/locks/list');
      const locks = response.data.locks || [];
      
      // Filter for Kwikset devices
      return locks.filter(device => 
        device.properties?.manufacturer?.toLowerCase() === 'kwikset' ||
        device.device_type === 'kwikset_lock' ||
        device.connected_account?.provider?.toLowerCase() === 'kwikset' ||
        device.device_type?.toLowerCase().includes('kwikset')
      );
    } catch (error) {
      console.error('Error fetching Kwikset devices:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a specific device by ID
   * @param {string} deviceId - The Seam device ID
   * @returns {Promise<Object>} Device object
   */
  async getDevice(deviceId) {
    try {
      if (this.demoMode) {
        const device = this.demoDevices.find(d => d.device_id === deviceId);
        if (!device) {
          throw new Error(`Device ${deviceId} not found`);
        }
        console.log(`📱 DEMO MODE: Returning device ${deviceId}`);
        return device;
      }
      
      const response = await this.client.get('/locks/get', {
        params: { device_id: deviceId },
      });
      return response.data.lock;
    } catch (error) {
      console.error(`Error fetching device ${deviceId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create an access code for a Kwikset lock
   * @param {string} deviceId - The Seam device ID
   * @param {Object} codeOptions - Access code configuration
   * @param {string} codeOptions.name - Code name (2-14 characters, will be truncated if longer)
   * @param {string} codeOptions.code - PIN code (4-8 digits)
   * @param {Date} codeOptions.startsAt - Start time (must be at least 15 minutes in future)
   * @param {Date} codeOptions.endsAt - End time
   * @returns {Promise<Object>} Created access code
   */
  async createAccessCode(deviceId, codeOptions) {
    try {
      const { name, code, startsAt, endsAt } = codeOptions;

      // Validate code length (4-8 digits for Kwikset)
      if (code.length < 4 || code.length > 8) {
        throw new Error('Access code must be 4-8 digits for Kwikset locks');
      }

      // Validate name length (2-14 characters, will be truncated if longer)
      const truncatedName = name.length > 14 ? name.substring(0, 14) : name;
      if (truncatedName.length < 2) {
        throw new Error('Access code name must be at least 2 characters');
      }

      // Ensure startsAt is at least 15 minutes in the future
      const minStartTime = new Date(Date.now() + 15 * 60 * 1000);
      const actualStartTime = startsAt < minStartTime ? minStartTime : startsAt;

      if (this.demoMode) {
        const accessCode = {
          access_code_id: `demo_code_${Date.now()}`,
          device_id: deviceId,
          name: truncatedName,
          code: code,
          starts_at: actualStartTime.toISOString(),
          ends_at: endsAt.toISOString(),
          created_at: new Date().toISOString(),
        };
        this.demoAccessCodes.push(accessCode);
        console.log('📱 DEMO MODE: Created access code', accessCode);
        return accessCode;
      }

      const response = await this.client.post('/access_codes/create', {
        device_id: deviceId,
        name: truncatedName,
        code: code,
        starts_at: actualStartTime.toISOString(),
        ends_at: endsAt.toISOString(),
      });
      
      return response.data.access_code;
    } catch (error) {
      console.error('Error creating access code:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete an access code
   * @param {string} accessCodeId - The Seam access code ID
   * @returns {Promise<void>}
   */
  async deleteAccessCode(accessCodeId) {
    try {
      if (this.demoMode) {
        const index = this.demoAccessCodes.findIndex(ac => ac.access_code_id === accessCodeId);
        if (index > -1) {
          this.demoAccessCodes.splice(index, 1);
          console.log(`📱 DEMO MODE: Deleted access code ${accessCodeId}`);
          return;
        }
        throw new Error(`Access code ${accessCodeId} not found`);
      }
      
      await this.client.post('/access_codes/delete', {
        access_code_id: accessCodeId,
      });
    } catch (error) {
      console.error(`Error deleting access code ${accessCodeId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get access code details
   * @param {string} accessCodeId - The Seam access code ID
   * @returns {Promise<Object>} Access code object
   */
  async getAccessCode(accessCodeId) {
    try {
      if (this.demoMode) {
        const accessCode = this.demoAccessCodes.find(ac => ac.access_code_id === accessCodeId);
        if (!accessCode) {
          throw new Error(`Access code ${accessCodeId} not found`);
        }
        console.log(`📱 DEMO MODE: Returning access code ${accessCodeId}`);
        return accessCode;
      }
      
      const response = await this.client.get('/access_codes/get', {
        params: { access_code_id: accessCodeId },
      });
      return response.data.access_code;
    } catch (error) {
      console.error(`Error fetching access code ${accessCodeId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Lock a device
   * @param {string} deviceId - The Seam device ID
   * @returns {Promise<Object>} Action attempt
   */
  async lockDevice(deviceId) {
    try {
      if (this.demoMode) {
        console.log(`📱 DEMO MODE: Locking device ${deviceId}`);
        return {
          action_attempt_id: `demo_action_${Date.now()}`,
          status: 'success',
          action_type: 'LOCK_DOOR',
        };
      }
      
      const response = await this.client.post('/locks/lock_door', {
        device_id: deviceId,
      });
      return response.data.action_attempt;
    } catch (error) {
      console.error(`Error locking device ${deviceId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Unlock a device
   * @param {string} deviceId - The Seam device ID
   * @returns {Promise<Object>} Action attempt
   */
  async unlockDevice(deviceId) {
    try {
      if (this.demoMode) {
        console.log(`📱 DEMO MODE: Unlocking device ${deviceId}`);
        return {
          action_attempt_id: `demo_action_${Date.now()}`,
          status: 'success',
          action_type: 'UNLOCK_DOOR',
        };
      }
      
      const response = await this.client.post('/locks/unlock_door', {
        device_id: deviceId,
      });
      return response.data.action_attempt;
    } catch (error) {
      console.error(`Error unlocking device ${deviceId}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

export default new SeamService();

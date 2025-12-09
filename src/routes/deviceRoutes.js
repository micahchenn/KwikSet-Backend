import express from 'express';
import seamService from '../services/seamService.js';

const router = express.Router();

/**
 * GET /api/devices
 * Get all Kwikset devices
 */
router.get('/', async (req, res) => {
  try {
    const devices = await seamService.getKwiksetDevices();
    res.json({
      success: true,
      devices: devices,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/devices/:deviceId
 * Get a specific device
 */
router.get('/:deviceId', async (req, res) => {
  try {
    const device = await seamService.getDevice(req.params.deviceId);
    res.json({
      success: true,
      device: device,
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/devices/:deviceId/lock
 * Lock a device
 */
router.post('/:deviceId/lock', async (req, res) => {
  try {
    const actionAttempt = await seamService.lockDevice(req.params.deviceId);
    res.json({
      success: true,
      actionAttempt: actionAttempt,
    });
  } catch (error) {
    console.error('Error locking device:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/devices/:deviceId/unlock
 * Unlock a device
 */
router.post('/:deviceId/unlock', async (req, res) => {
  try {
    const actionAttempt = await seamService.unlockDevice(req.params.deviceId);
    res.json({
      success: true,
      actionAttempt: actionAttempt,
    });
  } catch (error) {
    console.error('Error unlocking device:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;




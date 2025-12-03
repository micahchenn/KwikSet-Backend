import express from 'express';
import seamService from '../services/seamService.js';

const router = express.Router();

/**
 * POST /api/connect/create-webview
 * Create a Seam Connect Webview to connect Kwikset account
 */
router.post('/create-webview', async (req, res) => {
  try {
    if (seamService.demoMode) {
      return res.status(400).json({
        success: false,
        error: 'Please configure your SEAM_API_KEY in .env file to connect real devices',
      });
    }

    const response = await seamService.client.post('/connect_webviews/create', {
      accepted_providers: ['kwikset'],
      custom_redirect_url: req.body.redirectUrl || null,
      custom_redirect_failure_url: req.body.failureUrl || null,
    });

    res.json({
      success: true,
      connectWebview: response.data.connect_webview,
      url: response.data.connect_webview.url,
    });
  } catch (error) {
    console.error('Error creating connect webview:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * GET /api/connect/webview/:webviewId
 * Get connect webview status
 */
router.get('/webview/:webviewId', async (req, res) => {
  try {
    if (seamService.demoMode) {
      return res.status(400).json({
        success: false,
        error: 'Demo mode - no real webviews available',
      });
    }

    const response = await seamService.client.get('/connect_webviews/get', {
      params: { connect_webview_id: req.params.webviewId },
    });

    res.json({
      success: true,
      connectWebview: response.data.connect_webview,
    });
  } catch (error) {
    console.error('Error fetching connect webview:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

export default router;


/**
 * AI API Routes
 * Mock AI endpoints with role-based access control
 * 
 * GET /api/ai/free-model - Accessible by all logged-in users
 * POST /api/ai/premium-model - Accessible by Premium_User and Admin
 * DELETE /api/ai/purge-cache - Accessible only by Admin
 */

const express = require('express');
const { protect } = require('./authMiddleware');
const { restrictTo } = require('./rbacMiddleware');

const router = express.Router();

/**
 * GET /api/ai/free-model
 * Free tier model - Accessible by all authenticated users
 */
router.get('/free-model', protect, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Free model access granted',
      data: {
        model: 'GPT-2 Free Tier',
        description: 'Basic text generation model available to all users',
        capabilities: ['text-generation', 'basic-summarization'],
        maxTokens: 100,
        rateLimit: '10 requests/hour',
        accessedBy: {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Free model error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/ai/premium-model
 * Premium model - Accessible only by Premium_User and Admin
 */
router.post('/premium-model', protect, restrictTo('Premium_User', 'Admin'), (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
        errorCode: 'MISSING_PROMPT'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Premium model access granted',
      data: {
        model: 'GPT-4 Premium',
        description: 'Advanced text and image generation for premium members',
        capabilities: ['advanced-text-generation', 'image-generation', 'summarization', 'code-generation'],
        maxTokens: 2048,
        rateLimit: '100 requests/hour',
        userPrompt: prompt,
        generatedResponse: 'This is a mock response from the premium AI model...',
        accessedBy: {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Premium model error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/ai/purge-cache
 * Admin only - Clear system cache
 */
router.delete('/purge-cache', protect, restrictTo('Admin'), (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Cache purged successfully',
      data: {
        operation: 'purge-cache',
        timestamp: new Date().toISOString(),
        clearedItems: {
          userCache: 1250,
          modelCache: 345,
          tokenBlacklist: 89
        },
        totalSize: '2.4 MB',
        performedBy: {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Purge cache error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR'
    });
  }
});

module.exports = router;

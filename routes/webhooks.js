const express = require('express');
const router = express.Router();
const { handleDuffelWebhook } = require('../controllers/webhookController');

/**
 * @swagger
 * /webhooks/duffel:
 *   post:
 *     summary: Receive webhooks from Duffel
 *     tags: [Webhooks]
 *     description: Handles events like order updates, schedule changes, cancellations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: order.schedule_changed
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook received
 *       401:
 *         description: Invalid signature
 */
router.post('/duffel', express.json({ 
  verify: (req, res, buf) => {
    // Store raw body for signature verification
    req.rawBody = buf.toString();
  }
}), handleDuffelWebhook);

module.exports = router;


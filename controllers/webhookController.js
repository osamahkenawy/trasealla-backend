const { FlightOrder, Booking, AuditLog } = require('../models');
const crypto = require('crypto');

/**
 * Handle Duffel webhooks
 * POST /webhooks/duffel
 */
const handleDuffelWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-duffel-signature'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature (if secret is configured)
    if (process.env.DUFFEL_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.DUFFEL_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { event, data } = req.body;

    console.log('📡 Duffel Webhook Received:', event);
    console.log('Data:', JSON.stringify(data, null, 2));

    // Log webhook event
    await AuditLog.create({
      action: 'WEBHOOK',
      entity: 'duffel_event',
      metadata: {
        event,
        dataId: data.id,
        payload: req.body
      },
      status: 'pending'
    });

    // Handle different event types
    switch (event) {
      case 'order.created':
        await handleOrderCreated(data);
        break;

      case 'order.updated':
        await handleOrderUpdated(data);
        break;

      case 'order.cancelled':
        await handleOrderCancelled(data);
        break;

      case 'order.schedule_changed':
        await handleScheduleChange(data);
        break;

      case 'order.airline_initiated_change':
        await handleAirlineChange(data);
        break;

      case 'order_change.created':
        await handleOrderChangeCreated(data);
        break;

      case 'order_change.confirmed':
        await handleOrderChangeConfirmed(data);
        break;

      case 'order_cancellation.confirmed':
        await handleCancellationConfirmed(data);
        break;

      default:
        console.log('⚠️  Unhandled webhook event:', event);
    }

    // Acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle order created event
 */
const handleOrderCreated = async (data) => {
  console.log('✅ Order created:', data.id);
  // Usually created by us, just log
};

/**
 * Handle order updated event
 */
const handleOrderUpdated = async (data) => {
  console.log('🔄 Order updated:', data.id);
  
  // Find order by Duffel order ID
  const flightOrder = await FlightOrder.findOne({
    where: { amadeusOrderId: data.id }
  });

  if (flightOrder) {
    await flightOrder.update({
      flightOfferData: { ...flightOrder.flightOfferData, updated: data }
    });
  }
};

/**
 * Handle order cancelled event
 */
const handleOrderCancelled = async (data) => {
  console.log('❌ Order cancelled:', data.id);
  
  const flightOrder = await FlightOrder.findOne({
    where: { amadeusOrderId: data.id }
  });

  if (flightOrder) {
    await flightOrder.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    // Send notification
    const { sendCancellationEmail } = require('../utils/emailService');
    try {
      await sendCancellationEmail(flightOrder, flightOrder.contactEmail);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }
  }
};

/**
 * Handle schedule change event (CRITICAL - notify customers!)
 */
const handleScheduleChange = async (data) => {
  console.log('⚠️  Schedule change detected:', data.id);
  
  const flightOrder = await FlightOrder.findOne({
    where: { amadeusOrderId: data.id }
  });

  if (flightOrder) {
    // Update order with new schedule
    await flightOrder.update({
      itineraries: data.slices,
      flightOfferData: { ...flightOrder.flightOfferData, scheduleChanged: true, newSlices: data.slices }
    });

    // TODO: Send schedule change notification email
    console.log(`📧 Should notify customer: ${flightOrder.contactEmail}`);
    console.log('Schedule change details:', data.schedule_change);
  }
};

/**
 * Handle airline initiated change
 */
const handleAirlineChange = async (data) => {
  console.log('✈️ Airline initiated change:', data.id);
  await handleScheduleChange(data);
};

/**
 * Handle order change created
 */
const handleOrderChangeCreated = async (data) => {
  console.log('🔄 Order change created:', data.id);
};

/**
 * Handle order change confirmed
 */
const handleOrderChangeConfirmed = async (data) => {
  console.log('✅ Order change confirmed:', data.id);
  
  const flightOrder = await FlightOrder.findOne({
    where: { amadeusOrderId: data.order_id }
  });

  if (flightOrder) {
    // Update with change details
    await flightOrder.update({
      totalAmount: data.new_total_amount || flightOrder.totalAmount
    });
  }
};

/**
 * Handle cancellation confirmed
 */
const handleCancellationConfirmed = async (data) => {
  console.log('✅ Cancellation confirmed:', data.id);
  
  const flightOrder = await FlightOrder.findOne({
    where: { amadeusOrderId: data.order_id }
  });

  if (flightOrder) {
    await flightOrder.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });
  }
};

module.exports = {
  handleDuffelWebhook
};


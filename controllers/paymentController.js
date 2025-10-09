const { Payment, Booking, FlightOrder, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Create payment intent for a booking
 * POST /api/payments/create-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount, currency, paymentMethod = 'card' } = req.body;

    if (!bookingId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'bookingId, amount, and currency are required'
      });
    }

    // Find the booking
    const booking = await Booking.findOne({
      where: {
        [Op.or]: [
          { id: bookingId },
          { bookingNumber: bookingId }
        ]
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    // Verify amount matches booking
    if (parseFloat(amount) !== parseFloat(booking.totalAmount)) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Booking total is ${booking.currency} ${booking.totalAmount}`
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      bookingId: booking.id,
      transactionId: `TXN-${Date.now()}`,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      paymentMethod,
      status: 'pending',
      paymentGateway: paymentMethod === 'card' ? 'stripe' : paymentMethod,
      metadata: {
        bookingNumber: booking.bookingNumber,
        bookingType: booking.bookingType
      }
    });

    // For now, we'll simulate a payment intent
    // In production, integrate with Stripe/PayTabs/PayFort
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    };

    // Update payment with intent ID
    await payment.update({
      paymentIntentId: paymentIntent.id,
      gatewayResponse: paymentIntent
    });

    res.json({
      success: true,
      message: 'Payment intent created',
      data: {
        payment,
        paymentIntent,
        booking: {
          bookingNumber: booking.bookingNumber,
          totalAmount: booking.totalAmount,
          currency: booking.currency
        }
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
};

/**
 * Process payment (complete the payment)
 * POST /api/payments/process
 */
exports.processPayment = async (req, res) => {
  try {
    const { paymentId, paymentIntentId, paymentMethodId } = req.body;

    if (!paymentId && !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId or paymentIntentId is required'
      });
    }

    // Find payment
    const payment = await Payment.findOne({
      where: paymentId 
        ? { id: paymentId }
        : { paymentIntentId },
      include: [{
        model: Booking,
        as: 'booking'
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Simulate payment processing
    // In production: Call Stripe/PayTabs/PayFort API here
    const paymentResult = {
      id: payment.paymentIntentId,
      status: 'succeeded',
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: paymentMethodId || 'pm_card_visa',
      receiptUrl: `https://receipt.trasealla.com/${payment.transactionId}`
    };

    // Update payment status
    await payment.update({
      status: 'completed',
      paidAt: new Date(),
      gatewayResponse: paymentResult
    });

    // Update booking payment status
    await payment.booking.update({
      paymentStatus: 'paid',
      paymentMethod: payment.paymentMethod
    });

    // If it's a flight booking, update flight order
    if (payment.booking.bookingType === 'flight') {
      const flightOrder = await FlightOrder.findOne({
        where: { bookingId: payment.bookingId }
      });
      
      if (flightOrder) {
        await flightOrder.update({
          paymentStatus: 'paid',
          amountPaid: payment.amount,
          ticketingStatus: 'issued' // Auto-issue ticket after payment
        });
      }
    }

    // Log payment
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'payment',
      entityId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        bookingNumber: payment.booking.bookingNumber,
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment,
        booking: payment.booking,
        receipt: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          paidAt: payment.paidAt,
          receiptUrl: paymentResult.receiptUrl
        }
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
};

/**
 * Get payment history
 * GET /api/payments/history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [{
        model: Booking,
        as: 'booking',
        attributes: ['id', 'bookingNumber', 'bookingType', 'totalAmount']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history'
    });
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:id
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        [Op.or]: [
          { id: req.params.id },
          { transactionId: req.params.id }
        ]
      },
      include: [{
        model: Booking,
        as: 'booking'
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment'
    });
  }
};

/**
 * Request refund
 * POST /api/payments/refund
 */
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId is required'
      });
    }

    const payment = await Payment.findByPk(paymentId, {
      include: [{
        model: Booking,
        as: 'booking'
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if payment is completed
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    const refundAmount = amount || payment.amount;

    // Validate refund amount
    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }

    // Simulate refund (in production: call payment gateway)
    const refundResult = {
      id: `ref_${Date.now()}`,
      amount: refundAmount,
      currency: payment.currency,
      status: 'succeeded',
      reason: reason || 'requested_by_customer'
    };

    // Update payment status
    await payment.update({
      status: refundAmount >= payment.amount ? 'refunded' : 'partially_refunded',
      refundedAmount: refundAmount,
      refundedAt: new Date(),
      gatewayResponse: {
        ...payment.gatewayResponse,
        refund: refundResult
      }
    });

    // Update booking status
    await payment.booking.update({
      paymentStatus: 'refunded',
      bookingStatus: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason
    });

    // Log refund
    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'payment_refund',
      entityId: payment.id,
      metadata: {
        refundAmount,
        currency: payment.currency,
        reason,
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        payment,
        refund: refundResult
      }
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund'
    });
  }
};

/**
 * Quick pay for a booking (simplified flow)
 * POST /api/payments/quick-pay
 */
exports.quickPay = async (req, res) => {
  try {
    const { bookingNumber, paymentMethod = 'card' } = req.body;

    if (!bookingNumber) {
      return res.status(400).json({
        success: false,
        message: 'bookingNumber is required'
      });
    }

    // Find booking
    const booking = await Booking.findOne({
      where: { bookingNumber }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    // Create and process payment in one step
    const payment = await Payment.create({
      userId: req.user.id,
      bookingId: booking.id,
      transactionId: `TXN-${Date.now()}`,
      amount: booking.totalAmount,
      currency: booking.currency,
      paymentMethod,
      status: 'completed',
      paymentGateway: 'manual',
      paidAt: new Date(),
      metadata: {
        bookingNumber: booking.bookingNumber,
        quickPay: true
      }
    });

    // Update booking
    await booking.update({
      paymentStatus: 'paid',
      paymentMethod
    });

    // Update flight order if applicable
    if (booking.bookingType === 'flight') {
      const flightOrder = await FlightOrder.findOne({
        where: { bookingId: booking.id }
      });
      
      if (flightOrder) {
        await flightOrder.update({
          paymentStatus: 'paid',
          amountPaid: payment.amount,
          ticketingStatus: 'issued',
          ticketedAt: new Date()
        });
      }
    }

    // Log payment
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'payment',
      entityId: payment.id,
      metadata: {
        amount: payment.amount,
        currency: payment.currency,
        bookingNumber: booking.bookingNumber,
        quickPay: true,
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        payment,
        booking,
        receipt: {
          transactionId: payment.transactionId,
          bookingNumber: booking.bookingNumber,
          amount: payment.amount,
          currency: payment.currency,
          paidAt: payment.paidAt,
          status: 'paid'
        }
      }
    });
  } catch (error) {
    console.error('Quick pay error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
};

/**
 * Webhook handler for payment gateway
 * POST /api/payments/webhook
 */
exports.paymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    // Verify webhook signature (in production)
    // const signature = req.headers['stripe-signature'];
    // const verified = verifyWebhookSignature(signature, req.body);

    console.log('Payment webhook received:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.succeeded':
        // Update payment and booking status
        await Payment.update(
          { status: 'completed', paidAt: new Date() },
          { where: { paymentIntentId: data.id } }
        );
        break;

      case 'payment.failed':
        await Payment.update(
          { status: 'failed' },
          { where: { paymentIntentId: data.id } }
        );
        break;

      case 'refund.succeeded':
        await Payment.update(
          { status: 'refunded', refundedAt: new Date() },
          { where: { transactionId: data.paymentId } }
        );
        break;
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};

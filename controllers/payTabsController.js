const PayTabsProvider = require('../services/payments/PayTabsProvider');
const { Payment, Booking, FlightOrder, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Initialize PayTabs provider
const payTabsProvider = new PayTabsProvider();

/**
 * Create PayTabs payment page for a booking
 * POST /api/payments/paytabs/create
 */
exports.createPayTabsPayment = async (req, res) => {
  try {
    const { bookingNumber, returnUrl } = req.body;

    if (!bookingNumber) {
      return res.status(400).json({
        success: false,
        message: 'bookingNumber is required'
      });
    }

    // Find booking
    const booking = await Booking.findOne({
      where: { bookingNumber },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'phone']
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    // Check authorization
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create payment record (pending)
    const payment = await Payment.create({
      userId: req.user.id,
      bookingId: booking.id,
      transactionId: `PAYTABS-${Date.now()}`,
      amount: booking.totalAmount,
      currency: booking.currency,
      paymentMethod: 'card',
      paymentGateway: 'paytabs',
      status: 'pending',
      metadata: {
        bookingNumber: booking.bookingNumber,
        bookingType: booking.bookingType
      }
    });

    // Create PayTabs payment page
    const payTabsPayment = await payTabsProvider.createPaymentPage({
      amount: booking.totalAmount,
      currency: booking.currency,
      customerName: booking.contactName,
      customerEmail: booking.contactEmail,
      customerPhone: booking.contactPhone,
      orderDescription: `${booking.bookingType} booking - ${booking.bookingNumber}`,
      orderReference: booking.bookingNumber,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/return`,
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payments/paytabs/callback`
    });

    // Update payment with PayTabs transaction ID
    await payment.update({
      transactionId: payTabsPayment.transactionId,
      gatewayResponse: payTabsPayment
    });

    // Log payment creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'payment',
      entityId: payment.id,
      metadata: {
        gateway: 'PayTabs',
        amount: payment.amount,
        currency: payment.currency,
        bookingNumber,
        ip: req.ip
      }
    });

    res.json({
      success: true,
      message: 'PayTabs payment page created',
      data: {
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency
        },
        paymentUrl: payTabsPayment.paymentUrl,
        booking: {
          bookingNumber: booking.bookingNumber,
          totalAmount: booking.totalAmount,
          currency: booking.currency
        },
        instructions: {
          step1: 'Redirect customer to paymentUrl',
          step2: 'Customer completes payment on PayTabs',
          step3: 'PayTabs sends callback to webhook',
          step4: 'Booking auto-confirmed and ticket issued'
        }
      }
    });
  } catch (error) {
    console.error('Create PayTabs payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating PayTabs payment'
    });
  }
};

/**
 * PayTabs callback webhook (called by PayTabs after payment)
 * POST /api/payments/paytabs/callback
 */
exports.payTabsCallback = async (req, res) => {
  try {
    console.log('PayTabs callback received:', req.body);

    const {
      tran_ref,
      cart_id,
      cart_amount,
      cart_currency,
      payment_result
    } = req.body;

    // Find payment by cart_id (booking number)
    const payment = await Payment.findOne({
      where: {
        [Op.or]: [
          { transactionId: tran_ref },
          { metadata: { bookingNumber: cart_id } }
        ]
      },
      include: [{
        model: Booking,
        as: 'booking'
      }]
    });

    if (!payment) {
      console.error('Payment not found for callback:', cart_id);
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Verify payment with PayTabs
    const verificationResult = await payTabsProvider.verifyPayment(tran_ref);

    if (verificationResult.success) {
      // Payment successful! Update payment status
      await payment.update({
        status: 'completed',
        paidAt: new Date(),
        transactionId: tran_ref,
        gatewayResponse: {
          ...payment.gatewayResponse,
          verification: verificationResult
        }
      });

      // Update booking status
      await payment.booking.update({
        paymentStatus: 'paid',
        paymentMethod: verificationResult.paymentMethod || 'card'
      });

      // If it's a flight booking, update flight order and auto-issue ticket
      if (payment.booking.bookingType === 'flight') {
        const flightOrder = await FlightOrder.findOne({
          where: { bookingId: payment.bookingId }
        });

        if (flightOrder) {
          await flightOrder.update({
            paymentStatus: 'paid',
            amountPaid: payment.amount,
            ticketingStatus: 'issued',
            ticketedAt: new Date()
          });

          console.log(`✅ Flight order ${flightOrder.orderNumber} ticketed after PayTabs payment`);
        }
      }

      // Log successful payment
      await AuditLog.create({
        userId: payment.userId,
        action: 'UPDATE',
        entity: 'payment_success',
        entityId: payment.id,
        metadata: {
          gateway: 'PayTabs',
          transactionId: tran_ref,
          amount: cart_amount,
          currency: cart_currency,
          paymentMethod: verificationResult.paymentMethod
        }
      });

      // TODO: Send confirmation email/WhatsApp to customer
      // TODO: Send e-ticket if flight booking

      res.json({ success: true, message: 'Payment processed successfully' });
    } else {
      // Payment failed
      await payment.update({
        status: 'failed',
        gatewayResponse: {
          ...payment.gatewayResponse,
          verification: verificationResult
        }
      });

      // Log failed payment
      await AuditLog.create({
        userId: payment.userId,
        action: 'UPDATE',
        entity: 'payment_failed',
        entityId: payment.id,
        metadata: {
          gateway: 'PayTabs',
          transactionId: tran_ref,
          reason: verificationResult.message
        }
      });

      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('PayTabs callback error:', error);
    res.status(500).json({ success: false, message: 'Callback processing error' });
  }
};

/**
 * Verify PayTabs payment manually
 * GET /api/payments/paytabs/verify/:transactionRef
 */
exports.verifyPayTabsPayment = async (req, res) => {
  try {
    const { transactionRef } = req.params;

    const verificationResult = await payTabsProvider.verifyPayment(transactionRef);

    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    console.error('Verify PayTabs payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

/**
 * Process PayTabs refund
 * POST /api/payments/paytabs/refund
 */
exports.processPayTabsRefund = async (req, res) => {
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process refunds'
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

    // Process refund with PayTabs
    const refundResult = await payTabsProvider.processRefund(
      payment.transactionId,
      refundAmount,
      reason
    );

    if (refundResult.success) {
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

      // Update booking
      await payment.booking.update({
        paymentStatus: 'refunded',
        bookingStatus: 'cancelled'
      });

      // Log refund
      await AuditLog.create({
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'payment_refund',
        entityId: payment.id,
        metadata: {
          refundAmount,
          reason,
          gateway: 'PayTabs'
        }
      });

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: refundResult
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund failed',
        details: refundResult
      });
    }
  } catch (error) {
    console.error('PayTabs refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund'
    });
  }
};

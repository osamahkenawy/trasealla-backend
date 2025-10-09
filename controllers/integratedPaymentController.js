const PayTabsProvider = require('../services/payments/PayTabsProvider');
const AmadeusFlightProvider = require('../services/providers/AmadeusFlightProvider');
const { Payment, Booking, FlightOrder, User, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Initialize providers
const payTabsProvider = new PayTabsProvider();
const flightProvider = new AmadeusFlightProvider();

/**
 * Complete integrated flow: Book flight + Create payment in one step
 * POST /api/flights/book-and-pay
 * 
 * This endpoint:
 * 1. Creates Amadeus flight order (reserves seat, gets PNR)
 * 2. Creates PayTabs payment page
 * 3. Returns payment URL for customer
 * 4. On payment success webhook → Auto-issues ticket
 */
exports.bookFlightAndPay = async (req, res) => {
  try {
    const { flightOffer, travelers, contacts, remarks } = req.body;

    // Validation
    if (!flightOffer || !travelers || !contacts) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer, travelers, and contacts are required'
      });
    }

    // Accept both transformed format or raw Amadeus format
    let amadeusFlightOffer = flightOffer.raw || flightOffer;

    // Calculate amounts
    const totalAmount = parseFloat(amadeusFlightOffer.price.grandTotal);
    const baseAmount = parseFloat(amadeusFlightOffer.price.base);
    const taxAmount = totalAmount - baseAmount;
    const contactName = contacts.name || `${travelers[0].firstName} ${travelers[0].lastName}`;

    // STEP 1: Create Amadeus flight order
    console.log('Creating Amadeus flight order...');
    
    const amadeusOrder = await flightProvider.createFlightOrder({
      flightOffer: amadeusFlightOffer,
      travelers,
      contacts,
      remarks
    });

    console.log('✅ Amadeus order created:', amadeusOrder.id);
    console.log('✅ PNR:', amadeusOrder.associatedRecords?.[0]?.reference);

    // STEP 2: Create booking records
    const booking = await Booking.create({
      userId: req.user.id,
      bookingType: 'flight',
      referenceId: 0,
      bookingNumber: `BKG-FLT-${Date.now()}`,
      bookingStatus: 'pending', // Pending until payment
      travelDate: amadeusFlightOffer.itineraries[0].segments[0].departure.at,
      numberOfPeople: travelers.length,
      totalAmount,
      currency: amadeusFlightOffer.price.currency,
      contactName,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      travelers,
      notes: remarks || null
    });

    const flightOrder = await FlightOrder.create({
      orderNumber: `ORD-FLT-${Date.now()}`,
      userId: req.user.id,
      bookingId: booking.id,
      amadeusOrderId: amadeusOrder.id,
      pnr: amadeusOrder.associatedRecords?.[0]?.reference || `TMP${Date.now()}`,
      gdsRecordLocator: amadeusOrder.associatedRecords?.[0]?.reference,
      status: 'confirmed',
      ticketingStatus: 'not_issued', // Will be issued after payment
      flightOfferData: amadeusFlightOffer,
      itineraries: amadeusFlightOffer.itineraries,
      totalAmount,
      baseAmount,
      taxAmount,
      currency: amadeusFlightOffer.price.currency,
      travelers,
      numberOfTravelers: travelers.length,
      contactEmail: contacts.email,
      contactPhone: contacts.phone,
      validatingAirline: amadeusFlightOffer.validatingAirlineCodes?.[0],
      operatingAirlines: extractOperatingAirlines(amadeusFlightOffer),
      bookingChannel: req.user.role === 'agent' ? 'agent' : 'web',
      agentId: req.user.role === 'agent' ? req.user.id : null
    });

    // Update booking reference
    await booking.update({ referenceId: flightOrder.id });

    // STEP 3: Create PayTabs payment page
    console.log('Creating PayTabs payment page...');
    
    const payTabsPayment = await payTabsProvider.createPaymentPage({
      amount: totalAmount,
      currency: amadeusFlightOffer.price.currency,
      customerName: contactName,
      customerEmail: contacts.email,
      customerPhone: contacts.phone,
      orderDescription: `Flight ${amadeusFlightOffer.validatingAirlineCodes[0]} - ${booking.bookingNumber}`,
      orderReference: booking.bookingNumber,
      returnUrl: `${process.env.FRONTEND_URL}/booking/success`,
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payments/paytabs/callback`
    });

    // STEP 4: Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      bookingId: booking.id,
      transactionId: payTabsPayment.transactionId,
      amount: totalAmount,
      currency: amadeusFlightOffer.price.currency,
      paymentMethod: 'card',
      paymentGateway: 'paytabs',
      status: 'pending',
      paymentIntentId: payTabsPayment.transactionId,
      gatewayResponse: payTabsPayment,
      metadata: {
        bookingNumber: booking.bookingNumber,
        pnr: flightOrder.pnr,
        amadeusOrderId: amadeusOrder.id
      }
    });

    // Log booking creation
    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'flight_booking_payment',
      entityId: flightOrder.id,
      metadata: {
        bookingNumber: booking.bookingNumber,
        pnr: flightOrder.pnr,
        amadeusOrderId: amadeusOrder.id,
        paymentUrl: payTabsPayment.paymentUrl,
        amount: totalAmount,
        currency: amadeusFlightOffer.price.currency
      }
    });

    // STEP 5: Return payment URL to customer
    res.status(201).json({
      success: true,
      message: 'Flight reserved! Please complete payment to confirm booking.',
      data: {
        booking: {
          bookingNumber: booking.bookingNumber,
          status: 'pending_payment',
          totalAmount: booking.totalAmount,
          currency: booking.currency
        },
        flightOrder: {
          orderNumber: flightOrder.orderNumber,
          pnr: flightOrder.pnr,
          amadeusOrderId: amadeusOrder.id,
          status: 'confirmed',
          ticketingStatus: 'not_issued'
        },
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          status: 'pending',
          paymentUrl: payTabsPayment.paymentUrl
        },
        nextSteps: {
          step: 'payment',
          message: 'Redirect customer to paymentUrl to complete payment',
          paymentUrl: payTabsPayment.paymentUrl,
          expiresIn: '30 minutes'
        }
      }
    });
  } catch (error) {
    console.error('Book and pay error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing booking and payment'
    });
  }
};

/**
 * Safer flow: Collect payment BEFORE booking with Amadeus
 * POST /api/flights/pay-then-book
 * 
 * Recommended flow:
 * 1. Customer pays first (PayTabs)
 * 2. Payment confirmed
 * 3. Then book with Amadeus
 * 4. No risk!
 */
exports.payThenBook = async (req, res) => {
  try {
    const { flightOffer, travelers, contacts, remarks } = req.body;

    // Validation
    if (!flightOffer || !travelers || !contacts) {
      return res.status(400).json({
        success: false,
        message: 'flightOffer, travelers, and contacts are required'
      });
    }

    let amadeusFlightOffer = flightOffer.raw || flightOffer;
    const totalAmount = parseFloat(amadeusFlightOffer.price.grandTotal);
    const contactName = contacts.name || `${travelers[0].firstName} ${travelers[0].lastName}`;

    // STEP 1: Create PayTabs payment FIRST (before booking)
    console.log('Step 1: Creating PayTabs payment (no booking yet)...');
    
    const tempBookingRef = `TEMP-${Date.now()}`;
    
    const payTabsPayment = await payTabsProvider.createPaymentPage({
      amount: totalAmount,
      currency: amadeusFlightOffer.price.currency,
      customerName: contactName,
      customerEmail: contacts.email,
      customerPhone: contacts.phone,
      orderDescription: `Flight ${amadeusFlightOffer.validatingAirlineCodes[0]} - Pre-payment`,
      orderReference: tempBookingRef,
      returnUrl: `${process.env.FRONTEND_URL}/payment/return`,
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payments/paytabs/pay-then-book-callback`
    });

    // STEP 2: Store pending payment with flight offer data
    const payment = await Payment.create({
      userId: req.user.id,
      bookingId: null, // No booking yet!
      transactionId: payTabsPayment.transactionId,
      amount: totalAmount,
      currency: amadeusFlightOffer.price.currency,
      paymentMethod: 'card',
      paymentGateway: 'paytabs',
      status: 'pending',
      paymentIntentId: payTabsPayment.transactionId,
      gatewayResponse: payTabsPayment,
      metadata: {
        tempBookingRef,
        flightOffer: amadeusFlightOffer, // Store for later
        travelers,
        contacts,
        remarks,
        flow: 'pay-then-book'
      }
    });

    res.json({
      success: true,
      message: 'Payment page created. Customer must pay before flight is booked.',
      data: {
        payment: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          paymentUrl: payTabsPayment.paymentUrl
        },
        workflow: {
          current: 'awaiting_payment',
          next: 'book_flight_after_payment',
          security: 'Flight will only be booked AFTER payment is confirmed'
        }
      }
    });
  } catch (error) {
    console.error('Pay then book error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment'
    });
  }
};

/**
 * Callback for pay-then-book flow
 * After customer pays, THIS creates the Amadeus booking
 */
exports.payThenBookCallback = async (req, res) => {
  try {
    console.log('Pay-then-book callback received:', req.body);

    const { tran_ref, cart_id } = req.body;

    // Find payment
    const payment = await Payment.findOne({
      where: {
        [Op.or]: [
          { transactionId: tran_ref },
          { metadata: { tempBookingRef: cart_id } }
        ]
      }
    });

    if (!payment) {
      console.error('Payment not found');
      return res.status(404).json({ success: false });
    }

    // Verify payment
    const verificationResult = await payTabsProvider.verifyPayment(tran_ref);

    if (verificationResult.success) {
      console.log('✅ Payment verified! Now booking flight with Amadeus...');

      // Extract stored flight data
      const { flightOffer, travelers, contacts, remarks } = payment.metadata;

      try {
        // NOW book with Amadeus (payment already collected!)
        const amadeusOrder = await flightProvider.createFlightOrder({
          flightOffer,
          travelers,
          contacts,
          remarks
        });

        console.log('✅ Amadeus booking created:', amadeusOrder.id);

        // Create booking records
        const booking = await Booking.create({
          userId: payment.userId,
          bookingType: 'flight',
          referenceId: 0,
          bookingNumber: `BKG-FLT-${Date.now()}`,
          bookingStatus: 'confirmed',
          paymentStatus: 'paid',
          travelDate: flightOffer.itineraries[0].segments[0].departure.at,
          numberOfPeople: travelers.length,
          totalAmount: payment.amount,
          currency: payment.currency,
          contactName: contacts.name || `${travelers[0].firstName} ${travelers[0].lastName}`,
          contactEmail: contacts.email,
          contactPhone: contacts.phone,
          travelers,
          confirmedAt: new Date()
        });

        const flightOrder = await FlightOrder.create({
          orderNumber: `ORD-FLT-${Date.now()}`,
          userId: payment.userId,
          bookingId: booking.id,
          amadeusOrderId: amadeusOrder.id,
          pnr: amadeusOrder.associatedRecords?.[0]?.reference,
          status: 'confirmed',
          ticketingStatus: 'issued', // Already paid, issue immediately
          paymentStatus: 'paid',
          amountPaid: payment.amount,
          flightOfferData: flightOffer,
          itineraries: flightOffer.itineraries,
          totalAmount: payment.amount,
          baseAmount: parseFloat(flightOffer.price.base),
          taxAmount: payment.amount - parseFloat(flightOffer.price.base),
          currency: payment.currency,
          travelers,
          numberOfTravelers: travelers.length,
          contactEmail: contacts.email,
          contactPhone: contacts.phone,
          validatingAirline: flightOffer.validatingAirlineCodes?.[0],
          ticketedAt: new Date()
        });

        // Update payment with booking info
        await payment.update({
          bookingId: booking.id,
          status: 'completed',
          paidAt: new Date(),
          metadata: {
            ...payment.metadata,
            bookingNumber: booking.bookingNumber,
            pnr: flightOrder.pnr,
            amadeusOrderId: amadeusOrder.id,
            flow: 'pay-then-book'
          }
        });

        // Update booking reference
        await booking.update({ referenceId: flightOrder.id });

        console.log('✅ Complete! PNR:', flightOrder.pnr, 'Booking:', booking.bookingNumber);

        // TODO: Send confirmation email with e-ticket
        // TODO: Send WhatsApp notification

        res.json({ 
          success: true, 
          message: 'Payment received and flight booked successfully!',
          bookingNumber: booking.bookingNumber,
          pnr: flightOrder.pnr
        });

      } catch (amadeusError) {
        console.error('❌ Amadeus booking failed after payment:', amadeusError);

        // Payment collected but Amadeus booking failed!
        // Must refund customer
        await payment.update({
          status: 'refund_pending',
          metadata: {
            ...payment.metadata,
            amadeusError: amadeusError.message,
            requiresRefund: true
          }
        });

        // Process refund
        await payTabsProvider.processRefund(
          tran_ref,
          payment.amount,
          'Amadeus booking failed'
        );

        await payment.update({ status: 'refunded' });

        res.json({
          success: false,
          message: 'Payment received but booking failed. Refund processed.',
          refunded: true
        });
      }
    } else {
      // Payment failed
      await payment.update({
        status: 'failed',
        gatewayResponse: {
          ...payment.gatewayResponse,
          verification: verificationResult
        }
      });

      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Pay-then-book callback error:', error);
    res.status(500).json({ success: false, message: 'Processing error' });
  }
};

// Helper function
function extractOperatingAirlines(flightOffer) {
  const airlines = new Set();
  flightOffer.itineraries?.forEach(itinerary => {
    itinerary.segments?.forEach(segment => {
      if (segment.carrierCode) airlines.add(segment.carrierCode);
      if (segment.operating?.carrierCode) airlines.add(segment.operating.carrierCode);
    });
  });
  return Array.from(airlines);
}

module.exports.extractOperatingAirlines = extractOperatingAirlines;

const nodemailer = require('nodemailer');
const { generateFlightTicket, generateBookingConfirmation } = require('./ticketGenerator');

// Create reusable transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send flight ticket via email
 */
const sendFlightTicket = async (flightOrder, recipientEmail, travelerIndex = 0) => {
  try {
    const traveler = flightOrder.travelers[travelerIndex];
    
    // Generate PDF ticket
    const ticketPDF = await generateFlightTicket(flightOrder, travelerIndex);

    // Email content
    const mailOptions = {
      from: `"Trasealla Travel" <${process.env.EMAIL_USER || 'noreply@trasealla.com'}>`,
      to: recipientEmail || traveler.email || flightOrder.contactEmail,
      subject: `Your Flight Ticket - ${flightOrder.pnr}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0066FF 0%, #00C9FF 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">✈️ Your Flight is Confirmed!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Hello ${traveler.firstName},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Your flight ticket is ready! Please find your e-ticket attached to this email.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0066FF; margin-top: 0;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Booking Reference (PNR):</td>
                  <td style="padding: 8px 0; color: #000; font-weight: bold;">${flightOrder.pnr}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Order Number:</td>
                  <td style="padding: 8px 0; color: #000;">${flightOrder.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Passenger:</td>
                  <td style="padding: 8px 0; color: #000;">${traveler.firstName} ${traveler.lastName}</td>
                </tr>
                ${flightOrder.eTicketNumbers && flightOrder.eTicketNumbers[travelerIndex] ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">E-Ticket Number:</td>
                  <td style="padding: 8px 0; color: #0066FF; font-weight: bold;">${flightOrder.eTicketNumbers[travelerIndex]}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; border-left: 4px solid #FFA500;">
              <h4 style="margin-top: 0; color: #856404;">⚠️ Important Reminders:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Arrive at the airport at least 3 hours before international flights</li>
                <li>Complete online check-in 24 hours before departure</li>
                <li>Carry valid passport and necessary travel documents</li>
                <li>Check current travel restrictions and requirements</li>
              </ul>
            </div>
            
            <p style="color: #666; margin-top: 30px;">
              Have questions? Contact our support team at 
              <a href="mailto:support@trasealla.com" style="color: #0066FF;">support@trasealla.com</a>
            </p>
            
            <p style="color: #666;">
              Safe travels! ✈️<br>
              <strong>The Trasealla Team</strong>
            </p>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0;">Trasealla Travel Agency</p>
            <p style="margin: 5px 0;">www.trasealla.com | +971 4 123 4567</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${flightOrder.pnr}-${traveler.lastName}.pdf`,
          content: ticketPDF,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail || traveler.email,
      pnr: flightOrder.pnr
    };
  } catch (error) {
    console.error('Error sending flight ticket email:', error);
    throw error;
  }
};

/**
 * Send booking confirmation with all tickets
 */
const sendBookingConfirmation = async (flightOrder, recipientEmail) => {
  try {
    // Generate confirmation PDF
    const confirmationPDF = await generateBookingConfirmation(flightOrder);

    const travelers = flightOrder.travelers;
    const travelerNames = travelers.map(t => `${t.firstName} ${t.lastName}`).join(', ');

    const mailOptions = {
      from: `"Trasealla Travel" <${process.env.EMAIL_USER || 'noreply@trasealla.com'}>`,
      to: recipientEmail || flightOrder.contactEmail,
      subject: `Booking Confirmed - ${flightOrder.pnr} - ${travelers.length} Passenger(s)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #00C853 0%, #00E676 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Booking Confirmed!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Great news! Your flight booking has been confirmed. All travelers will receive their individual e-tickets separately.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #00C853; margin-top: 0;">Booking Summary</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">PNR:</td>
                  <td style="padding: 8px 0; color: #000; font-weight: bold; font-size: 18px;">${flightOrder.pnr}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Travelers:</td>
                  <td style="padding: 8px 0; color: #000;">${travelerNames}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #00C853; font-weight: bold; font-size: 16px;">${flightOrder.currency} ${parseFloat(flightOrder.totalAmount).toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-bookings/${flightOrder.id}" 
                 style="background: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking Details
              </a>
            </div>
            
            <p style="color: #666;">
              Your confirmation and itinerary are attached to this email.
            </p>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p>Trasealla Travel Agency</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `booking-confirmation-${flightOrder.pnr}.pdf`,
          content: confirmationPDF,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail,
      travelers: travelers.length
    };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
};

/**
 * Send cancellation confirmation
 */
const sendCancellationEmail = async (flightOrder, recipientEmail, refundAmount = null) => {
  try {
    const mailOptions = {
      from: `"Trasealla Travel" <${process.env.EMAIL_USER || 'noreply@trasealla.com'}>`,
      to: recipientEmail || flightOrder.contactEmail,
      subject: `Booking Cancelled - ${flightOrder.pnr}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #F44336; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="color: #666;">
              Your booking <strong>${flightOrder.pnr}</strong> has been cancelled as requested.
            </p>
            
            ${refundAmount ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #00C853;">Refund Information</h3>
              <p style="color: #666;">
                Refund Amount: <strong style="color: #00C853; font-size: 18px;">${flightOrder.currency} ${refundAmount}</strong>
              </p>
              <p style="color: #999; font-size: 14px;">
                Refund will be processed within 7-10 business days to your original payment method.
              </p>
            </div>
            ` : ''}
            
            <p style="color: #666;">
              If you have any questions, please contact us at support@trasealla.com
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
};

module.exports = {
  sendFlightTicket,
  sendBookingConfirmation,
  sendCancellationEmail,
  transporter
};


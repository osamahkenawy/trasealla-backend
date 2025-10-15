const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Generate flight ticket PDF
 */
const generateFlightTicket = async (flightOrder, travelerIndex = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const traveler = flightOrder.travelers[travelerIndex];
      const segments = flightOrder.itineraries || flightOrder.flightOfferData?.itineraries || [];

      // Generate QR code for PNR
      const qrCodeData = `PNR:${flightOrder.pnr}|NAME:${traveler.firstName} ${traveler.lastName}|ORDER:${flightOrder.orderNumber}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);

      // Header
      doc.fontSize(24).fillColor('#0066FF').text('TRASEALLA', 50, 50);
      doc.fontSize(10).fillColor('#666').text('Your Travel Partner', 50, 78);
      
      // Title
      doc.fontSize(20).fillColor('#000').text('E-TICKET', 50, 120);
      doc.fontSize(12).fillColor('#666').text('Electronic Flight Ticket', 50, 145);

      // Booking Reference
      doc.fontSize(14).fillColor('#000').text('Booking Reference', 400, 120);
      doc.fontSize(18).fillColor('#0066FF').text(flightOrder.pnr, 400, 140);

      // QR Code
      const qrImage = qrCodeImage.replace(/^data:image\/\w+;base64,/, '');
      const qrBuffer = Buffer.from(qrImage, 'base64');
      doc.image(qrBuffer, 400, 180, { width: 100 });

      // Divider
      doc.moveTo(50, 200).lineTo(545, 200).stroke('#ddd');

      // Passenger Details
      doc.fontSize(14).fillColor('#000').text('Passenger Details', 50, 220);
      doc.fontSize(11).fillColor('#333');
      doc.text(`Name: ${traveler.firstName} ${traveler.lastName}`, 50, 245);
      doc.text(`Date of Birth: ${traveler.dateOfBirth}`, 50, 260);
      doc.text(`Gender: ${traveler.gender}`, 50, 275);
      doc.text(`Email: ${traveler.email || flightOrder.contactEmail}`, 50, 290);
      doc.text(`Phone: ${traveler.phoneNumber || flightOrder.contactPhone}`, 50, 305);

      // E-Ticket Number
      if (flightOrder.eTicketNumbers && flightOrder.eTicketNumbers[travelerIndex]) {
        doc.fontSize(11).fillColor('#0066FF');
        doc.text(`E-Ticket Number: ${flightOrder.eTicketNumbers[travelerIndex]}`, 50, 325);
      }

      // Passport Info
      if (traveler.documents && traveler.documents.length > 0) {
        const passport = traveler.documents[0];
        doc.fontSize(11).fillColor('#333');
        doc.text(`Passport: ${passport.number} (${passport.nationality})`, 50, 345);
      }

      // Divider
      doc.moveTo(50, 370).lineTo(545, 370).stroke('#ddd');

      // Flight Itinerary
      let yPosition = 390;
      doc.fontSize(14).fillColor('#000').text('Flight Itinerary', 50, yPosition);

      segments.forEach((itinerary, itinIndex) => {
        yPosition += 30;
        
        const segment = itinerary.segments?.[0] || itinerary;
        
        // Journey header
        doc.fontSize(12).fillColor('#0066FF');
        doc.text(`${itinIndex === 0 ? 'Outbound' : 'Return'} Journey`, 50, yPosition);
        
        yPosition += 25;

        // Departure
        doc.fontSize(11).fillColor('#000');
        doc.text('Departure:', 50, yPosition);
        doc.fillColor('#333');
        doc.text(`${segment.departure?.iataCode || segment.origin?.iata_code} - ${segment.departure?.cityName || segment.origin?.city_name || ''}`, 150, yPosition);
        doc.text(formatDateTime(segment.departure?.at || segment.departing_at), 300, yPosition);
        if (segment.departure?.terminal || segment.origin_terminal) {
          doc.text(`Terminal ${segment.departure?.terminal || segment.origin_terminal}`, 450, yPosition);
        }

        yPosition += 20;

        // Arrival
        doc.fontSize(11).fillColor('#000');
        doc.text('Arrival:', 50, yPosition);
        doc.fillColor('#333');
        doc.text(`${segment.arrival?.iataCode || segment.destination?.iata_code} - ${segment.arrival?.cityName || segment.destination?.city_name || ''}`, 150, yPosition);
        doc.text(formatDateTime(segment.arrival?.at || segment.arriving_at), 300, yPosition);
        if (segment.arrival?.terminal || segment.destination_terminal) {
          doc.text(`Terminal ${segment.arrival?.terminal || segment.destination_terminal}`, 450, yPosition);
        }

        yPosition += 20;

        // Flight details
        const carrierCode = segment.carrierCode || segment.marketing_carrier?.iata_code;
        const flightNumber = segment.number || segment.marketing_carrier_flight_number;
        
        doc.text('Flight:', 50, yPosition);
        doc.text(`${carrierCode} ${flightNumber}`, 150, yPosition);
        doc.text(`Duration: ${formatDuration(segment.duration)}`, 300, yPosition);

        yPosition += 20;

        // Cabin class
        const cabin = segment.cabin || segment.passengers?.[0]?.cabin_class || 'Economy';
        doc.text('Class:', 50, yPosition);
        doc.text(cabin.charAt(0).toUpperCase() + cabin.slice(1), 150, yPosition);

        // Baggage
        const baggage = segment.passengers?.[0]?.baggages;
        if (baggage) {
          const checked = baggage.find(b => b.type === 'checked');
          if (checked) {
            doc.text(`Baggage: ${checked.quantity} x ${checked.weight || '23kg'}`, 300, yPosition);
          }
        }

        yPosition += 30;
      });

      // Divider
      doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke('#ddd');
      yPosition += 20;

      // Booking Details
      doc.fontSize(14).fillColor('#000').text('Booking Information', 50, yPosition);
      yPosition += 25;

      doc.fontSize(11).fillColor('#333');
      doc.text(`Order Number: ${flightOrder.orderNumber}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Booking Date: ${formatDate(flightOrder.createdAt)}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Total Amount: ${flightOrder.currency} ${parseFloat(flightOrder.totalAmount).toFixed(2)}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Status: ${flightOrder.status.toUpperCase()}`, 50, yPosition);

      // Important Notes
      yPosition += 40;
      doc.fontSize(10).fillColor('#FF6B00');
      doc.text('⚠️ IMPORTANT INFORMATION:', 50, yPosition);
      yPosition += 20;
      doc.fontSize(9).fillColor('#333');
      doc.text('• Please arrive at the airport at least 3 hours before international flights', 50, yPosition);
      yPosition += 15;
      doc.text('• Carry valid ID and passport for international travel', 50, yPosition);
      yPosition += 15;
      doc.text('• Check baggage allowance and restrictions', 50, yPosition);
      yPosition += 15;
      doc.text('• Online check-in opens 24 hours before departure', 50, yPosition);

      // Footer
      const footerY = 750;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#ddd');
      doc.fontSize(8).fillColor('#999');
      doc.text('Trasealla Travel Agency | support@trasealla.com | +971 4 123 4567', 50, footerY + 10);
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, footerY + 25);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate booking confirmation PDF (all travelers)
 */
const generateBookingConfirmation = async (flightOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).fillColor('#0066FF').text('TRASEALLA', 50, 50);
      doc.fontSize(10).fillColor('#666').text('Booking Confirmation', 50, 78);
      
      // PNR and QR
      const qrCodeData = `PNR:${flightOrder.pnr}|ORDER:${flightOrder.orderNumber}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);
      const qrBuffer = Buffer.from(qrCodeImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      
      doc.fontSize(18).fillColor('#000').text('Booking Confirmed', 50, 120);
      doc.fontSize(14).fillColor('#0066FF').text(`PNR: ${flightOrder.pnr}`, 50, 150);
      doc.image(qrBuffer, 450, 50, { width: 80 });

      // Travelers list
      let yPos = 190;
      doc.fontSize(14).fillColor('#000').text('Travelers', 50, yPos);
      yPos += 25;

      flightOrder.travelers.forEach((traveler, index) => {
        doc.fontSize(11).fillColor('#333');
        doc.text(`${index + 1}. ${traveler.firstName} ${traveler.lastName}`, 60, yPos);
        if (flightOrder.eTicketNumbers && flightOrder.eTicketNumbers[index]) {
          doc.fillColor('#0066FF').text(`E-Ticket: ${flightOrder.eTicketNumbers[index]}`, 300, yPos);
        }
        yPos += 20;
      });

      // Flight details (similar to single ticket)
      yPos += 20;
      doc.fontSize(14).fillColor('#000').text('Flight Details', 50, yPos);
      yPos += 25;

      const segments = flightOrder.itineraries || flightOrder.flightOfferData?.itineraries || [];
      segments.forEach((itinerary, itinIndex) => {
        const segment = itinerary.segments?.[0] || itinerary;
        
        doc.fontSize(12).fillColor('#0066FF');
        doc.text(`${itinIndex === 0 ? 'Outbound' : 'Return'}`, 50, yPos);
        yPos += 20;

        doc.fontSize(10).fillColor('#333');
        doc.text(`${segment.departure?.iataCode || segment.origin?.iata_code} → ${segment.arrival?.iataCode || segment.destination?.iata_code}`, 50, yPos);
        doc.text(formatDateTime(segment.departure?.at || segment.departing_at), 200, yPos);
        doc.text(`Flight: ${segment.carrierCode || segment.marketing_carrier?.iata_code} ${segment.number || segment.marketing_carrier_flight_number}`, 400, yPos);
        yPos += 25;
      });

      // Total
      yPos += 20;
      doc.fontSize(14).fillColor('#000').text('Total Amount', 50, yPos);
      doc.fontSize(18).fillColor('#0066FF').text(`${flightOrder.currency} ${parseFloat(flightOrder.totalAmount).toFixed(2)}`, 400, yPos);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Helper: Format date and time
 */
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return `${date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })} ${date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

/**
 * Helper: Format date only
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Helper: Format duration (PT3H45M -> 3h 45m)
 */
const formatDuration = (duration) => {
  if (!duration) return 'N/A';
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return (hours + minutes).trim();
};

module.exports = {
  generateFlightTicket,
  generateBookingConfirmation,
  formatDateTime,
  formatDate,
  formatDuration
};


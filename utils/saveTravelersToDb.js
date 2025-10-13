const { Traveler, TravelerDocument, FlightSegment } = require('../models');

/**
 * Save travelers to normalized tables
 */
async function saveTravelersToDb(bookingId, travelers) {
  const savedTravelers = [];

  for (const travelerData of travelers) {
    // Create traveler record
    const traveler = await Traveler.create({
      bookingId,
      firstName: travelerData.firstName,
      lastName: travelerData.lastName,
      title: travelerData.title || (travelerData.gender === 'MALE' ? 'Mr' : 'Ms'),
      gender: travelerData.gender,
      dateOfBirth: travelerData.dateOfBirth,
      email: travelerData.email,
      phoneCountryCode: travelerData.phoneCountryCode,
      phoneNumber: travelerData.phoneNumber,
      nationality: travelerData.nationality || travelerData.documents?.[0]?.nationality,
      passengerType: travelerData.passengerType || 'adult',
      age: travelerData.age,
      providerPassengerId: travelerData.id, // Duffel: pas_xxx, Amadeus: "1"
      specialRequests: travelerData.specialRequests,
      mealPreference: travelerData.mealPreference,
      seatPreference: travelerData.seatPreference
    });

    // Create documents (passports, etc.)
    if (travelerData.documents && travelerData.documents.length > 0) {
      for (const doc of travelerData.documents) {
        await TravelerDocument.create({
          travelerId: traveler.id,
          documentType: doc.documentType?.toLowerCase() || 'passport',
          documentNumber: doc.number,
          issuingCountry: doc.issuanceCountry,
          nationality: doc.nationality,
          issueDate: doc.issueDate || null,
          expiryDate: doc.expiryDate,
          issuingAuthority: doc.issuingAuthority,
          placeOfIssue: doc.placeOfIssue
        });
      }
    }

    savedTravelers.push(traveler);
  }

  return savedTravelers;
}

/**
 * Save flight segments to normalized table
 */
async function saveFlightSegmentsToDb(flightOrderId, flightOffer) {
  const savedSegments = [];

  // Handle both Amadeus (itineraries) and Duffel (slices) formats
  const itineraries = flightOffer.itineraries || flightOffer.slices || [];

  let segmentNumber = 1;
  for (const itinerary of itineraries) {
    const segments = itinerary.segments || [];
    
    for (const seg of segments) {
      // Parse duration to minutes
      const durationMinutes = parseDuration(seg.duration || itinerary.duration);
      
      // Handle both formats
      const departure = seg.departure || {
        iataCode: seg.origin?.iata_code,
        at: seg.departing_at,
        terminal: seg.origin_terminal
      };
      
      const arrival = seg.arrival || {
        iataCode: seg.destination?.iata_code,
        at: seg.arriving_at,
        terminal: seg.destination_terminal
      };

      const segment = await FlightSegment.create({
        flightOrderId,
        segmentNumber,
        departureAirport: departure.iataCode,
        departureCity: departure.cityName || seg.origin?.city_name,
        departureTerminal: departure.terminal,
        departureTime: departure.at,
        arrivalAirport: arrival.iataCode,
        arrivalCity: arrival.cityName || seg.destination?.city_name,
        arrivalTerminal: arrival.terminal,
        arrivalTime: arrival.at,
        marketingCarrier: seg.carrierCode || seg.marketing_carrier?.iata_code,
        marketingCarrierName: seg.carrierName || seg.marketing_carrier?.name,
        marketingFlightNumber: seg.number || seg.marketing_carrier_flight_number,
        operatingCarrier: seg.operating?.carrierCode || seg.operating_carrier?.iata_code,
        operatingCarrierName: seg.operating?.carrierName || seg.operating_carrier?.name,
        operatingFlightNumber: seg.operating?.flightNumber || seg.operating_carrier_flight_number,
        aircraftCode: seg.aircraft?.code || seg.aircraft,
        aircraftName: seg.aircraft?.name,
        duration: seg.duration || itinerary.duration,
        durationMinutes,
        distance: parseFloat(seg.distance) || null,
        cabinClass: extractCabinClass(seg),
        bookingClass: seg.class || seg.passengers?.[0]?.cabin_class || 'Y',
        fareBasis: seg.fareBasis || seg.passengers?.[0]?.fare_basis_code,
        checkedBagsIncluded: extractBaggage(seg, 'checked'),
        cabinBagsIncluded: extractBaggage(seg, 'carry_on'),
        numberOfStops: seg.numberOfStops || seg.stops?.length || 0,
        isCodeshare: seg.carrierCode !== seg.operating?.carrierCode,
        co2Emissions: seg.co2Emissions?.[0]?.weight || null
      });

      savedSegments.push(segment);
      segmentNumber++;
    }
  }

  return savedSegments;
}

// Helper functions
function parseDuration(isoDuration) {
  if (!isoDuration) return null;
  const hours = isoDuration.match(/(\d+)H/)?.[1] || 0;
  const mins = isoDuration.match(/(\d+)M/)?.[1] || 0;
  return parseInt(hours) * 60 + parseInt(mins);
}

function extractCabinClass(segment) {
  if (segment.cabin) return segment.cabin.toLowerCase();
  if (segment.passengers?.[0]?.cabin_class) return segment.passengers[0].cabin_class;
  return 'economy';
}

function extractBaggage(segment, type) {
  // Amadeus format
  if (segment.includedCheckedBags && type === 'checked') {
    return segment.includedCheckedBags.quantity || 0;
  }
  if (segment.includedCabinBags && type === 'carry_on') {
    return segment.includedCabinBags.quantity || 0;
  }
  
  // Duffel format
  if (segment.passengers?.[0]?.baggages) {
    const bag = segment.passengers[0].baggages.find(b => b.type === type);
    return bag?.quantity || 0;
  }
  
  return type === 'carry_on' ? 1 : 0;
}

module.exports = {
  saveTravelersToDb,
  saveFlightSegmentsToDb,
  parseDuration,
  extractCabinClass,
  extractBaggage
};

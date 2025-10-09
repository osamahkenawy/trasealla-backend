const IFlightProvider = require('./IFlightProvider');
const amadeus = require('../../config/amadeus');

class AmadeusFlightProvider extends IFlightProvider {
  constructor() {
    super();
    this.providerName = 'Amadeus';
  }

  /**
   * Search for flight offers
   */
  async searchFlights(searchParams) {
    try {
      const {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        returnDate,
        adults = 1,
        children = 0,
        infants = 0,
        travelClass = 'ECONOMY',
        nonStop = false,
        currencyCode = 'USD',
        maxResults = 50
      } = searchParams;

      const searchQuery = {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults,
        currencyCode,
        max: maxResults
      };

      // Add optional parameters
      if (returnDate) searchQuery.returnDate = returnDate;
      if (children > 0) searchQuery.children = children;
      if (infants > 0) searchQuery.infants = infants;
      if (travelClass) searchQuery.travelClass = travelClass;
      if (nonStop) searchQuery.nonStop = true;

      const response = await amadeus.shopping.flightOffersSearch.get(searchQuery);

      // Transform Amadeus response to unified format
      return this.transformFlightOffers(response.data);
    } catch (error) {
      console.error('Amadeus flight search error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Get specific flight offer
   */
  async getFlightOffer(offerId) {
    try {
      // Amadeus doesn't have a direct get by ID, so we return cached or search again
      return {
        id: offerId,
        provider: this.providerName,
        message: 'Use search or reprice to get offer details'
      };
    } catch (error) {
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Reprice flight offer (confirm current pricing)
   */
  async repriceFlightOffer(flightOffer) {
    try {
      const response = await amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer]
          }
        })
      );

      return this.transformFlightOffer(response.data.flightOffers[0]);
    } catch (error) {
      console.error('Amadeus reprice error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Create flight order (book flight)
   */
  async createFlightOrder(orderData) {
    try {
      const { flightOffer, travelers, contacts, remarks } = orderData;

      const orderRequest = {
        data: {
          type: 'flight-order',
          flightOffers: [flightOffer],
          travelers: travelers.map((traveler, index) => {
            // Format phone number properly (remove any + or spaces)
            const cleanPhone = (traveler.phoneNumber || '').replace(/[\s\-\+]/g, '');
            
            return {
              id: `${index + 1}`,
              dateOfBirth: traveler.dateOfBirth,
              name: {
                firstName: traveler.firstName.toUpperCase(),
                lastName: traveler.lastName.toUpperCase()
              },
              gender: traveler.gender.toUpperCase(),
              contact: {
                emailAddress: traveler.email || contacts.email,
                phones: [{
                  deviceType: 'MOBILE',
                  countryCallingCode: (traveler.phoneCountryCode || '1').replace(/\+/g, ''),
                  number: cleanPhone
                }]
              },
              documents: (traveler.documents || []).map(doc => ({
                documentType: doc.documentType,
                number: doc.number,
                expiryDate: doc.expiryDate,
                issuanceCountry: doc.issuanceCountry,
                nationality: doc.nationality,
                holder: doc.holder !== undefined ? doc.holder : true
              }))
            };
          })
        }
      };

      if (remarks) {
        orderRequest.data.remarks = remarks;
      }

      console.log('Creating Amadeus order with:', JSON.stringify(orderRequest, null, 2));

      const response = await amadeus.booking.flightOrders.post(
        JSON.stringify(orderRequest)
      );

      return this.transformFlightOrder(response.data);
    } catch (error) {
      console.error('Amadeus create order error:', error);
      console.error('Error details:', error.response?.result || error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Get flight order by ID
   */
  async getFlightOrder(orderId) {
    try {
      const response = await amadeus.booking.flightOrder(orderId).get();
      return this.transformFlightOrder(response.data);
    } catch (error) {
      console.error('Amadeus get order error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Cancel/Delete flight order
   */
  async cancelFlightOrder(orderId) {
    try {
      const response = await amadeus.booking.flightOrder(orderId).delete();
      return {
        success: true,
        orderId,
        status: 'cancelled',
        provider: this.providerName,
        data: response.data
      };
    } catch (error) {
      console.error('Amadeus cancel order error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Get seat maps for a flight
   */
  async getSeatMaps(flightOfferId) {
    try {
      const response = await amadeus.shopping.seatmaps.post(
        JSON.stringify({
          data: [flightOfferId]
        })
      );

      return response.data;
    } catch (error) {
      console.error('Amadeus seat maps error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Get flight price analysis
   */
  async getFlightPriceAnalysis(originCode, destinationCode, departureDate) {
    try {
      const response = await amadeus.analytics.itineraryPriceMetrics.get({
        originIataCode: originCode,
        destinationIataCode: destinationCode,
        departureDate
      });

      return response.data;
    } catch (error) {
      console.error('Amadeus price analysis error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  /**
   * Search airports/cities
   */
  async searchLocations(keyword) {
    try {
      const response = await amadeus.referenceData.locations.get({
        keyword,
        subType: 'AIRPORT,CITY'
      });

      return response.data.map(location => ({
        code: location.iataCode,
        name: location.name,
        type: location.subType,
        city: location.address?.cityName,
        country: location.address?.countryName,
        countryCode: location.address?.countryCode
      }));
    } catch (error) {
      console.error('Amadeus location search error:', error);
      throw this.handleAmadeusError(error);
    }
  }

  // Transform methods
  transformFlightOffers(offers) {
    return offers.map(offer => this.transformFlightOffer(offer));
  }

  transformFlightOffer(offer) {
    return {
      id: offer.id,
      provider: this.providerName,
      type: 'flight-offer',
      source: offer.source,
      instantTicketingRequired: offer.instantTicketingRequired,
      nonHomogeneous: offer.nonHomogeneous,
      oneWay: offer.oneWay,
      lastTicketingDate: offer.lastTicketingDate,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      itineraries: offer.itineraries.map(itinerary => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map(segment => ({
          departure: {
            iataCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: segment.departure.at
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: segment.arrival.at
          },
          carrierCode: segment.carrierCode,
          number: segment.number,
          aircraft: segment.aircraft?.code,
          operating: segment.operating,
          duration: segment.duration,
          id: segment.id,
          numberOfStops: segment.numberOfStops,
          blacklistedInEU: segment.blacklistedInEU
        }))
      })),
      price: {
        currency: offer.price.currency,
        total: parseFloat(offer.price.total),
        base: parseFloat(offer.price.base),
        fees: offer.price.fees?.map(fee => ({
          amount: parseFloat(fee.amount),
          type: fee.type
        })),
        grandTotal: parseFloat(offer.price.grandTotal)
      },
      pricingOptions: offer.pricingOptions,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      travelerPricings: offer.travelerPricings,
      raw: offer // Keep original for repricing
    };
  }

  transformFlightOrder(order) {
    return {
      id: order.id,
      provider: this.providerName,
      type: 'flight-order',
      queuingOfficeId: order.queuingOfficeId,
      ownerOfficeId: order.ownerOfficeId,
      associatedRecords: order.associatedRecords,
      flightOffers: order.flightOffers,
      travelers: order.travelers,
      contacts: order.contacts,
      tickets: order.tickets,
      raw: order
    };
  }

  handleAmadeusError(error) {
    const errorResponse = error.response;
    
    if (errorResponse) {
      const errors = errorResponse.result?.errors || [];
      return new Error(
        errors.length > 0 
          ? errors[0].detail || errors[0].title 
          : 'Amadeus API error'
      );
    }
    
    return error;
  }
}

module.exports = AmadeusFlightProvider;

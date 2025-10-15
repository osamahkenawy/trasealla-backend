const IFlightProvider = require('./IFlightProvider');
const axios = require('axios');

/**
 * Duffel Flight Provider
 * Modern flight booking platform - alternative to Amadeus
 * Documentation: https://duffel.com/docs/api
 */
class DuffelFlightProvider extends IFlightProvider {
  constructor() {
    super();
    this.providerName = 'Duffel';
    this.apiKey = process.env.DUFFEL_API_KEY;
    this.baseUrl = process.env.DUFFEL_ENV === 'production'
      ? 'https://api.duffel.com'
      : 'https://api.duffel.com'; // Duffel uses same URL, different keys
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
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
        travelClass = 'economy',
        maxResults = 50
      } = searchParams;

      // Create offer request
      const offerRequest = {
        data: {
          slices: [
            {
              origin: originLocationCode,
              destination: destinationLocationCode,
              departure_date: departureDate
            }
          ],
          passengers: [],
          cabin_class: travelClass.toLowerCase(),
          max_connections: searchParams.nonStop ? 0 : 2
        }
      };

      // Add passengers
      for (let i = 0; i < adults; i++) {
        offerRequest.data.passengers.push({ type: 'adult' });
      }
      for (let i = 0; i < children; i++) {
        offerRequest.data.passengers.push({ type: 'child' });
      }
      for (let i = 0; i < infants; i++) {
        offerRequest.data.passengers.push({ type: 'infant_without_seat' });
      }

      // Add return slice if round trip
      if (returnDate) {
        offerRequest.data.slices.push({
          origin: destinationLocationCode,
          destination: originLocationCode,
          departure_date: returnDate
        });
      }

      // Create offer request
      const requestResponse = await this.client.post('/air/offer_requests', offerRequest);
      const offerRequestId = requestResponse.data.data.id;

      // Get offers
      const offersResponse = await this.client.get(`/air/offers?offer_request_id=${offerRequestId}&max_connections=${searchParams.nonStop ? 0 : 2}&sort=total_amount`);

      // Transform to unified format
      return this.transformOffers(offersResponse.data.data.slice(0, maxResults));
    } catch (error) {
      console.error('Duffel search error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Get specific offer (Duffel offers expire after 20 minutes)
   */
  async getFlightOffer(offerId) {
    try {
      const response = await this.client.get(`/air/offers/${offerId}`);
      return this.transformOffer(response.data.data);
    } catch (error) {
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Confirm offer pricing (similar to Amadeus reprice)
   */
  async repriceFlightOffer(duffelOffer) {
    try {
      // Duffel offers are valid for 20 minutes
      // Re-fetch to confirm current price
      const offerId = duffelOffer.id;
      const response = await this.client.get(`/air/offers/${offerId}`);
      
      return this.transformOffer(response.data.data);
    } catch (error) {
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Create flight order (book flight)
   */
  async createFlightOrder(orderData) {
    try {
      const { flightOffer, travelers, contacts } = orderData;

      // Get passenger IDs from the offer - CRITICAL for Duffel
      const offerPassengerIds = flightOffer.passengers?.map(p => p.id) || [];
      
      console.log('📋 Offer Passenger IDs:', offerPassengerIds);
      console.log('👥 Travelers count:', travelers.length);

      // Build Duffel order request
      const orderRequest = {
        data: {
          selected_offers: [flightOffer.id],
          payments: [{
            type: 'balance',  // Use Duffel balance (prepaid)
            amount: flightOffer.total_amount,
            currency: flightOffer.total_currency
          }],
          passengers: travelers.map((traveler, index) => {
            // CRITICAL: Use passenger ID from the offer, not from traveler input
            const duffelPassengerId = offerPassengerIds[index] || `passenger_${index}`;
            
            // Convert gender format: MALE/FEMALE → m/f
            const genderUpper = traveler.gender.toUpperCase();
            const duffelGender = genderUpper === 'MALE' ? 'm' : 'f';
            const title = genderUpper === 'MALE' ? 'mr' : (genderUpper === 'FEMALE' ? 'ms' : 'mx');
            
            // Format phone number properly
            let phoneNumber = traveler.phoneNumber || '';
            // Remove all non-digit characters except +
            phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
            
            // If it already starts with +, use as is
            // Otherwise, prepend + and country code
            if (!phoneNumber.startsWith('+')) {
              const countryCode = traveler.phoneCountryCode || '1';
              phoneNumber = `+${countryCode}${phoneNumber}`;
            }
            
            console.log(`👤 Passenger ${index + 1}: ${traveler.firstName} ${traveler.lastName} → Duffel ID: ${duffelPassengerId}`);
            
            return {
              id: duffelPassengerId,  // Use Duffel's passenger ID from offer
              title: title,
              gender: duffelGender,
              given_name: traveler.firstName.toUpperCase(),
              family_name: traveler.lastName.toUpperCase(),
              born_on: traveler.dateOfBirth,
              email: traveler.email || contacts.email,
              phone_number: phoneNumber,
              identity_documents: (traveler.documents || []).map(doc => ({
                type: 'passport',
                unique_identifier: doc.number,
                expires_on: doc.expiryDate,
                issuing_country_code: doc.issuanceCountry
              }))
            };
          })
        }
      };

      console.log('Creating Duffel order:', JSON.stringify(orderRequest, null, 2));

      const response = await this.client.post('/air/orders', orderRequest);

      return this.transformOrder(response.data.data);
    } catch (error) {
      console.error('Duffel create order error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Get flight order by ID
   */
  async getFlightOrder(orderId) {
    try {
      const response = await this.client.get(`/air/orders/${orderId}`);
      return this.transformOrder(response.data.data);
    } catch (error) {
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Cancel flight order
   */
  async cancelFlightOrder(orderId) {
    try {
      // Create cancellation request
      const response = await this.client.post('/air/order_cancellations', {
        data: {
          order_id: orderId
        }
      });

      return {
        success: true,
        orderId,
        cancellationId: response.data.data.id,
        status: 'cancelled',
        refundAmount: response.data.data.refund_amount,
        refundCurrency: response.data.data.refund_currency,
        provider: this.providerName
      };
    } catch (error) {
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Get seat maps (Duffel has excellent seat map API)
   */
  async getSeatMaps(flightOffer) {
    try {
      const response = await this.client.get(`/air/seat_maps?offer_id=${flightOffer.id}`);
      return response.data.data;
    } catch (error) {
      throw this.handleDuffelError(error);
    }
  }

  // Transform Duffel data to unified format
  transformOffers(offers) {
    return offers.map(offer => this.transformOffer(offer));
  }

  transformOffer(offer) {
    return {
      id: offer.id,
      provider: this.providerName,
      type: 'flight-offer',
      source: 'Duffel',
      expiresAt: offer.expires_at,
      
      // Pricing
      price: {
        currency: offer.total_currency,
        total: parseFloat(offer.total_amount),
        base: parseFloat(offer.base_amount || offer.total_amount),
        tax: parseFloat(offer.tax_amount || 0),
        grandTotal: parseFloat(offer.total_amount)
      },

      // Itineraries (slices in Duffel terminology)
      itineraries: offer.slices.map(slice => ({
        duration: slice.duration,
        segments: slice.segments.map(segment => ({
          id: segment.id,
          departure: {
            iataCode: segment.origin.iata_code,
            cityName: segment.origin.city_name,
            at: segment.departing_at,
            terminal: segment.origin_terminal
          },
          arrival: {
            iataCode: segment.destination.iata_code,
            cityName: segment.destination.city_name,
            at: segment.arriving_at,
            terminal: segment.destination_terminal
          },
          carrierCode: segment.marketing_carrier.iata_code,
          carrierName: segment.marketing_carrier.name,
          number: segment.marketing_carrier_flight_number,
          aircraft: segment.aircraft?.name || segment.aircraft?.iata_code,
          duration: segment.duration,
          distance: segment.distance
        }))
      })),

      // Passengers
      passengers: offer.passengers.map(p => ({
        type: p.type,
        age: p.age
      })),

      // Conditions
      conditions: {
        changeBeforeDeparture: offer.conditions?.change_before_departure,
        refundBeforeDeparture: offer.conditions?.refund_before_departure
      },

      // Keep raw for booking
      raw: offer
    };
  }

  transformOrder(order) {
    return {
      id: order.id,
      provider: this.providerName,
      type: 'flight-order',
      bookingReference: order.booking_reference,
      
      // Associated records (PNR info)
      associatedRecords: order.booking_reference ? [{
        reference: order.booking_reference,
        originSystemCode: 'Duffel'
      }] : [],
      
      // Documents
      documents: order.documents?.map(doc => ({
        type: doc.type,
        url: doc.url  // Duffel provides download URLs!
      })) || [],

      // Slices (itineraries)
      slices: order.slices,
      
      // Passengers
      passengers: order.passengers,
      
      // Pricing
      totalAmount: parseFloat(order.total_amount || 0),
      totalCurrency: order.total_currency,
      baseCurrency: order.base_currency,
      
      // Status
      liveMode: order.live_mode,
      createdAt: order.created_at,
      
      raw: order
    };
  }

  /**
   * Search places (airports, cities) for autocomplete
   */
  async searchPlaces(query) {
    try {
      const response = await this.client.get('/places/suggestions', {
        params: {
          query: query
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Duffel places search error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Search locations (airports and cities) - Compatible with Amadeus interface
   */
  async searchLocations(keyword) {
    try {
      const places = await this.searchPlaces(keyword);
      
      // Transform Duffel format to match Amadeus format
      return places.map(place => ({
        code: place.iata_code || place.iata_city_code,
        name: place.name,
        type: place.type === 'airport' ? 'AIRPORT' : 'CITY',
        city: place.city_name || place.city?.name,
        country: place.iata_country_code,
        countryCode: place.iata_country_code,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.time_zone
      }));
    } catch (error) {
      console.error('Duffel location search error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Get available ancillary services for an offer
   */
  async getAncillaryServices(offerId) {
    try {
      const response = await this.client.get(`/air/service_offers?offer_id=${offerId}`);
      
      return {
        offerId,
        services: response.data.data.map(service => ({
          id: service.id,
          type: service.type,
          name: service.metadata?.name || service.type,
          description: service.metadata?.description,
          price: {
            amount: service.total_amount,
            currency: service.total_currency
          },
          passenger: service.passenger_id,
          segment: service.segment_id
        }))
      };
    } catch (error) {
      console.error('Duffel ancillary services error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Add services to existing order
   */
  async addServicesToOrder(orderId, services) {
    try {
      // Create order change request
      const changeRequest = {
        data: {
          order_id: orderId,
          add_services: services.map(s => ({
            id: s.serviceId,
            quantity: s.quantity || 1
          }))
        }
      };

      const response = await this.client.post('/air/order_change_requests', changeRequest);
      
      return {
        changeId: response.data.data.id,
        additionalCost: response.data.data.change_total_amount,
        currency: response.data.data.change_total_currency,
        status: response.data.data.status
      };
    } catch (error) {
      console.error('Duffel add services error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Get order change options (date change, passenger change, etc.)
   */
  async getOrderChangeOptions(orderId, changeParams) {
    try {
      const changeRequest = {
        data: {
          order_id: orderId,
          ...changeParams
        }
      };

      const response = await this.client.post('/air/order_change_offers', changeRequest);
      
      return response.data.data.map(offer => ({
        id: offer.id,
        changeType: offer.change_type,
        newTotalAmount: offer.new_total_amount,
        changeTotalAmount: offer.change_total_amount,
        penaltyAmount: offer.penalty_total_amount,
        currency: offer.new_total_currency,
        newSlices: offer.slices,
        expiresAt: offer.expires_at
      }));
    } catch (error) {
      console.error('Duffel order change options error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  /**
   * Confirm order change
   */
  async confirmOrderChange(changeOfferId, payment) {
    try {
      const changeRequest = {
        data: {
          selected_order_change_offer: changeOfferId,
          payment: payment
        }
      };

      const response = await this.client.post('/air/order_changes', changeRequest);
      
      return {
        changeId: response.data.data.id,
        orderId: response.data.data.order_id,
        status: response.data.data.status,
        refundAmount: response.data.data.refund_amount
      };
    } catch (error) {
      console.error('Duffel confirm order change error:', error.response?.data || error);
      throw this.handleDuffelError(error);
    }
  }

  handleDuffelError(error) {
    const errorData = error.response?.data;
    
    if (errorData?.errors) {
      const firstError = errorData.errors[0];
      return new Error(firstError.message || firstError.title || 'Duffel API error');
    }
    
    return error;
  }
}

module.exports = DuffelFlightProvider;

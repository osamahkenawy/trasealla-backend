/**
 * Flight Provider Interface (Supplier Abstraction Layer)
 * All flight providers must implement this interface
 */
class IFlightProvider {
  /**
   * Search for flight offers
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Array of flight offers
   */
  async searchFlights(searchParams) {
    throw new Error('searchFlights() must be implemented');
  }

  /**
   * Get flight offer details by ID
   * @param {string} offerId - Flight offer ID
   * @returns {Promise<Object>} Flight offer details
   */
  async getFlightOffer(offerId) {
    throw new Error('getFlightOffer() must be implemented');
  }

  /**
   * Reprice a flight offer to confirm current price
   * @param {string} offerId - Flight offer ID
   * @returns {Promise<Object>} Repriced flight offer
   */
  async repriceFlightOffer(offerId) {
    throw new Error('repriceFlightOffer() must be implemented');
  }

  /**
   * Create a flight order (booking)
   * @param {Object} orderData - Order data with travelers
   * @returns {Promise<Object>} Flight order confirmation
   */
  async createFlightOrder(orderData) {
    throw new Error('createFlightOrder() must be implemented');
  }

  /**
   * Get flight order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Flight order details
   */
  async getFlightOrder(orderId) {
    throw new Error('getFlightOrder() must be implemented');
  }

  /**
   * Cancel a flight order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancelFlightOrder(orderId) {
    throw new Error('cancelFlightOrder() must be implemented');
  }

  /**
   * Get seat maps for a flight
   * @param {string} flightOfferId - Flight offer ID
   * @returns {Promise<Object>} Seat map data
   */
  async getSeatMaps(flightOfferId) {
    throw new Error('getSeatMaps() must be implemented');
  }
}

module.exports = IFlightProvider;

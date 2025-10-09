const AmadeusFlightProvider = require('./providers/AmadeusFlightProvider');
const DuffelFlightProvider = require('./providers/DuffelFlightProvider');

/**
 * Flight Provider Factory
 * Returns the appropriate flight provider based on configuration or request
 */
class FlightProviderFactory {
  static providers = {
    amadeus: null,
    duffel: null
  };

  /**
   * Get flight provider by name
   */
  static getProvider(providerName = null) {
    const provider = providerName || process.env.DEFAULT_FLIGHT_PROVIDER || 'duffel';

    // Lazy initialization
    if (provider === 'amadeus') {
      if (!this.providers.amadeus) {
        this.providers.amadeus = new AmadeusFlightProvider();
      }
      return this.providers.amadeus;
    }

    if (provider === 'duffel') {
      if (!this.providers.duffel) {
        this.providers.duffel = new DuffelFlightProvider();
      }
      return this.providers.duffel;
    }

    throw new Error(`Unknown flight provider: ${provider}`);
  }

  /**
   * Search across multiple providers (meta-search)
   */
  static async searchAllProviders(searchParams) {
    const results = [];

    // Search Amadeus
    try {
      const amadeusProvider = this.getProvider('amadeus');
      const amadeusResults = await amadeusProvider.searchFlights(searchParams);
      results.push(...amadeusResults);
    } catch (error) {
      console.log('Amadeus search failed:', error.message);
    }

    // Search Duffel
    try {
      const duffelProvider = this.getProvider('duffel');
      const duffelResults = await duffelProvider.searchFlights(searchParams);
      results.push(...duffelResults);
    } catch (error) {
      console.log('Duffel search failed:', error.message);
    }

    // Sort by price
    return results.sort((a, b) => a.price.grandTotal - b.price.grandTotal);
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders() {
    const available = [];

    if (process.env.AMADEUS_CLIENT_ID) {
      available.push({
        name: 'amadeus',
        displayName: 'Amadeus',
        coverage: 'Global',
        features: ['GDS', 'Full service airlines', 'Enterprise support']
      });
    }

    if (process.env.DUFFEL_API_KEY) {
      available.push({
        name: 'duffel',
        displayName: 'Duffel',
        coverage: 'Global',
        features: ['Modern API', 'Easy integration', 'Great documentation']
      });
    }

    return available;
  }
}

module.exports = FlightProviderFactory;

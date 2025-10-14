const { Airport, AirportGroup } = require('../models/Airport');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const FlightProviderFactory = require('../services/FlightProviderFactory');

/**
 * Get all airports with automatic grouping
 * Groups airports by country if multiple airports exist in the same country
 */
exports.getAirports = async (req, res) => {
  try {
    const { search, country, limit = 100, active = true } = req.query;

    // Build query conditions
    const whereClause = {};
    
    if (active !== undefined) {
      whereClause.is_active = active === 'true' || active === true;
    }

    if (country) {
      whereClause.country = { [Op.like]: `%${country}%` };
    }

    if (search) {
      whereClause[Op.or] = [
        { code: { [Op.like]: `%${search.toUpperCase()}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } }
      ];
    }

    // Fetch all airports
    const airports = await Airport.findAll({
      where: whereClause,
      order: [['country', 'ASC'], ['title', 'ASC']],
      limit: parseInt(limit)
    });

    // Group airports by country
    const countryMap = new Map();
    
    airports.forEach(airport => {
      const country = airport.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, []);
      }
      countryMap.get(country).push(airport);
    });

    // Format response
    const formattedAirports = [];
    
    countryMap.forEach((airportsInCountry, country) => {
      if (airportsInCountry.length > 1) {
        // Create an AirportGroup
        formattedAirports.push({
          __typename: 'AirportGroup',
          codes: airportsInCountry.map(a => a.code),
          title: country,
          country: country,
          subAirports: airportsInCountry.map(airport => ({
            code: airport.code,
            title: airport.title,
            country: airport.country,
            __typename: 'SingleAirport'
          }))
        });
      } else {
        // Create a SingleAirport
        const airport = airportsInCountry[0];
        formattedAirports.push({
          __typename: 'SingleAirport',
          code: airport.code,
          title: airport.title,
          country: airport.country
        });
      }
    });

    res.json({
      airports: formattedAirports,
      __typename: 'AirportAutocompleterResults'
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch airports',
      message: error.message 
    });
  }
};

/**
 * Get a single airport by code
 */
exports.getAirportByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const airport = await Airport.findOne({
      where: { 
        code: code.toUpperCase(),
        is_active: true
      }
    });

    if (!airport) {
      return res.status(404).json({ 
        error: 'Airport not found',
        message: `No airport found with code: ${code}`
      });
    }

    res.json({
      __typename: 'SingleAirport',
      code: airport.code,
      title: airport.title,
      city: airport.city,
      country: airport.country,
      country_code: airport.country_code,
      timezone: airport.timezone,
      latitude: airport.latitude,
      longitude: airport.longitude
    });
  } catch (error) {
    console.error('Error fetching airport:', error);
    res.status(500).json({ 
      error: 'Failed to fetch airport',
      message: error.message 
    });
  }
};

/**
 * Search airports with autocomplete (Local Database)
 */
exports.searchAirports = async (req, res) => {
  try {
    const { q, limit = 10, source = 'local' } = req.query;

    // Check if user wants to search from Duffel API
    if (source === 'duffel') {
      return exports.searchAirportsFromDuffel(req, res);
    }

    if (!q || q.length < 2) {
      return res.json({
        airports: [],
        __typename: 'AirportAutocompleterResults'
      });
    }

    const searchTerm = q.toUpperCase();
    
    const airports = await Airport.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { code: { [Op.like]: `${searchTerm}%` } },
          { title: { [Op.like]: `%${q}%` } },
          { city: { [Op.like]: `%${q}%` } },
          { country: { [Op.like]: `%${q}%` } }
        ]
      },
      order: [
        // Prioritize code matches
        [sequelize.literal(`CASE WHEN code LIKE '${searchTerm}%' THEN 0 ELSE 1 END`), 'ASC'],
        ['country', 'ASC'],
        ['title', 'ASC']
      ],
      limit: parseInt(limit)
    });

    // Group by country for response
    const countryMap = new Map();
    
    airports.forEach(airport => {
      const country = airport.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, []);
      }
      countryMap.get(country).push(airport);
    });

    const formattedAirports = [];
    
    countryMap.forEach((airportsInCountry, country) => {
      if (airportsInCountry.length > 1) {
        formattedAirports.push({
          __typename: 'AirportGroup',
          codes: airportsInCountry.map(a => a.code),
          title: country,
          country: country,
          subAirports: airportsInCountry.map(airport => ({
            code: airport.code,
            title: airport.title,
            country: airport.country,
            __typename: 'SingleAirport'
          }))
        });
      } else {
        const airport = airportsInCountry[0];
        formattedAirports.push({
          __typename: 'SingleAirport',
          code: airport.code,
          title: airport.title,
          country: airport.country
        });
      }
    });

    res.json({
      airports: formattedAirports,
      __typename: 'AirportAutocompleterResults',
      source: 'local'
    });
  } catch (error) {
    console.error('Error searching airports:', error);
    res.status(500).json({ 
      error: 'Failed to search airports',
      message: error.message 
    });
  }
};

/**
 * Search airports from Duffel API (Real-time, always up-to-date)
 */
exports.searchAirportsFromDuffel = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 1) {
      return res.json({
        airports: [],
        __typename: 'AirportAutocompleterResults',
        source: 'duffel'
      });
    }

    // Get Duffel provider
    const duffelProvider = FlightProviderFactory.getProvider('duffel');
    
    // Search places from Duffel
    const places = await duffelProvider.searchPlaces(q);
    
    // Transform Duffel response to our format
    const formattedAirports = [];
    const countryMap = new Map();
    
    // Filter only airports (not cities) and process
    const airports = places
      .filter(place => place.type === 'airport')
      .slice(0, parseInt(limit));
    
    airports.forEach(place => {
      // Extract city and country info
      const cityName = place.city_name || place.city?.name || 'Unknown';
      const countryCode = place.iata_country_code || 'Unknown';
      
      // Create a friendly title (e.g., "London Heathrow" or "Dubai")
      let airportTitle = place.name;
      // If airport name includes the city, use as is, otherwise prepend city
      if (!place.name.toLowerCase().includes(cityName.toLowerCase())) {
        airportTitle = `${cityName} ${place.name}`;
      }
      
      const airportData = {
        code: place.iata_code,
        name: place.name,
        title: airportTitle,
        city: cityName,
        country: cityName, // Use city as display country for now
        countryCode: countryCode,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.time_zone,
        icaoCode: place.icao_code
      };
      
      // Group by city name for better organization
      if (!countryMap.has(cityName)) {
        countryMap.set(cityName, []);
      }
      countryMap.get(cityName).push(airportData);
    });
    
    // Format response with grouping
    countryMap.forEach((airportsInCity, cityName) => {
      if (airportsInCity.length > 1) {
        // Multiple airports in same city - create a group
        formattedAirports.push({
          __typename: 'AirportGroup',
          codes: airportsInCity.map(a => a.code),
          title: cityName,
          country: `${cityName}, ${airportsInCity[0].countryCode}`,
          subAirports: airportsInCity.map(airport => ({
            code: airport.code,
            title: airport.name,
            country: `${cityName}, ${airport.countryCode}`,
            __typename: 'SingleAirport'
          }))
        });
      } else {
        // Single airport
        const airport = airportsInCity[0];
        formattedAirports.push({
          __typename: 'SingleAirport',
          code: airport.code,
          title: airport.name,
          country: `${airport.city}, ${airport.countryCode}`
        });
      }
    });

    res.json({
      airports: formattedAirports,
      __typename: 'AirportAutocompleterResults',
      source: 'duffel',
      totalResults: places.length
    });
  } catch (error) {
    console.error('Error searching airports from Duffel:', error);
    res.status(500).json({ 
      error: 'Failed to search airports',
      message: error.message,
      source: 'duffel'
    });
  }
};

/**
 * Create a new airport (Admin only)
 */
exports.createAirport = async (req, res) => {
  try {
    const { 
      code, 
      title, 
      city, 
      country, 
      country_code, 
      timezone, 
      latitude, 
      longitude 
    } = req.body;

    // Validate required fields
    if (!code || !title || !country) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'code, title, and country are required'
      });
    }

    // Check if airport already exists
    const existingAirport = await Airport.findOne({ 
      where: { code: code.toUpperCase() } 
    });

    if (existingAirport) {
      return res.status(409).json({ 
        error: 'Airport already exists',
        message: `Airport with code ${code} already exists`
      });
    }

    const airport = await Airport.create({
      code: code.toUpperCase(),
      title,
      city,
      country,
      country_code: country_code ? country_code.toUpperCase() : null,
      timezone,
      latitude,
      longitude
    });

    res.status(201).json({
      message: 'Airport created successfully',
      airport: {
        __typename: 'SingleAirport',
        code: airport.code,
        title: airport.title,
        city: airport.city,
        country: airport.country,
        country_code: airport.country_code,
        timezone: airport.timezone,
        latitude: airport.latitude,
        longitude: airport.longitude
      }
    });
  } catch (error) {
    console.error('Error creating airport:', error);
    res.status(500).json({ 
      error: 'Failed to create airport',
      message: error.message 
    });
  }
};

/**
 * Bulk create airports (Admin only)
 */
exports.bulkCreateAirports = async (req, res) => {
  try {
    const { airports } = req.body;

    if (!Array.isArray(airports) || airports.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'airports must be a non-empty array'
      });
    }

    const createdAirports = [];
    const errors = [];

    for (const airportData of airports) {
      try {
        const { code, title, city, country, country_code, timezone, latitude, longitude } = airportData;

        if (!code || !title || !country) {
          errors.push({ code, error: 'Missing required fields' });
          continue;
        }

        const existingAirport = await Airport.findOne({ 
          where: { code: code.toUpperCase() } 
        });

        if (existingAirport) {
          errors.push({ code, error: 'Airport already exists' });
          continue;
        }

        const airport = await Airport.create({
          code: code.toUpperCase(),
          title,
          city,
          country,
          country_code: country_code ? country_code.toUpperCase() : null,
          timezone,
          latitude,
          longitude
        });

        createdAirports.push(airport);
      } catch (error) {
        errors.push({ code: airportData.code, error: error.message });
      }
    }

    res.status(201).json({
      message: `Created ${createdAirports.length} airports`,
      created: createdAirports.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error bulk creating airports:', error);
    res.status(500).json({ 
      error: 'Failed to bulk create airports',
      message: error.message 
    });
  }
};

/**
 * Update an airport (Admin only)
 */
exports.updateAirport = async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;

    const airport = await Airport.findOne({ 
      where: { code: code.toUpperCase() } 
    });

    if (!airport) {
      return res.status(404).json({ 
        error: 'Airport not found',
        message: `No airport found with code: ${code}`
      });
    }

    // Don't allow changing the code
    delete updates.code;

    // Uppercase country_code if provided
    if (updates.country_code) {
      updates.country_code = updates.country_code.toUpperCase();
    }

    await airport.update(updates);

    res.json({
      message: 'Airport updated successfully',
      airport: {
        __typename: 'SingleAirport',
        code: airport.code,
        title: airport.title,
        city: airport.city,
        country: airport.country,
        country_code: airport.country_code,
        timezone: airport.timezone,
        latitude: airport.latitude,
        longitude: airport.longitude,
        is_active: airport.is_active
      }
    });
  } catch (error) {
    console.error('Error updating airport:', error);
    res.status(500).json({ 
      error: 'Failed to update airport',
      message: error.message 
    });
  }
};

/**
 * Delete an airport (Admin only)
 */
exports.deleteAirport = async (req, res) => {
  try {
    const { code } = req.params;

    const airport = await Airport.findOne({ 
      where: { code: code.toUpperCase() } 
    });

    if (!airport) {
      return res.status(404).json({ 
        error: 'Airport not found',
        message: `No airport found with code: ${code}`
      });
    }

    await airport.destroy();

    res.json({
      message: 'Airport deleted successfully',
      code: airport.code
    });
  } catch (error) {
    console.error('Error deleting airport:', error);
    res.status(500).json({ 
      error: 'Failed to delete airport',
      message: error.message 
    });
  }
};

/**
 * Toggle airport active status (Admin only)
 */
exports.toggleAirportStatus = async (req, res) => {
  try {
    const { code } = req.params;

    const airport = await Airport.findOne({ 
      where: { code: code.toUpperCase() } 
    });

    if (!airport) {
      return res.status(404).json({ 
        error: 'Airport not found',
        message: `No airport found with code: ${code}`
      });
    }

    airport.is_active = !airport.is_active;
    await airport.save();

    res.json({
      message: `Airport ${airport.is_active ? 'activated' : 'deactivated'} successfully`,
      airport: {
        code: airport.code,
        title: airport.title,
        is_active: airport.is_active
      }
    });
  } catch (error) {
    console.error('Error toggling airport status:', error);
    res.status(500).json({ 
      error: 'Failed to toggle airport status',
      message: error.message 
    });
  }
};

/**
 * Get airports by country
 */
exports.getAirportsByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    const airports = await Airport.findAll({
      where: {
        country: { [Op.like]: `%${country}%` },
        is_active: true
      },
      order: [['title', 'ASC']]
    });

    if (airports.length === 0) {
      return res.status(404).json({ 
        error: 'No airports found',
        message: `No airports found for country: ${country}`
      });
    }

    const formattedAirports = airports.map(airport => ({
      code: airport.code,
      title: airport.title,
      country: airport.country,
      __typename: 'SingleAirport'
    }));

    res.json({
      __typename: 'AirportGroup',
      codes: airports.map(a => a.code),
      title: airports[0].country,
      country: airports[0].country,
      subAirports: formattedAirports
    });
  } catch (error) {
    console.error('Error fetching airports by country:', error);
    res.status(500).json({ 
      error: 'Failed to fetch airports',
      message: error.message 
    });
  }
};


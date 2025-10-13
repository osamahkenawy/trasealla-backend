const express = require('express');
const router = express.Router();
const airportController = require('../controllers/airportController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     SingleAirport:
 *       type: object
 *       properties:
 *         __typename:
 *           type: string
 *           example: SingleAirport
 *         code:
 *           type: string
 *           example: DXB
 *         title:
 *           type: string
 *           example: Dubai
 *         country:
 *           type: string
 *           example: United Arab Emirates
 *     
 *     AirportGroup:
 *       type: object
 *       properties:
 *         __typename:
 *           type: string
 *           example: AirportGroup
 *         codes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["DXB", "AUH", "SHJ"]
 *         title:
 *           type: string
 *           example: United Arab Emirates
 *         country:
 *           type: string
 *           example: United Arab Emirates
 *         subAirports:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SingleAirport'
 *     
 *     AirportAutocompleterResults:
 *       type: object
 *       properties:
 *         airports:
 *           type: array
 *           items:
 *             oneOf:
 *               - $ref: '#/components/schemas/SingleAirport'
 *               - $ref: '#/components/schemas/AirportGroup'
 *         __typename:
 *           type: string
 *           example: AirportAutocompleterResults
 */

/**
 * @swagger
 * /api/airports:
 *   get:
 *     summary: Get all airports with automatic grouping
 *     tags: [Airports]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for airport code, title, city, or country
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of airports to return
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of airports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AirportAutocompleterResults'
 */
router.get('/', airportController.getAirports);

/**
 * @swagger
 * /api/airports/search:
 *   get:
 *     summary: Search airports with autocomplete
 *     tags: [Airports]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AirportAutocompleterResults'
 */
router.get('/search', airportController.searchAirports);

/**
 * @swagger
 * /api/airports/country/{country}:
 *   get:
 *     summary: Get all airports in a specific country
 *     tags: [Airports]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name
 *     responses:
 *       200:
 *         description: Airports in the country
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AirportGroup'
 *       404:
 *         description: No airports found
 */
router.get('/country/:country', airportController.getAirportsByCountry);

/**
 * @swagger
 * /api/airports/{code}:
 *   get:
 *     summary: Get a single airport by code
 *     tags: [Airports]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Airport IATA code (3 letters)
 *     responses:
 *       200:
 *         description: Airport details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleAirport'
 *       404:
 *         description: Airport not found
 */
router.get('/:code', airportController.getAirportByCode);

/**
 * @swagger
 * /api/airports:
 *   post:
 *     summary: Create a new airport (Admin only)
 *     tags: [Airports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - title
 *               - country
 *             properties:
 *               code:
 *                 type: string
 *                 example: DXB
 *               title:
 *                 type: string
 *                 example: Dubai
 *               city:
 *                 type: string
 *                 example: Dubai
 *               country:
 *                 type: string
 *                 example: United Arab Emirates
 *               country_code:
 *                 type: string
 *                 example: AE
 *               timezone:
 *                 type: string
 *                 example: Asia/Dubai
 *               latitude:
 *                 type: number
 *                 example: 25.2532
 *               longitude:
 *                 type: number
 *                 example: 55.3657
 *     responses:
 *       201:
 *         description: Airport created successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Airport already exists
 */
router.post('/', protect, authorize('admin'), airportController.createAirport);

/**
 * @swagger
 * /api/airports/bulk:
 *   post:
 *     summary: Bulk create airports (Admin only)
 *     tags: [Airports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - airports
 *             properties:
 *               airports:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     title:
 *                       type: string
 *                     city:
 *                       type: string
 *                     country:
 *                       type: string
 *                     country_code:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *     responses:
 *       201:
 *         description: Airports created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/bulk', protect, authorize('admin'), airportController.bulkCreateAirports);

/**
 * @swagger
 * /api/airports/{code}:
 *   put:
 *     summary: Update an airport (Admin only)
 *     tags: [Airports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Airport IATA code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               country_code:
 *                 type: string
 *               timezone:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Airport updated successfully
 *       404:
 *         description: Airport not found
 */
router.put('/:code', protect, authorize('admin'), airportController.updateAirport);

/**
 * @swagger
 * /api/airports/{code}/toggle:
 *   patch:
 *     summary: Toggle airport active status (Admin only)
 *     tags: [Airports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Airport IATA code
 *     responses:
 *       200:
 *         description: Airport status toggled successfully
 *       404:
 *         description: Airport not found
 */
router.patch('/:code/toggle', protect, authorize('admin'), airportController.toggleAirportStatus);

/**
 * @swagger
 * /api/airports/{code}:
 *   delete:
 *     summary: Delete an airport (Admin only)
 *     tags: [Airports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Airport IATA code
 *     responses:
 *       200:
 *         description: Airport deleted successfully
 *       404:
 *         description: Airport not found
 */
router.delete('/:code', protect, authorize('admin'), airportController.deleteAirport);

module.exports = router;


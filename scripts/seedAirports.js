require('dotenv').config();
const { Airport } = require('../models/Airport');
const { connectDB } = require('../config/database');

const airportsData = [
  // United Arab Emirates
  { code: 'DXB', title: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', country_code: 'AE', timezone: 'Asia/Dubai', latitude: 25.2532, longitude: 55.3657 },
  { code: 'AUH', title: 'Abu Dhabi', city: 'Abu Dhabi', country: 'United Arab Emirates', country_code: 'AE', timezone: 'Asia/Dubai', latitude: 24.4331, longitude: 54.6511 },
  { code: 'SHJ', title: 'Sharjah', city: 'Sharjah', country: 'United Arab Emirates', country_code: 'AE', timezone: 'Asia/Dubai', latitude: 25.3286, longitude: 55.5172 },
  
  // Lebanon
  { code: 'BEY', title: 'Beirut', city: 'Beirut', country: 'Lebanon', country_code: 'LB', timezone: 'Asia/Beirut', latitude: 33.8208, longitude: 35.4883 },
  
  // Egypt
  { code: 'CAI', title: 'Cairo', city: 'Cairo', country: 'Egypt', country_code: 'EG', timezone: 'Africa/Cairo', latitude: 30.1219, longitude: 31.4056 },
  
  // Saudi Arabia
  { code: 'RUH', title: 'Riyadh', city: 'Riyadh', country: 'Saudi Arabia', country_code: 'SA', timezone: 'Asia/Riyadh', latitude: 24.9578, longitude: 46.6986 },
  { code: 'DMM', title: 'Dammam', city: 'Dammam', country: 'Saudi Arabia', country_code: 'SA', timezone: 'Asia/Riyadh', latitude: 26.4712, longitude: 49.7979 },
  { code: 'MED', title: 'Medina', city: 'Medina', country: 'Saudi Arabia', country_code: 'SA', timezone: 'Asia/Riyadh', latitude: 24.5534, longitude: 39.7050 },
  
  // India
  { code: 'BOM', title: 'Bombay', city: 'Mumbai', country: 'India', country_code: 'IN', timezone: 'Asia/Kolkata', latitude: 19.0896, longitude: 72.8656 },
  { code: 'DEL', title: 'New Delhi', city: 'New Delhi', country: 'India', country_code: 'IN', timezone: 'Asia/Kolkata', latitude: 28.5562, longitude: 77.1000 },
  { code: 'COK', title: 'Cochin', city: 'Kochi', country: 'India', country_code: 'IN', timezone: 'Asia/Kolkata', latitude: 10.1520, longitude: 76.3871 },
  { code: 'BLR', title: 'Bangalore', city: 'Bengaluru', country: 'India', country_code: 'IN', timezone: 'Asia/Kolkata', latitude: 13.1979, longitude: 77.7063 },
  { code: 'MAA', title: 'Chennai', city: 'Chennai', country: 'India', country_code: 'IN', timezone: 'Asia/Kolkata', latitude: 12.9900, longitude: 80.1693 },
  
  // United Kingdom
  { code: 'LHR', title: 'London Heathrow', city: 'London', country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London', latitude: 51.4700, longitude: -0.4543 },
  { code: 'LGW', title: 'London Gatwick', city: 'London', country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London', latitude: 51.1537, longitude: -0.1821 },
  { code: 'MAN', title: 'Manchester', city: 'Manchester', country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London', latitude: 53.3537, longitude: -2.2750 },
  { code: 'BHX', title: 'Birmingham', city: 'Birmingham', country: 'United Kingdom', country_code: 'GB', timezone: 'Europe/London', latitude: 52.4539, longitude: -1.7480 },
  
  // Maldives
  { code: 'MLE', title: 'Male', city: 'Malé', country: 'Maldives', country_code: 'MV', timezone: 'Indian/Maldives', latitude: 4.1917, longitude: 73.5290 },
  
  // Thailand
  { code: 'BKK', title: 'Bangkok', city: 'Bangkok', country: 'Thailand', country_code: 'TH', timezone: 'Asia/Bangkok', latitude: 13.6900, longitude: 100.7501 },
  { code: 'HKT', title: 'Phuket', city: 'Phuket', country: 'Thailand', country_code: 'TH', timezone: 'Asia/Bangkok', latitude: 8.1132, longitude: 98.3169 },
  
  // Philippines
  { code: 'MNL', title: 'Manila', city: 'Manila', country: 'Philippines', country_code: 'PH', timezone: 'Asia/Manila', latitude: 14.5086, longitude: 121.0194 },
  { code: 'CEB', title: 'Cebu', city: 'Cebu City', country: 'Philippines', country_code: 'PH', timezone: 'Asia/Manila', latitude: 10.3075, longitude: 123.8790 },
  
  // Pakistan
  { code: 'LHE', title: 'Lahore', city: 'Lahore', country: 'Pakistan', country_code: 'PK', timezone: 'Asia/Karachi', latitude: 31.5217, longitude: 74.4036 },
  { code: 'ISB', title: 'Islamabad', city: 'Islamabad', country: 'Pakistan', country_code: 'PK', timezone: 'Asia/Karachi', latitude: 33.6169, longitude: 73.0992 },
  
  // Canada
  { code: 'YYZ', title: 'Toronto', city: 'Toronto', country: 'Canada', country_code: 'CA', timezone: 'America/Toronto', latitude: 43.6777, longitude: -79.6248 },
  
  // Turkey
  { code: 'IST', title: 'Istanbul', city: 'Istanbul', country: 'Turkey', country_code: 'TR', timezone: 'Europe/Istanbul', latitude: 40.9769, longitude: 28.8146 },
  
  // Jordan
  { code: 'AMM', title: 'Amman', city: 'Amman', country: 'Jordan', country_code: 'JO', timezone: 'Asia/Amman', latitude: 31.7226, longitude: 35.9932 },
  
  // Mauritius
  { code: 'MRU', title: 'Mauritius', city: 'Port Louis', country: 'Mauritius', country_code: 'MU', timezone: 'Indian/Mauritius', latitude: -20.4302, longitude: 57.6836 },
  
  // Sri Lanka
  { code: 'CMB', title: 'Colombo', city: 'Colombo', country: 'Sri Lanka', country_code: 'LK', timezone: 'Asia/Colombo', latitude: 7.1807, longitude: 79.8842 }
];

const seedAirports = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('🗑️  Clearing existing airports...');
    await Airport.destroy({ where: {}, truncate: true });
    
    console.log('🌍 Seeding airports...');
    
    let created = 0;
    let failed = 0;
    
    for (const airportData of airportsData) {
      try {
        await Airport.create(airportData);
        console.log(`  ✅ Created: ${airportData.code} - ${airportData.title}, ${airportData.country}`);
        created++;
      } catch (error) {
        console.error(`  ❌ Failed to create ${airportData.code}:`, error.message);
        failed++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Successfully created: ${created} airports`);
    if (failed > 0) {
      console.log(`  ❌ Failed: ${failed} airports`);
    }
    
    console.log('\n✨ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding airports:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAirports();


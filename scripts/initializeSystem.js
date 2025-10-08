require('dotenv').config();
const { 
  sequelize, 
  Agency, 
  Role, 
  Currency,
  User,
  Branch
} = require('../models');

async function initializeSystem() {
  try {
    console.log('🚀 Starting system initialization...');

    // Sync database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Create default agency
    const [agency, agencyCreated] = await Agency.findOrCreate({
      where: { name: 'Trasealla Travel Agency' },
      defaults: {
        legalName: 'Trasealla Travel & Tourism LLC',
        registrationNumber: 'TRA-2024-001',
        taxNumber: 'TAX-123456789',
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED', 'SAR'],
        taxRates: {
          default: 15,
          services: {
            visa: 5,
            flight: 0,
            hotel: 15,
            tour: 15,
            activity: 15
          }
        },
        settings: {
          bookingPrefix: 'TRA',
          invoicePrefix: 'INV',
          quotePrefix: 'QUO',
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'ar'],
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          workingHours: {
            sunday: { open: '09:00', close: '18:00' },
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { closed: true },
            saturday: { open: '10:00', close: '16:00' }
          }
        },
        contactInfo: {
          phone: '+1234567890',
          email: 'info@trasealla.com',
          address: '123 Travel Street, City, Country',
          socialMedia: {
            facebook: 'https://facebook.com/trasealla',
            instagram: 'https://instagram.com/trasealla',
            twitter: 'https://twitter.com/trasealla'
          }
        }
      }
    });

    if (agencyCreated) {
      console.log('✅ Default agency created');
    } else {
      console.log('ℹ️ Agency already exists');
    }

    // Create main branch
    const [mainBranch, branchCreated] = await Branch.findOrCreate({
      where: { code: 'MAIN' },
      defaults: {
        agencyId: agency.id,
        name: 'Main Branch',
        type: 'main',
        address: '123 Travel Street',
        city: 'City',
        country: 'Country',
        phone: '+1234567890',
        email: 'main@trasealla.com',
        managerName: 'Branch Manager',
        managerEmail: 'manager@trasealla.com',
        managerPhone: '+1234567891',
        workingHours: agency.settings.workingHours,
        settings: {
          canIssueInvoices: true,
          canProcessPayments: true,
          requiresApproval: false,
          approvalLimit: 10000
        }
      }
    });

    if (branchCreated) {
      console.log('✅ Main branch created');
    } else {
      console.log('ℹ️ Main branch already exists');
    }

    // Create default roles
    const defaultRoles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full system access',
        level: 100,
        isSystem: true,
        permissions: {
          // Full access to everything
          all: true
        }
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access',
        level: 90,
        isSystem: true,
        permissions: {
          agency: { view: true, create: false, update: true, delete: false },
          branches: { view: true, create: true, update: true, delete: true },
          users: { view: true, create: true, update: true, delete: true, assignRoles: true },
          services: {
            tours: { view: true, create: true, update: true, delete: true, publish: true },
            flights: { view: true, search: true, book: true, issue: true, cancel: true },
            hotels: { view: true, search: true, book: true, cancel: true },
            visas: { view: true, apply: true, process: true, approve: true },
            activities: { view: true, create: true, update: true, delete: true, book: true }
          },
          bookings: { viewOwn: true, viewAll: true, create: true, update: true, cancel: true, process: true },
          payments: { viewOwn: true, viewAll: true, process: true, refund: true, reports: true },
          leads: { view: true, create: true, update: true, delete: true, assign: true },
          cms: {
            pages: { view: true, create: true, update: true, delete: true, publish: true },
            blog: { view: true, create: true, update: true, delete: true, publish: true }
          },
          reports: { sales: true, financial: true, operational: true, analytics: true },
          settings: { general: true, payment: true, email: true, integrations: true }
        }
      },
      {
        name: 'agent',
        displayName: 'Travel Agent',
        description: 'Travel agent access',
        level: 50,
        isSystem: true,
        permissions: {
          services: {
            tours: { view: true, create: true, update: true, delete: false, publish: false },
            flights: { view: true, search: true, book: true, issue: false, cancel: false },
            hotels: { view: true, search: true, book: true, cancel: false },
            visas: { view: true, apply: true, process: false, approve: false },
            activities: { view: true, create: true, update: true, delete: false, book: true }
          },
          bookings: { viewOwn: true, viewAll: true, create: true, update: true, cancel: false, process: false },
          payments: { viewOwn: true, viewAll: false, process: false, refund: false, reports: false },
          leads: { view: true, create: true, update: true, delete: false, assign: false },
          cms: {
            pages: { view: true, create: true, update: true, delete: false, publish: false },
            blog: { view: true, create: true, update: true, delete: false, publish: false }
          }
        }
      },
      {
        name: 'customer',
        displayName: 'Customer',
        description: 'Customer access',
        level: 10,
        isSystem: true,
        permissions: {
          services: {
            tours: { view: true },
            flights: { view: true, search: true },
            hotels: { view: true, search: true },
            visas: { view: true },
            activities: { view: true }
          },
          bookings: { viewOwn: true, viewAll: false, create: false, update: false, cancel: false, process: false },
          payments: { viewOwn: true, viewAll: false, process: false, refund: false, reports: false }
        }
      }
    ];

    for (const roleData of defaultRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });

      if (created) {
        console.log(`✅ Role '${roleData.displayName}' created`);
      } else {
        console.log(`ℹ️ Role '${roleData.displayName}' already exists`);
      }
    }

    // Create default currencies
    const defaultCurrencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0, isBaseCurrency: true },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92 },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79 },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 3.67 },
      { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', exchangeRate: 3.75 },
      { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', exchangeRate: 30.90 },
      { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', exchangeRate: 0.71 },
      { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', exchangeRate: 0.31 },
      { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', exchangeRate: 3.64 },
      { code: 'OMR', name: 'Omani Rial', symbol: '﷼', exchangeRate: 0.38 }
    ];

    for (const currencyData of defaultCurrencies) {
      const [currency, created] = await Currency.findOrCreate({
        where: { code: currencyData.code },
        defaults: {
          ...currencyData,
          lastUpdated: new Date()
        }
      });

      if (created) {
        console.log(`✅ Currency '${currencyData.code}' created`);
      } else {
        console.log(`ℹ️ Currency '${currencyData.code}' already exists`);
      }
    }

    // Check if super admin exists
    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    const superAdminExists = await User.findOne({ 
      where: { email: 'admin@trasealla.com' } 
    });

    if (!superAdminExists) {
      console.log('\n⚠️  No super admin user found!');
      console.log('Please run: npm run create:admin');
    }

    console.log('\n✅ System initialization completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Create a super admin user: npm run create:admin');
    console.log('2. Start the server: npm run dev');
    console.log('3. Access the API at: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ System initialization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run initialization
initializeSystem();

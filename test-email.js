#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * Tests Microsoft 365 / Office 365 SMTP configuration
 * 
 * Usage: node test-email.js [recipient@email.com]
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEmailConfiguration() {
  console.log('\n' + '='.repeat(60));
  log('blue', '📧 Trasealla Email Configuration Test');
  console.log('='.repeat(60) + '\n');

  // Check environment variables
  log('yellow', '1️⃣ Checking environment variables...\n');
  
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    log('red', `❌ Missing environment variables: ${missing.join(', ')}`);
    log('yellow', '\nPlease add these to your .env file:');
    missing.forEach(v => console.log(`   ${v}=...`));
    process.exit(1);
  }
  
  log('green', '✅ All required variables present');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM}`);
  
  // Create transporter
  log('yellow', '\n2️⃣ Creating email transporter...\n');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),   // 587
    secure: false,                          // STARTTLS on 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    requireTLS: true,                       // make sure we upgrade
    tls: { rejectUnauthorized: true },      // default/safer; remove custom ciphers
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    logger: process.env.DEBUG === 'true',
    debug: process.env.DEBUG === 'true'
  });
  
  log('green', '✅ Transporter created');
  
  // Verify connection
  log('yellow', '\n3️⃣ Verifying SMTP connection...\n');
  
  try {
    await transporter.verify();
    log('green', '✅ SMTP connection successful!');
    log('green', '   Server is ready to send emails\n');
  } catch (error) {
    log('red', '❌ SMTP connection failed!');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.code === 'EAUTH') {
      log('yellow', '💡 Authentication failed. Please check:');
      console.log('   1. Email and password are correct');
      console.log('   2. SMTP authentication is enabled in Microsoft 365');
      console.log('   3. Account is not locked or suspended');
      console.log('   4. Try using an app password (if 2FA is enabled)\n');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      log('yellow', '💡 Connection failed. Please check:');
      console.log('   1. SMTP host and port are correct');
      console.log('   2. Server firewall allows outbound SMTP');
      console.log('   3. Network connection is stable\n');
    }
    
    process.exit(1);
  }
  
  // Send test email
  log('yellow', '4️⃣ Sending test email...\n');
  
  const recipient = process.argv[2] || process.env.EMAIL_USER;
  const emailName = process.env.EMAIL_NAME || 'Trasealla Travel Agency';
  
  const mailOptions = {
    from: `"${emailName}" <${process.env.EMAIL_FROM}>`,
    to: recipient,
    subject: '✅ Trasealla Email Test - Configuration Successful',
    text: 'This is a test email from Trasealla Backend API. Your email configuration is working correctly!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .success-box {
              background: #d4edda;
              border: 2px solid #28a745;
              color: #155724;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: #667eea; margin-top: 0; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✈️ Trasealla Travel Agency</h1>
            <p>Email Configuration Test</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <h2>✅ Email Configuration Successful!</h2>
              <p><strong>Your email system is working correctly!</strong></p>
            </div>
            
            <div class="info-box">
              <h3>📋 Configuration Details:</h3>
              <ul>
                <li><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</li>
                <li><strong>SMTP Port:</strong> ${process.env.EMAIL_PORT}</li>
                <li><strong>Email User:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>From Address:</strong> ${process.env.EMAIL_FROM}</li>
                <li><strong>Recipient:</strong> ${recipient}</li>
                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>🎯 What This Means:</h3>
              <p>Your Trasealla Backend can now send:</p>
              <ul>
                <li>✈️ Flight booking confirmations</li>
                <li>🎫 E-ticket delivery emails</li>
                <li>📧 Customer notifications</li>
                <li>🔐 Password reset links</li>
                <li>📬 Order updates and changes</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated test email from Trasealla Backend API</p>
              <p>Powered by Microsoft 365 • ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    log('green', '✅ Test email sent successfully!\n');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   From: ${mailOptions.from}`);
    
    log('blue', '\n📬 Check your inbox!');
    log('yellow', '   (Don\'t forget to check spam/junk folder)\n');
    
    console.log('='.repeat(60));
    log('green', '✅ All tests passed! Your email is configured correctly.');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    log('red', '❌ Failed to send test email!\n');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Server Response: ${error.response}`);
    }
    
    log('yellow', '\n💡 Common solutions:');
    console.log('   1. Verify EMAIL_FROM matches EMAIL_USER');
    console.log('   2. Check recipient email is valid');
    console.log('   3. Ensure email account is active');
    console.log('   4. Check Microsoft 365 sending limits\n');
    
    process.exit(1);
  }
}

// Run the test
testEmailConfiguration().catch(error => {
  log('red', '\n❌ Unexpected error occurred:');
  console.error(error);
  process.exit(1);
});


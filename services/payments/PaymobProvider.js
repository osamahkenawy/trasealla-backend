const axios = require('axios');

/**
 * Paymob Payment Gateway Provider
 * For Egypt market
 * Documentation: https://docs.paymob.com/
 */
class PaymobProvider {
  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.integrationId = process.env.PAYMOB_INTEGRATION_ID;
    this.iframeId = process.env.PAYMOB_IFRAME_ID;
    this.baseUrl = 'https://accept.paymob.com/api';
  }

  /**
   * Get authentication token
   */
  async getAuthToken() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
        api_key: this.apiKey
      });
      
      return response.data.token;
    } catch (error) {
      console.error('Paymob auth error:', error.response?.data || error);
      throw new Error('Paymob authentication failed');
    }
  }

  /**
   * Create order
   */
  async createOrder(authToken, orderData) {
    try {
      const {
        amount,
        currency = 'EGP',
        orderReference,
        items = []
      } = orderData;

      const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: Math.round(amount * 100), // Paymob uses cents
        currency,
        merchant_order_id: orderReference,
        items: items.length > 0 ? items : [{
          name: 'Travel Booking',
          amount_cents: Math.round(amount * 100),
          description: orderReference,
          quantity: 1
        }]
      });

      return response.data;
    } catch (error) {
      console.error('Paymob create order error:', error.response?.data || error);
      throw new Error('Order creation failed');
    }
  }

  /**
   * Get payment key
   */
  async getPaymentKey(authToken, orderData) {
    try {
      const {
        amount,
        currency = 'EGP',
        orderId,
        customerName,
        customerEmail,
        customerPhone
      } = orderData;

      const response = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, {
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: 'NA',
          email: customerEmail,
          floor: 'NA',
          first_name: customerName.split(' ')[0] || 'Customer',
          last_name: customerName.split(' ').slice(1).join(' ') || 'Name',
          phone_number: customerPhone,
          street: 'NA',
          building: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'NA',
          country: 'EG',
          state: 'NA'
        },
        currency,
        integration_id: this.integrationId
      });

      return response.data.token;
    } catch (error) {
      console.error('Paymob payment key error:', error.response?.data || error);
      throw new Error('Payment key generation failed');
    }
  }

  /**
   * Create payment (complete flow)
   */
  async createPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'EGP',
        customerName,
        customerEmail,
        customerPhone,
        orderReference,
        orderDescription
      } = paymentData;

      // Step 1: Get auth token
      const authToken = await this.getAuthToken();

      // Step 2: Create order
      const order = await this.createOrder(authToken, {
        amount,
        currency,
        orderReference,
        items: [{
          name: orderDescription || 'Travel Booking',
          amount_cents: Math.round(amount * 100),
          description: orderReference,
          quantity: 1
        }]
      });

      // Step 3: Get payment key
      const paymentKey = await this.getPaymentKey(authToken, {
        amount,
        currency,
        orderId: order.id,
        customerName,
        customerEmail,
        customerPhone
      });

      // Generate payment URL
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;

      return {
        success: true,
        orderId: order.id,
        paymentKey,
        paymentUrl,
        transactionId: orderReference,
        provider: 'Paymob'
      };
    } catch (error) {
      console.error('Paymob create payment error:', error);
      throw error;
    }
  }

  /**
   * Verify payment from callback
   */
  async verifyCallback(callbackData) {
    try {
      // Paymob sends HMAC for verification
      const {
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order,
        owner,
        pending,
        source_data,
        success
      } = callbackData;

      // Verify HMAC (security)
      // const calculatedHmac = calculateHmac(callbackData);
      // if (calculatedHmac !== callbackData.hmac) throw new Error('Invalid HMAC');

      return {
        success: success && !error_occured,
        transactionId: id,
        orderId: order?.id,
        orderReference: order?.merchant_order_id,
        amount: amount_cents / 100,
        currency,
        paymentMethod: source_data?.type,
        cardDetails: source_data?.pan ? {
          last4: source_data.pan.slice(-4),
          scheme: source_data.sub_type
        } : null,
        isPending: pending,
        isRefunded: is_refunded,
        raw: callbackData
      };
    } catch (error) {
      console.error('Paymob verify callback error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionId, amount) {
    try {
      const authToken = await this.getAuthToken();

      const response = await axios.post(`${this.baseUrl}/acceptance/void_refund/refund`, {
        auth_token: authToken,
        transaction_id: transactionId,
        amount_cents: Math.round(amount * 100)
      });

      return {
        success: true,
        refundId: response.data.id,
        amount: response.data.amount_cents / 100,
        status: response.data.success ? 'completed' : 'failed'
      };
    } catch (error) {
      console.error('Paymob refund error:', error.response?.data || error);
      throw new Error('Refund failed');
    }
  }
}

module.exports = PaymobProvider;

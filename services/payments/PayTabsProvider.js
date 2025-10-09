const axios = require('axios');

/**
 * PayTabs Payment Gateway Provider
 * For UAE, Saudi Arabia, and MENA region
 * Documentation: https://site.paytabs.com/en/api/
 */
class PayTabsProvider {
  constructor() {
    this.profileId = process.env.PAYTABS_PROFILE_ID;
    this.serverKey = process.env.PAYTABS_SERVER_KEY;
    this.baseUrl = process.env.PAYTABS_ENV === 'production'
      ? 'https://secure.paytabs.com'
      : 'https://secure-egypt.paytabs.com'; // Test endpoint
    this.currency = 'AED'; // Default currency
  }

  /**
   * Create payment page
   */
  async createPaymentPage(paymentData) {
    try {
      const {
        amount,
        currency = 'AED',
        customerName,
        customerEmail,
        customerPhone,
        orderDescription,
        orderReference,
        returnUrl,
        callbackUrl
      } = paymentData;

      const payload = {
        profile_id: this.profileId,
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: orderReference,
        cart_description: orderDescription,
        cart_currency: currency,
        cart_amount: parseFloat(amount).toFixed(2),
        
        // Customer details
        customer_details: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          street1: 'N/A',
          city: 'N/A',
          state: 'N/A',
          country: currency === 'AED' ? 'AE' : 'EG',
          zip: '00000'
        },
        
        // URLs
        return: returnUrl || `${process.env.FRONTEND_URL}/payment/return`,
        callback: callbackUrl || `${process.env.BACKEND_URL}/api/payments/paytabs/callback`
      };

      const response = await axios.post(
        `${this.baseUrl}/payment/request`,
        payload,
        {
          headers: {
            'Authorization': this.serverKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.tran_ref,
        paymentUrl: response.data.redirect_url,
        cartId: orderReference,
        provider: 'PayTabs'
      };
    } catch (error) {
      console.error('PayTabs create payment error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'PayTabs payment creation failed');
    }
  }

  /**
   * Verify payment callback
   */
  async verifyPayment(transactionRef) {
    try {
      const payload = {
        profile_id: this.profileId,
        tran_ref: transactionRef
      };

      const response = await axios.post(
        `${this.baseUrl}/payment/query`,
        payload,
        {
          headers: {
            'Authorization': this.serverKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;

      return {
        success: data.payment_result?.response_status === 'A', // A = Approved
        transactionId: data.tran_ref,
        amount: data.cart_amount,
        currency: data.cart_currency,
        status: data.payment_result?.response_status,
        message: data.payment_result?.response_message,
        paymentMethod: data.payment_info?.payment_method,
        cardDetails: {
          scheme: data.payment_info?.card_scheme,
          last4: data.payment_info?.card_number?.slice(-4)
        },
        raw: data
      };
    } catch (error) {
      console.error('PayTabs verify payment error:', error.response?.data || error);
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Process refund
   */
  async processRefund(transactionRef, amount, reason) {
    try {
      const payload = {
        profile_id: this.profileId,
        tran_ref: transactionRef,
        tran_type: 'refund',
        tran_class: 'ecom',
        cart_id: `REF-${transactionRef}`,
        cart_description: reason || 'Refund request',
        cart_currency: this.currency,
        cart_amount: parseFloat(amount).toFixed(2)
      };

      const response = await axios.post(
        `${this.baseUrl}/payment/request`,
        payload,
        {
          headers: {
            'Authorization': this.serverKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.payment_result?.response_status === 'A',
        refundId: response.data.tran_ref,
        amount: response.data.cart_amount,
        status: response.data.payment_result?.response_status,
        message: response.data.payment_result?.response_message
      };
    } catch (error) {
      console.error('PayTabs refund error:', error.response?.data || error);
      throw new Error('Refund processing failed');
    }
  }

  /**
   * Tokenize card for recurring payments
   */
  async tokenizeCard(paymentData) {
    const payload = {
      ...paymentData,
      tran_type: 'sale',
      tran_class: 'recurring',
      tokenise: '2' // Tokenize card
    };

    // Similar to createPaymentPage but with tokenization
    return this.createPaymentPage(payload);
  }
}

module.exports = PayTabsProvider;

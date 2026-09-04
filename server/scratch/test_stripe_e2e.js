require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const WEBHOOK_URL = 'http://localhost:5000/api/webhooks/stripe';

async function runStripeE2ETest() {
  console.log('======================================================================');
  console.log('   STRIPE PAYMENT FLOW END-TO-END AUTOMATED TEST SUITE');
  console.log('======================================================================\n');

  let customerToken = '';
  let customerUser = null;
  let ownerToken = '';
  let ownerUser = null;
  let secondCustomerToken = '';
  let testProperty = null;
  let createdBooking = null;
  let pendingBooking = null;
  let checkoutSessionData = null;

  // -------------------------------------------------------------------------
  // STEP 1: Setup & Authentication
  // -------------------------------------------------------------------------
  console.log('[STEP 1] Setup: Authenticating test accounts...');
  try {
    // 1a: Primary Customer Login
    const custRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer@example.com',
      password: 'password123!A',
    });
    customerToken = custRes.data.data.token;
    customerUser = custRes.data.data;
    console.log(`  ✓ Customer logged in: ${customerUser.name} (${customerUser.email})`);

    // 1b: Primary Host / Owner Login
    const ownerRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'owner@example.com',
      password: 'password123!A',
    });
    ownerToken = ownerRes.data.data.token;
    ownerUser = ownerRes.data.data;
    console.log(`  ✓ Owner logged in: ${ownerUser.name} (${ownerUser.email})`);

    // 1c: Second Customer (for negative auth test)
    const secondRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'julian.hayes@example.com',
      password: 'password123!A',
    });
    secondCustomerToken = secondRes.data.data.token;
    console.log(`  ✓ Second customer authenticated: ${secondRes.data.data.email}`);
    console.log('>>> [PASS] STEP 1: Authentication Successful\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 1: Authentication Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 2: Create a Booking (Status: pending)
  // -------------------------------------------------------------------------
  console.log('[STEP 2] Customer creates a booking for an owner retreat...');
  try {
    // Fetch owner's properties directly using /my-properties
    const propsRes = await axios.get(`${BASE_URL}/properties/my-properties`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const myProps = propsRes.data.data || [];
    testProperty = myProps.find(p => p.isApproved === true);
    
    if (!testProperty) {
      // If none approved, log all
      console.log('  Owner properties:', myProps.map(p => ({ title: p.title, isApproved: p.isApproved })));
      throw new Error('No approved properties found for owner@example.com');
    }
    console.log(`  Selected Retreat: "${testProperty.title}" ($${testProperty.pricePerNight}/night)`);

    // Pick dynamic future non-conflicting dates
    const uniqueDays = Math.floor(Math.random() * 300) + 400; // ~400+ days in future
    const checkInDate = new Date(Date.now() + uniqueDays * 24 * 60 * 60 * 1000);
    const checkOutDate = new Date(checkInDate.getTime() + 4 * 24 * 60 * 60 * 1000);

    const bookingRes = await axios.post(
      `${BASE_URL}/bookings`,
      {
        propertyId: testProperty._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        guests: 2,
        specialRequest: 'Automated Stripe test booking',
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` },
      }
    );

    createdBooking = bookingRes.data.data;
    console.log(`  ✓ Booking Created ID: ${createdBooking._id}`);
    console.log(`  ✓ Status: "${createdBooking.status}" (Expected: 'pending')`);
    console.log(`  ✓ Payment Status: "${createdBooking.paymentStatus}" (Expected: 'unpaid')`);
    console.log(`  ✓ Total Price: $${createdBooking.totalPrice}`);

    if (createdBooking.status !== 'pending' || createdBooking.paymentStatus !== 'unpaid') {
      throw new Error(`Unexpected initial status: status=${createdBooking.status}, paymentStatus=${createdBooking.paymentStatus}`);
    }
    console.log('>>> [PASS] STEP 2: Booking Created in Pending State\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 2: Booking Creation Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 3: Owner Accepts Booking (Status -> confirmed)
  // -------------------------------------------------------------------------
  console.log('[STEP 3] Owner accepts the booking request...');
  try {
    const acceptRes = await axios.patch(
      `${BASE_URL}/bookings/${createdBooking._id}/status`,
      { status: 'confirmed' },
      {
        headers: { Authorization: `Bearer ${ownerToken}` },
      }
    );

    const confirmedBooking = acceptRes.data.data;
    console.log(`  ✓ Booking Status Updated: "${confirmedBooking.status}" (Expected: 'confirmed')`);
    console.log(`  ✓ Payment Status Preserved: "${confirmedBooking.paymentStatus}" (Expected: 'unpaid')`);

    if (confirmedBooking.status !== 'confirmed' || confirmedBooking.paymentStatus !== 'unpaid') {
      throw new Error(`Status verification failed after owner acceptance: status=${confirmedBooking.status}`);
    }
    console.log('>>> [PASS] STEP 3: Owner Successfully Confirmed Booking\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 3: Owner Acceptance Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 4: Create Stripe Checkout Session
  // -------------------------------------------------------------------------
  console.log('[STEP 4] Customer initiates payment session (POST /api/bookings/:id/create-checkout-session)...');
  try {
    const sessionRes = await axios.post(
      `${BASE_URL}/bookings/${createdBooking._id}/create-checkout-session`,
      {},
      {
        headers: { Authorization: `Bearer ${customerToken}` },
      }
    );

    checkoutSessionData = sessionRes.data;
    console.log(`  ✓ Checkout Session ID: ${checkoutSessionData.sessionId}`);
    console.log(`  ✓ Stripe Hosted URL: ${checkoutSessionData.url}`);

    if (!checkoutSessionData.url || !checkoutSessionData.sessionId) {
      throw new Error('Response missing checkout session URL or sessionId.');
    }

    // Verify session ID was persisted on the booking
    const checkBookingRes = await axios.get(`${BASE_URL}/bookings/${createdBooking._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const updatedBooking = checkBookingRes.data.data;
    console.log(`  ✓ Booking Persisted Session ID: ${updatedBooking.stripeCheckoutSessionId}`);

    if (updatedBooking.stripeCheckoutSessionId !== checkoutSessionData.sessionId) {
      throw new Error('Booking stripeCheckoutSessionId does not match returned sessionId.');
    }
    console.log('>>> [PASS] STEP 4: Stripe Checkout Session Created & Persisted\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 4: Checkout Session Creation Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 5: Negative Tests (Pending Status & Unauthorized Customer)
  // -------------------------------------------------------------------------
  console.log('[STEP 5] Running Negative Tests...');
  try {
    // 5a: Attempt checkout on a PENDING booking
    console.log('  Testing 5a: Attempt payment on unconfirmed (pending) booking...');
    const pendingCheckIn = new Date(Date.now() + (Math.floor(Math.random() * 300) + 800) * 24 * 60 * 60 * 1000);
    const pendingCheckOut = new Date(pendingCheckIn.getTime() + 3 * 24 * 60 * 60 * 1000);

    const pendingRes = await axios.post(
      `${BASE_URL}/bookings`,
      {
        propertyId: testProperty._id,
        checkInDate: pendingCheckIn.toISOString(),
        checkOutDate: pendingCheckOut.toISOString(),
        guests: 1,
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    pendingBooking = pendingRes.data.data;

    let pendingBlocked = false;
    try {
      await axios.post(
        `${BASE_URL}/bookings/${pendingBooking._id}/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
    } catch (err) {
      if (err.response?.status === 400) {
        pendingBlocked = true;
        console.log(`    ✓ Correctly Rejected (400 Bad Request): "${err.response.data.message}"`);
      } else {
        throw new Error(`Expected 400 Bad Request, got status ${err.response?.status}`);
      }
    }
    if (!pendingBlocked) {
      throw new Error('Security violation: Payment checkout session was allowed on a pending booking!');
    }

    // 5b: Attempt checkout as an UNAUTHORIZED customer
    console.log('  Testing 5b: Attempt payment by a DIFFERENT customer (unauthorized)...');
    let unauthorizedBlocked = false;
    try {
      await axios.post(
        `${BASE_URL}/bookings/${createdBooking._id}/create-checkout-session`,
        {},
        { headers: { Authorization: `Bearer ${secondCustomerToken}` } }
      );
    } catch (err) {
      if (err.response?.status === 403) {
        unauthorizedBlocked = true;
        console.log(`    ✓ Correctly Rejected (403 Forbidden): "${err.response.data.message}"`);
      } else {
        throw new Error(`Expected 403 Forbidden, got status ${err.response?.status}`);
      }
    }
    if (!unauthorizedBlocked) {
      throw new Error('Security violation: A different customer was allowed to generate a checkout session!');
    }

    console.log('>>> [PASS] STEP 5: Negative Security Validations Enforced\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 5: Negative Tests Failed:', err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 6: Simulate Stripe Webhook with Cryptographic Signature
  // -------------------------------------------------------------------------
  console.log('[STEP 6] Simulating Stripe Webhook (checkout.session.completed)...');
  const simulatedPaymentIntentId = `pi_test_${Date.now()}`;
  let rawPayloadString = '';
  let validSignatureHeader = '';

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is missing from server/.env.');
    }

    // Construct the standard Stripe checkout.session.completed event payload
    const eventPayload = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2022-11-15',
      created: Math.floor(Date.now() / 1000),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: checkoutSessionData.sessionId,
          object: 'checkout.session',
          amount_total: Math.round(createdBooking.totalPrice * 100),
          currency: 'usd',
          customer_email: customerUser.email,
          payment_intent: simulatedPaymentIntentId,
          payment_status: 'paid',
          status: 'complete',
          metadata: {
            bookingId: createdBooking._id.toString(),
            customerId: customerUser._id.toString(),
          },
        },
      },
    };

    rawPayloadString = JSON.stringify(eventPayload, null, 2);

    // Generate valid HMAC-SHA256 signature header using Stripe SDK test utility
    validSignatureHeader = stripe.webhooks.generateTestHeaderString({
      payload: rawPayloadString,
      secret: webhookSecret,
    });

    console.log(`  ✓ Generated Valid Signature Header: ${validSignatureHeader.substring(0, 40)}...`);

    // Send POST request with RAW string payload and stripe-signature header
    const webhookRes = await axios.post(WEBHOOK_URL, rawPayloadString, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': validSignatureHeader,
      },
    });

    console.log(`  ✓ Webhook Endpoint Response Status: ${webhookRes.status} (Expected: 200)`);
    console.log(`  ✓ Webhook Response Body:`, webhookRes.data);

    if (webhookRes.status !== 200 || !webhookRes.data.received) {
      throw new Error(`Unexpected webhook response: ${JSON.stringify(webhookRes.data)}`);
    }
    console.log('>>> [PASS] STEP 6: Webhook Successfully Delivered and Acknowledged (200 OK)\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 6: Webhook Simulation Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 7: Verify Booking Payment Status Updated to 'paid'
  // -------------------------------------------------------------------------
  console.log('[STEP 7] Verifying database state after webhook processing...');
  try {
    const verifyRes = await axios.get(`${BASE_URL}/bookings/${createdBooking._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const finalBooking = verifyRes.data.data;
    console.log(`  ✓ Booking ID: ${finalBooking._id}`);
    console.log(`  ✓ Status: "${finalBooking.status}"`);
    console.log(`  ✓ Payment Status: "${finalBooking.paymentStatus}" (Expected: 'paid')`);
    console.log(`  ✓ Payment Intent ID: "${finalBooking.stripePaymentIntentId}" (Expected: '${simulatedPaymentIntentId}')`);

    if (finalBooking.paymentStatus !== 'paid') {
      throw new Error(`Expected paymentStatus 'paid', but got '${finalBooking.paymentStatus}'`);
    }
    if (finalBooking.stripePaymentIntentId !== simulatedPaymentIntentId) {
      throw new Error(`Expected stripePaymentIntentId '${simulatedPaymentIntentId}', but got '${finalBooking.stripePaymentIntentId}'`);
    }
    console.log('>>> [PASS] STEP 7: Database Verified - Booking is Marked PAID\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 7: Database Verification Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // STEP 8: Verify Webhook Idempotency & Safety
  // -------------------------------------------------------------------------
  console.log('[STEP 8] Testing Webhook Idempotency (Duplicate Event Retry)...');
  try {
    const retryRes = await axios.post(WEBHOOK_URL, rawPayloadString, {
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': validSignatureHeader,
      },
    });

    console.log(`  ✓ Retry Webhook Response: ${retryRes.status} OK`);

    // Verify booking remains in valid paid state
    const afterRetryRes = await axios.get(`${BASE_URL}/bookings/${createdBooking._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const afterRetryBooking = afterRetryRes.data.data;

    if (afterRetryBooking.paymentStatus !== 'paid') {
      throw new Error(`State corrupted on duplicate webhook! Got: ${afterRetryBooking.paymentStatus}`);
    }
    console.log(`  ✓ Booking stably remains: paymentStatus = "${afterRetryBooking.paymentStatus}"`);
    console.log('>>> [PASS] STEP 8: Webhook Idempotency & Replay Safety Confirmed\n');
  } catch (err) {
    console.error('>>> [FAIL] STEP 8: Idempotency Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }

  console.log('======================================================================');
  console.log('   🎉 ALL 8 STRIPE PAYMENT INTEGRATION TESTS PASSED (100% SUCCESS)');
  console.log('======================================================================\n');
}

runStripeE2ETest();

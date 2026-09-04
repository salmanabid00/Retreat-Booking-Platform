const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? require('stripe')(key) : null;
};
const Booking = require('../models/Booking');
const { createSystemMessageAndNotification } = require('../utils/systemMessageHelper');

// @desc    Handle Stripe Webhooks
// @route   POST /api/webhooks/stripe
// @access  Public (Secured via Stripe Signature Verification)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  if (!stripe) {
    console.warn('[Stripe Webhook Warning]: STRIPE_SECRET_KEY is not set.');
    return res.status(500).json({ error: 'Stripe secret key not configured on server.' });
  }

  if (!webhookSecret) {
    console.warn('[Stripe Webhook Warning]: STRIPE_WEBHOOK_SECRET is not set.');
    return res.status(400).send('Webhook secret not configured.');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`[Stripe Webhook Error]: Signature verification failed - ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process supported Stripe webhook events
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        const booking = await Booking.findById(bookingId)
          .populate('property', 'title location propertyType images owner')
          .populate('customer', 'name email avatar');

        if (booking) {
          booking.paymentStatus = 'paid';
          booking.stripePaymentIntentId = session.payment_intent || '';
          if (!booking.stripeCheckoutSessionId) {
            booking.stripeCheckoutSessionId = session.id;
          }
          await booking.save();

          console.log(`[Stripe Webhook]: Booking ${bookingId} successfully marked as PAID.`);

          // Trigger System Notification / Socket update
          const io = req.app.get('io');
          try {
            await createSystemMessageAndNotification({
              booking,
              type: 'booking_paid',
              io,
            });
          } catch (notifErr) {
            console.error('[Stripe Webhook Notification Error]:', notifErr);
          }
        } else {
          console.warn(`[Stripe Webhook]: Booking ${bookingId} not found in database.`);
        }
      }
    }

    // Acknowledge receipt to Stripe immediately
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Processing Error]:', error);
    res.status(500).json({ error: 'Failed to process webhook event' });
  }
};

module.exports = {
  handleStripeWebhook,
};

/**
 * Required Tests — Email Verification Flow
 * Run: node scratch/test_verification.js
 */
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  console.log('=== EMAIL VERIFICATION FLOW — REQUIRED TESTS ===\n');
  await mongoose.connect('mongodb://127.0.0.1:27017/retreat_booking_db');

  const BASE = 'http://localhost:5000/api/auth';

  async function post(path, body) {
    const r = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.json();
  }

  async function get(path) {
    const r = await fetch(`${BASE}${path}`);
    return r.json();
  }

  // ─── Test 2: Pre-verification login blocking ─────────────────────────────
  console.log('--- Test Setup: Creating an unverified Customer account ---');
  const customerEmail = 'test_verify_customer_' + Date.now() + '@gmail.com';
  const regResult = await post('/register', {
    name: 'Test Customer',
    email: customerEmail,
    password: 'StrongPass123!A',
    role: 'customer',
  });
  console.log('Register Result:', {
    success: regResult.success,
    requiresVerification: regResult.requiresVerification,
    emailSent: regResult.emailSent,
    message: regResult.message,
  }, '\n');

  // Test 2: Try logging in BEFORE clicking verification link
  console.log('[Test 2] Login BEFORE verification (must be blocked):');
  const loginBeforeVerify = await post('/login', {
    email: customerEmail,
    password: 'StrongPass123!A',
  });
  console.log('  -> Status expected: 403 requiresVerification');
  console.log('  -> Got:', {
    success: loginBeforeVerify.success,
    requiresVerification: loginBeforeVerify.requiresVerification,
    message: loginBeforeVerify.message,
  });
  console.log('  -> PASS:', loginBeforeVerify.success === false && loginBeforeVerify.requiresVerification === true, '\n');

  // ─── Test 3: Get token from DB, simulate clicking verification link ───────
  console.log('[Test 3] Simulate clicking verification link:');
  const userInDB = await User.findOne({ email: customerEmail })
    .select('+verificationToken +verificationTokenExpire');
  const verifyToken = userInDB?.verificationToken;
  console.log('  -> Token found in DB:', !!verifyToken);

  if (verifyToken) {
    const verifyResult = await get(`/verify-email/${verifyToken}`);
    console.log('  -> Verify Result:', verifyResult);
    console.log('  -> PASS:', verifyResult.success === true, '\n');

    // Login AFTER verification — must succeed
    console.log('[Test 3b] Login AFTER verification (must succeed):');
    const loginAfterVerify = await post('/login', {
      email: customerEmail,
      password: 'StrongPass123!A',
    });
    console.log('  -> Got:', {
      success: loginAfterVerify.success,
      token: loginAfterVerify.data?.token ? '[JWT_PRESENT]' : null,
      name: loginAfterVerify.data?.name,
    });
    console.log('  -> PASS:', loginAfterVerify.success === true && !!loginAfterVerify.data?.token, '\n');
  }

  // ─── Test 4: Fake address (gmail.com domain real, inbox fake) ─────────────
  console.log('[Test 4] Register with fake-but-plausible gmail address:');
  const fakeGmailReg = await post('/register', {
    name: 'Fake Inbox User',
    email: 'asdkfj92910999@gmail.com',
    password: 'StrongPass123!A',
    role: 'customer',
  });
  console.log('  -> Register:', {
    success: fakeGmailReg.success,
    requiresVerification: fakeGmailReg.requiresVerification,
    message: fakeGmailReg.message,
  });

  const fakeLoginAttempt = await post('/login', {
    email: 'asdkfj92910999@gmail.com',
    password: 'StrongPass123!A',
  });
  console.log('  -> Login (must be blocked forever since no one owns the inbox):');
  console.log('  ->', {
    success: fakeLoginAttempt.success,
    requiresVerification: fakeLoginAttempt.requiresVerification,
  });
  console.log('  -> PASS:', fakeLoginAttempt.success === false && fakeLoginAttempt.requiresVerification === true, '\n');

  // ─── Test 5: Seeded demo accounts (isVerified:true) ───────────────────────
  console.log('[Test 5] Seeded demo account logins (no verification step):');
  const demos = [
    { email: 'customer@example.com', password: 'password123!A' },
    { email: 'owner@example.com', password: 'password123!A' },
    { email: 'owner2@example.com', password: 'password123!A' },
    { email: 'admin@example.com', password: 'password123!A' },
  ];
  for (const demo of demos) {
    const r = await post('/login', demo);
    console.log(`  ${demo.email}: ${r.success ? 'PASS (Logged in as ' + r.data?.role + ')' : 'FAIL — ' + r.message}`);
  }
  console.log();

  // ─── Test 6: Property Host / Owner registration (same flow) ───────────────
  console.log('[Test 6] Property Host (owner) registration — same verification flow:');
  const ownerEmail = 'test_verify_host_' + Date.now() + '@gmail.com';
  const ownerReg = await post('/register', {
    name: 'Test Host',
    email: ownerEmail,
    password: 'StrongPass123!A',
    role: 'owner',
  });
  console.log('  -> Register:', {
    success: ownerReg.success,
    requiresVerification: ownerReg.requiresVerification,
    emailSent: ownerReg.emailSent,
  });

  const ownerLoginBefore = await post('/login', {
    email: ownerEmail,
    password: 'StrongPass123!A',
  });
  console.log('  -> Login before verify (must be blocked):');
  console.log('  ->', {
    success: ownerLoginBefore.success,
    requiresVerification: ownerLoginBefore.requiresVerification,
  });

  // Simulate verify for owner too
  const ownerInDB = await User.findOne({ email: ownerEmail })
    .select('+verificationToken +verificationTokenExpire');
  if (ownerInDB?.verificationToken) {
    const ownerVerify = await get(`/verify-email/${ownerInDB.verificationToken}`);
    const ownerLoginAfter = await post('/login', { email: ownerEmail, password: 'StrongPass123!A' });
    console.log('  -> Login after verify (must succeed):');
    console.log('  ->', {
      success: ownerLoginAfter.success,
      role: ownerLoginAfter.data?.role,
      token: ownerLoginAfter.data?.token ? '[JWT_PRESENT]' : null,
    });
    console.log('  -> PASS:', ownerLoginAfter.success === true && ownerLoginAfter.data?.role === 'owner', '\n');
  }

  await mongoose.connection.close();
  console.log('=== ALL TESTS COMPLETE ===');
}

run().catch(console.error);

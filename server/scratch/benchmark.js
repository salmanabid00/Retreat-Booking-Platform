const axios = require('axios');
const { performance } = require('perf_hooks');

async function benchmark() {
  const BASE = 'http://localhost:5000';
  
  // Login to obtain tokens
  const adminLogin = await axios.post(BASE + '/api/auth/login', {
    email: 'admin@example.com',
    password: 'password123!A'
  });
  const adminToken = adminLogin.data.data.token;

  const customerLogin = await axios.post(BASE + '/api/auth/login', {
    email: 'customer@example.com',
    password: 'password123!A'
  });
  const customerToken = customerLogin.data.data.token;

  // Get a property ID
  const propsRes = await axios.get(BASE + '/api/properties?limit=1');
  const propertyId = propsRes.data.data[0]._id;

  const tests = [
    { name: 'GET /api/properties', url: BASE + '/api/properties', headers: {} },
    { name: 'GET /api/properties/:id', url: BASE + '/api/properties/' + propertyId, headers: {} },
    { name: 'GET /api/admin/bookings', url: BASE + '/api/admin/bookings', headers: { Authorization: 'Bearer ' + adminToken } },
    { name: 'GET /api/admin/properties', url: BASE + '/api/admin/properties', headers: { Authorization: 'Bearer ' + adminToken } },
    { name: 'GET /api/bookings/my-bookings', url: BASE + '/api/bookings/my-bookings', headers: { Authorization: 'Bearer ' + customerToken } }
  ];

  console.log('=== BASELINE PERFORMANCE BENCHMARK (10 iterations per endpoint) ===\n');

  const results = {};

  for (const test of tests) {
    const times = [];
    let payloadBytes = 0;

    // Warm-up request
    try {
      const warmup = await axios.get(test.url, { headers: test.headers });
      payloadBytes = JSON.stringify(warmup.data).length;
    } catch (e) {
      console.error('Error during warmup for ' + test.name, e.message);
    }

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      await axios.get(test.url, { headers: test.headers });
      const duration = performance.now() - start;
      times.push(duration);
    }

    const min = Math.min(...times).toFixed(2);
    const max = Math.max(...times).toFixed(2);
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);

    results[test.name] = { avg: parseFloat(avg), min: parseFloat(min), max: parseFloat(max), payloadBytes };
    console.log(`${test.name.padEnd(30)} -> Avg: ${avg.padStart(6)} ms | Min: ${min.padStart(6)} ms | Max: ${max.padStart(6)} ms | Payload: ~${payloadBytes} bytes`);
  }

  console.log('\nResults JSON:');
  console.log(JSON.stringify(results, null, 2));
}

benchmark().catch(console.error);

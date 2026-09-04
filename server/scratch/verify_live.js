const axios = require('axios');

const BASE = 'https://retreat-booking-platform-production.up.railway.app';

async function pollDeployment() {
  console.log('Polling Railway deployment to verify live commit...');

  for (let i = 1; i <= 15; i++) {
    try {
      // 1. Admin login
      const login = await axios.post(BASE + '/api/auth/login', {
        email: 'admin@example.com',
        password: 'password123!A',
      });
      const token = login.data.data.token;

      // 2. Test /api/admin/properties
      const propRes = await axios.get(BASE + '/api/admin/properties', {
        headers: { Authorization: 'Bearer ' + token },
      });

      if (propRes.status === 200 && propRes.data.success) {
        console.log(`[Attempt ${i}] DEPLOYMENT LIVE! /api/admin/properties returned 200 OK! Count: ${propRes.data.count}`);

        // Test all other routes
        const bookRes = await axios.get(BASE + '/api/admin/bookings', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const repRes = await axios.get(BASE + '/api/admin/reports', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const statsRes = await axios.get(BASE + '/api/admin/stats', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const usersRes = await axios.get(BASE + '/api/admin/users', {
          headers: { Authorization: 'Bearer ' + token },
        });

        console.log('\n======================================================');
        console.log('=== ALL 5 ADMIN MODULES VERIFIED LIVE ON RAILWAY ===');
        console.log('======================================================');
        console.log('1. /api/admin/stats      -> Status:', statsRes.status, 'Total Revenue: $' + statsRes.data.data.totalRevenue);
        console.log('2. /api/admin/users      -> Status:', usersRes.status, 'Users count:', usersRes.data.count || usersRes.data.data?.length);
        console.log('3. /api/admin/properties -> Status:', propRes.status, 'Properties count:', propRes.data.count);
        console.log('4. /api/admin/bookings   -> Status:', bookRes.status, 'Bookings count:', bookRes.data.count);
        console.log('5. /api/admin/reports    -> Status:', repRes.status, 'Property Types count:', repRes.data.data.propertyTypeBreakdown?.length);
        console.log('\nResponse Headers Sample (Cache-Control):', propRes.headers['cache-control']);
        return;
      }
    } catch (e) {
      console.log(`[Attempt ${i}] Waiting for redeploy... Status: ${e.response?.status || e.message}`);
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
}

pollDeployment();

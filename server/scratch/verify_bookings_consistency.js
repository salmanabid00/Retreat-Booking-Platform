const axios = require('axios');

async function verifyAdminBookings() {
  console.log('=== VERIFYING ADMIN BOOKINGS DATA CONSISTENCY ===\n');

  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@example.com',
    password: 'password123!A'
  });
  const token = loginRes.data.data.token;
  console.log('[1] Admin Login successful');

  const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const stats = statsRes.data.data;
  console.log('[2] Admin Stats:');
  console.log('    - Total Bookings:', stats.totalBookings);
  console.log('    - Confirmed Bookings:', stats.confirmedBookings);
  console.log('    - Pending Bookings:', stats.pendingBookings);
  console.log('    - Total Revenue: $' + stats.totalRevenue);

  const bookingsRes = await axios.get('http://localhost:5000/api/admin/bookings', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const bookings = bookingsRes.data.data;
  console.log('\n[3] Admin Bookings API returned', bookings.length, 'records');

  const confirmedList = bookings.filter(b => b.status === 'confirmed');
  const pendingList = bookings.filter(b => b.status === 'pending');
  const cancelledList = bookings.filter(b => b.status === 'cancelled');
  const confirmedSum = confirmedList.reduce((s, b) => s + b.totalPrice, 0);

  console.log('    - Table Total Count:', bookings.length);
  console.log('    - Table Confirmed Count:', confirmedList.length);
  console.log('    - Table Pending Count:', pendingList.length);
  console.log('    - Table Cancelled Count:', cancelledList.length);
  console.log('    - Table Confirmed Revenue: $' + confirmedSum);

  console.log('\n[4] Properties represented in bookings table:');
  bookings.forEach((b, idx) => {
    const propTitle = b.property ? b.property.title : 'N/A';
    const guestName = b.customer ? b.customer.name : 'N/A';
    console.log(`    ${idx + 1}. [${b.status.toUpperCase()}] Property: "${propTitle}" | Guest: "${guestName}" | Price: $${b.totalPrice}`);
  });

  const totalMatches = stats.totalBookings === bookings.length;
  const confirmedMatches = stats.confirmedBookings === confirmedList.length;
  const revenueMatches = stats.totalRevenue === confirmedSum;

  console.log('\n[5] Consistency Checks:');
  console.log('    - Total Bookings Count matches Stats:', totalMatches ? 'PASS' : 'FAIL');
  console.log('    - Confirmed Bookings Count matches Stats:', confirmedMatches ? 'PASS' : 'FAIL');
  console.log('    - Confirmed Revenue matches Stats:', revenueMatches ? 'PASS' : 'FAIL');

  if (totalMatches && confirmedMatches && revenueMatches) {
    console.log('\n>>> 100% DATA CONSISTENCY VERIFIED SUCCESSFULLY <<<');
  } else {
    console.error('\n>>> INCONSISTENCY DETECTED <<<');
    process.exit(1);
  }
}

verifyAdminBookings().catch(err => {
  console.error(err);
  process.exit(1);
});

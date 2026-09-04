const axios = require('axios');

async function debugBookingsPayload() {
  console.log('=== DEBUGGING ADMIN BOOKINGS API PAYLOAD ===\n');

  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'admin@example.com',
    password: 'password123!A'
  });
  const token = loginRes.data.data.token;

  const bookingsRes = await axios.get('http://localhost:5000/api/admin/bookings', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const bookings = bookingsRes.data.data;

  console.log('Total bookings returned:', bookings.length, '\n');

  bookings.forEach((b, idx) => {
    console.log(`--- Booking ${idx + 1} ---`);
    console.log('  _id:', b._id);
    console.log('  status:', b.status);
    console.log('  pricePerNight (booking field):', b.pricePerNight);
    console.log('  totalPrice:', b.totalPrice);
    console.log('  nights:', b.nights);
    console.log('  guests:', b.guests);
    console.log('  customer:', b.customer ? JSON.stringify({ name: b.customer.name, email: b.customer.email }) : 'NULL / NOT POPULATED');
    console.log('  property:', b.property ? JSON.stringify({
      title: b.property.title,
      pricePerNight: b.property.pricePerNight,
      images_count: b.property.images ? b.property.images.length : 0
    }) : 'NULL / NOT POPULATED');
    console.log();
  });
}

debugBookingsPayload().catch(err => {
  console.error('Error:', err.response ? err.response.data : err.message);
  process.exit(1);
});

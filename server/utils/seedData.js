const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/retreat_booking_db';
    console.log(`Connecting to MongoDB at: ${uri}`);
    await mongoose.connect(uri);
    console.log('[Seed DB Connected]');
  } catch (error) {
    console.error('[Seed DB Error]:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing all collections (Users, Properties, Bookings, Notifications, Conversations, Messages)...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log('Creating demo users (isVerified: true — no email verification needed)...');

    const customer = await User.create({
      name: 'Maya Lin (Customer)',
      email: 'customer@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      phone: '+1 (555) 234-5678',
      bio: 'Yoga enthusiast and retreat traveler seeking tranquil escapes.',
      isVerified: true,
    });

    const customer2 = await User.create({
      name: 'Julian Hayes',
      email: 'julian.hayes@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      phone: '+1 (555) 456-7890',
      bio: 'Nature photographer and weekend wellness traveler.',
      isVerified: true,
    });

    const owner = await User.create({
      name: 'Liam Vance (Owner)',
      email: 'owner@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      phone: '+1 (555) 987-6543',
      bio: 'Superhost specializing in eco-friendly luxury mountain cabins and beach sanctuaries.',
      isVerified: true,
    });

    const owner2 = await User.create({
      name: 'Sophia Bennett (Owner)',
      email: 'owner2@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
      phone: '+1 (555) 345-6789',
      bio: 'Architect & wellness retreat host in Bali and California.',
      isVerified: true,
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123!A',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      phone: '+1 (555) 000-1111',
      bio: 'Platform safety and system governance administrator.',
      isVerified: true,
    });

    console.log('Seeding Retreat Properties...');

    const [prop1, prop2, prop3, prop4] = await Property.create([
      {
        title: 'Serenity Ocean Villa & Yoga Deck',
        description: 'Perched on the cliffs of Big Sur with panoramic ocean vistas, private infinity meditation pool, and sunrise yoga pavilion. Features chef kitchen, sauna, and organic botanical garden.',
        propertyType: 'Villa',
        location: { city: 'Big Sur', state: 'CA', country: 'USA' },
        address: '47200 Highway 1, Big Sur, CA 93920',
        latitude: 36.2704,
        longitude: -121.8081,
        pricePerNight: 750,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 4,
        amenities: ['WiFi', 'Pool', 'Ocean View', 'Yoga Deck', 'Hot Tub', 'Sauna', 'Kitchen', 'Free Parking'],
        rules: ['No loud music after 10 PM', 'No smoking anywhere on premises'],
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200', public_id: 'villa_1' },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200', public_id: 'villa_2' }
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner._id,
        isApproved: true,
        rating: 4.95,
        numReviews: 28,
      },
      {
        title: 'Redwood Sanctuary Cabin & Spa',
        description: 'Nestled deep among ancient coastal redwoods, this architect-designed timber cabin offers total tranquility, cedar hot tub, indoor stone fireplace, and forest trail access.',
        propertyType: 'Cabin',
        location: { city: 'Mendocino', state: 'CA', country: 'USA' },
        address: '10500 Albion Ridge Rd, Mendocino, CA 95460',
        latitude: 39.3077,
        longitude: -123.7995,
        pricePerNight: 320,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Forest View', 'Kitchen', 'EV Charger'],
        rules: ['No pets inside without prior approval', 'Respect wildlife'],
        images: [
          { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200', public_id: 'cabin_1' },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'cabin_2' }
        ],
        checkInTime: '16:00',
        checkOutTime: '11:00',
        owner: owner._id,
        isApproved: true,
        rating: 4.9,
        numReviews: 19,
      },
      {
        title: 'Solstice Desert Eco Haven',
        description: 'Minimalist adobe sanctuary in the high desert with unobstructed stargazing, solar architecture, plunge pool, open-air firepit, and panoramic mountain backdrop.',
        propertyType: 'Resort',
        location: { city: 'Joshua Tree', state: 'CA', country: 'USA' },
        address: '62500 Sunburst Ave, Joshua Tree, CA 92252',
        latitude: 34.1347,
        longitude: -116.3131,
        pricePerNight: 480,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['WiFi', 'Plunge Pool', 'Stargazing Deck', 'Firepit', 'Solar Powered', 'AC'],
        rules: ['Desert conservation rules apply', 'No open flame during wind warnings'],
        images: [
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_1' },
          { url: 'https://images.unsplash.com/photo-1507038772120-7ffe76f79d68?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_2' }
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner2._id,
        isApproved: true,
        rating: 4.85,
        numReviews: 15,
      },
      {
        title: 'Alpine Glass Treehouse Haven',
        description: 'Luxury suspended treehouse tucked away in Aspen forest with floor-to-ceiling glass walls, heated floors, outdoor hot tub, and private ski storage.',
        propertyType: 'Treehouse',
        location: { city: 'Aspen', state: 'CO', country: 'USA' },
        address: '400 Red Mountain Rd, Aspen, CO 81611',
        latitude: 39.1911,
        longitude: -106.8175,
        pricePerNight: 520,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Mountain View', 'Heated Floors', 'Ski Storage'],
        rules: ['No pets allowed', 'Adults only (18+)'],
        images: [
          { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200', public_id: 'treehouse_1' },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'treehouse_2' }
        ],
        checkInTime: '14:00',
        checkOutTime: '10:00',
        owner: owner2._id,
        isApproved: true,
        rating: 4.95,
        numReviews: 31,
      }
    ]);

    console.log('Seeding Platform Bookings across all properties...');

    const today = new Date();
    const addDays = (d, n) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + n);
      return copy;
    };

    await Booking.create([
      // Property 1: Serenity Ocean Villa
      {
        customer: customer._id,
        property: prop1._id,
        checkInDate: addDays(today, 10),
        checkOutDate: addDays(today, 14),
        guests: 4,
        nights: 4,
        pricePerNight: prop1.pricePerNight,
        totalPrice: prop1.pricePerNight * 4,
        status: 'confirmed',
        specialRequest: 'Vegetarian welcome basket requested for yoga group.'
      },
      {
        customer: customer2._id,
        property: prop1._id,
        checkInDate: addDays(today, 20),
        checkOutDate: addDays(today, 22),
        guests: 2,
        nights: 2,
        pricePerNight: prop1.pricePerNight,
        totalPrice: prop1.pricePerNight * 2,
        status: 'pending',
        specialRequest: 'Arriving late around 8 PM.'
      },
      {
        customer: customer._id,
        property: prop1._id,
        checkInDate: addDays(today, -15),
        checkOutDate: addDays(today, -12),
        guests: 3,
        nights: 3,
        pricePerNight: prop1.pricePerNight,
        totalPrice: prop1.pricePerNight * 3,
        status: 'cancelled',
        specialRequest: 'Cancelled due to flight change.'
      },

      // Property 2: Redwood Sanctuary Cabin
      {
        customer: customer._id,
        property: prop2._id,
        checkInDate: addDays(today, 5),
        checkOutDate: addDays(today, 8),
        guests: 2,
        nights: 3,
        pricePerNight: prop2.pricePerNight,
        totalPrice: prop2.pricePerNight * 3,
        status: 'confirmed',
        specialRequest: 'Celebrating anniversary.'
      },
      {
        customer: customer2._id,
        property: prop2._id,
        checkInDate: addDays(today, 16),
        checkOutDate: addDays(today, 18),
        guests: 1,
        nights: 2,
        pricePerNight: prop2.pricePerNight,
        totalPrice: prop2.pricePerNight * 2,
        status: 'pending',
        specialRequest: 'Quiet solo writing retreat.'
      },

      // Property 3: Solstice Desert Eco Haven
      {
        customer: customer2._id,
        property: prop3._id,
        checkInDate: addDays(today, 12),
        checkOutDate: addDays(today, 15),
        guests: 4,
        nights: 3,
        pricePerNight: prop3.pricePerNight,
        totalPrice: prop3.pricePerNight * 3,
        status: 'confirmed',
        specialRequest: 'Stargazing telescope orientation requested.'
      },

      // Property 4: Alpine Glass Treehouse Haven
      {
        customer: customer._id,
        property: prop4._id,
        checkInDate: addDays(today, 25),
        checkOutDate: addDays(today, 28),
        guests: 2,
        nights: 3,
        pricePerNight: prop4.pricePerNight,
        totalPrice: prop4.pricePerNight * 3,
        status: 'confirmed',
        specialRequest: 'Early check-in if possible.'
      }
    ]);

    console.log('Database Seeded Successfully! All demo users and sample bookings are initialized.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();

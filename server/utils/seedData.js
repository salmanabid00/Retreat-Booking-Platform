const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Property = require('../models/Property');

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

    console.log('Clearing User and Property collections...');
    await User.deleteMany({});
    await Property.deleteMany({});

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
      bio: 'HavenHideaway Platform Administrator.',
      isVerified: true,
    });

    console.log('Seeding Retreat Properties...');

    await Property.create([
      {
        title: 'Redwood Sanctuary Cabin & Spa',
        description: 'Immerse yourself in towering ancient redwoods with panoramic mountain views. Features a private cedar hot tub, outdoor sauna, and wood-burning stone fireplace.',
        propertyType: 'Cabin',
        location: { city: 'Big Sur', state: 'CA', country: 'USA' },
        address: '84000 Highway 1, Big Sur, CA 93920',
        latitude: 36.2704,
        longitude: -121.8081,
        pricePerNight: 320,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['WiFi', 'Hot Tub', 'Sauna', 'Fireplace', 'Mountain View', 'Kitchen', 'Free Parking'],
        rules: ['No smoking indoors', 'Quiet hours after 10 PM', 'Pets allowed on request'],
        images: [
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'redwood_1' },
          { url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200', public_id: 'redwood_2' },
          { url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200', public_id: 'redwood_3' }
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner._id,
        isApproved: true,
        rating: 4.9,
        numReviews: 24,
      },
      {
        title: 'Serenity Ocean Villa & Yoga Deck',
        description: 'Exclusive beachfront sanctuary in Malibu with private beach access, infinity pool, floor-to-ceiling ocean views, and a dedicated sunset yoga deck.',
        propertyType: 'Villa',
        location: { city: 'Malibu', state: 'CA', country: 'USA' },
        address: '22000 Pacific Coast Highway, Malibu, CA 90265',
        latitude: 34.0259,
        longitude: -118.7798,
        pricePerNight: 750,
        maxGuests: 10,
        bedrooms: 5,
        bathrooms: 4,
        amenities: ['WiFi', 'Pool', 'Beachfront', 'Hot Tub', 'Yoga Deck', 'Chef Kitchen', 'Air Conditioning'],
        rules: ['No large parties', 'No smoking', 'Respect ocean wildlife'],
        images: [
          { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200', public_id: 'ocean_1' },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200', public_id: 'ocean_2' },
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200', public_id: 'ocean_3' }
        ],
        checkInTime: '16:00',
        checkOutTime: '10:00',
        owner: owner._id,
        isApproved: true,
        rating: 5.0,
        numReviews: 18,
      },
      {
        title: 'Solstice Desert Eco Haven',
        description: 'Architectural desert glamping sanctuary surrounded by Joshua trees and starry skies. Features a private stargazing deck, dip pool, and open-air rainfall shower.',
        propertyType: 'Glamping',
        location: { city: 'Joshua Tree', state: 'CA', country: 'USA' },
        address: '6200 Sunfair Rd, Joshua Tree, CA 92252',
        latitude: 34.1347,
        longitude: -116.3131,
        pricePerNight: 240,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Dip Pool', 'Stargazing Deck', 'Fire Pit', 'Air Conditioning', 'Kitchenette'],
        rules: ['No footwear indoors', 'Quiet desert hours after 9 PM'],
        images: [
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_1' },
          { url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_2' }
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

    console.log('Database Seeded Successfully! All demo users have isVerified: true.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();

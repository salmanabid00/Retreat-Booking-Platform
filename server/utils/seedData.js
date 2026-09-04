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

    console.log('Creating demo & expanded platform users...');

    // ── 1. REVIEWER DEMO ACCOUNTS (EXACT CREDENTIALS PRESERVED) ──────
    const customer1 = await User.create({
      name: 'Maya Lin (Customer)',
      email: 'customer@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 234-5678',
      bio: 'Yoga instructor and wellness retreat enthusiast seeking serene coastal and mountain sanctuaries.',
      isVerified: true,
    });

    const owner1 = await User.create({
      name: 'Liam Vance (Owner)',
      email: 'owner@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 987-6543',
      bio: 'Superhost specializing in eco-conscious luxury coastal villas and mountain spa cabins.',
      isVerified: true,
    });

    const owner2 = await User.create({
      name: 'Sophia Bennett (Owner)',
      email: 'owner2@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 345-6789',
      bio: 'Architect & retreat developer curating desert stargazing sanctuaries and high-altitude treehouses.',
      isVerified: true,
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123!A',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 000-1111',
      bio: 'Platform safety, booking dispute resolution, and listings governance administrator.',
      isVerified: true,
    });

    // ── 2. EXPANDED CUSTOMER BASE ────────────────────────────────────
    const customer2 = await User.create({
      name: 'Julian Hayes',
      email: 'julian.hayes@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 456-7890',
      bio: 'Nature landscape photographer and weekend wellness traveler focusing on Nordic retreats.',
      isVerified: true,
    });

    const customer3 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 678-1234',
      bio: 'Mindfulness meditation teacher and sound bath practitioner leading international group journeys.',
      isVerified: true,
    });

    const customer4 = await User.create({
      name: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
      phone: '+1 (555) 890-2345',
      bio: 'Tech founder seeking off-grid digital detox retreats, alpine hikes, and hot spring soaks.',
      isVerified: true,
    });

    const customer5 = await User.create({
      name: 'Chloé Dupont',
      email: 'chloe.dupont@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
      phone: '+33 6 12 34 56 78',
      bio: 'French travel journalist and botanical painter documenting restorative architecture.',
      isVerified: true,
    });

    const customer6 = await User.create({
      name: 'Zara Al-Mansoor',
      email: 'zara.mansoor@example.com',
      password: 'password123!A',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      phone: '+971 50 123 4567',
      bio: 'Architectural historian and vinyasa practitioner exploring eco-resorts worldwide.',
      isVerified: true,
    });

    // ── 3. EXPANDED HOST/OWNER BASE ──────────────────────────────────
    const owner3 = await User.create({
      name: 'Mateo Silva (Owner)',
      email: 'mateo.silva@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
      phone: '+351 912 345 678',
      bio: 'Sustainable architect designing off-grid coastal and desert retreats across Portugal and Latin America.',
      isVerified: true,
    });

    const owner4 = await User.create({
      name: 'Aoife Murphy (Owner)',
      email: 'aoife.murphy@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      phone: '+44 7700 900123',
      bio: 'Hospitality curator managing Nordic fjord lodges, Scottish Highland cottages, and Swiss chalets.',
      isVerified: true,
    });

    const owner5 = await User.create({
      name: 'Kenji Takahashi (Owner)',
      email: 'kenji.takahashi@example.com',
      password: 'password123!A',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
      phone: '+81 90 1234 5678',
      bio: 'Master carpenter and onsen retreat artisan restoring traditional ryokans and bamboo jungle sanctuaries.',
      isVerified: true,
    });

    console.log('Seeding 16 Realistic Luxury Retreat Properties...');

    // ── 4. PROPERTIES (16 DISTINCT LISTINGS SPREAD ACROSS 8 TYPES) ───
    const propertiesData = [
      // 1. Villa 1 (Big Sur, California) - Owner: Liam Vance
      {
        title: 'Serenity Ocean Villa & Yoga Deck',
        description: 'Perched high on the rugged cliffs of Big Sur with panoramic Pacific ocean vistas, private infinity meditation pool, and sunrise yoga pavilion. Features chef kitchen, cedar sauna, and organic botanical garden.',
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
        rules: ['No loud music after 10 PM', 'No smoking anywhere on premises', 'No pets without prior written approval'],
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200', public_id: 'villa_1' },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200', public_id: 'villa_2' },
          { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200', public_id: 'villa_3' },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', public_id: 'villa_4' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner1._id,
        isApproved: true,
        rating: 4.95,
        numReviews: 32,
      },

      // 2. Villa 2 (Algarve, Portugal) - Owner: Mateo Silva
      {
        title: 'Quinta do Mar Cliffside Villa',
        description: 'Suspended above golden limestone cliffs in the Algarve, this whitewashed sanctuary boasts an oceanfront infinity pool, terracotta terraces, and private beach path access. Unwind with Atlantic ocean breezes and sunset wine tastings.',
        propertyType: 'Villa',
        location: { city: 'Lagos', state: 'Faro', country: 'Portugal' },
        address: 'Estrada da Ponta da Piedade, 8600-544 Lagos, Portugal',
        latitude: 37.0818,
        longitude: -8.6728,
        pricePerNight: 620,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['WiFi', 'Pool', 'Ocean View', 'Terrace', 'Kitchen', 'Free Parking', 'Air Conditioning', 'Wine Cellar'],
        rules: ['Pool quiet hours after 10 PM', 'No glass containers near the pool', 'Adult-friendly retreat preferred'],
        images: [
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200', public_id: 'algarve_1' },
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200', public_id: 'algarve_2' },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200', public_id: 'algarve_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner3._id,
        isApproved: true,
        rating: 4.92,
        numReviews: 26,
      },

      // 3. Cabin 1 (Mendocino, California) - Owner: Liam Vance
      {
        title: 'Redwood Sanctuary Cabin & Spa',
        description: 'Nestled deep among ancient coastal redwoods, this architect-designed timber cabin offers total tranquility, cedar hot tub, indoor stone fireplace, and forest trail access. Experience rejuvenating forest bathing in peaceful seclusion.',
        propertyType: 'Cabin',
        location: { city: 'Mendocino', state: 'CA', country: 'USA' },
        address: '10500 Albion Ridge Rd, Mendocino, CA 95460',
        latitude: 39.3077,
        longitude: -123.7995,
        pricePerNight: 320,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Forest View', 'Kitchen', 'EV Charger', 'Heating'],
        rules: ['No pets inside without prior approval', 'Respect wildlife', 'Keep fire contained to stone hearth'],
        images: [
          { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200', public_id: 'cabin_1' },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'cabin_2' },
          { url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200', public_id: 'cabin_3' },
        ],
        checkInTime: '16:00',
        checkOutTime: '11:00',
        owner: owner1._id,
        isApproved: true,
        rating: 4.90,
        numReviews: 24,
      },

      // 4. Cabin 2 (Flam, Norway) - Owner: Aoife Murphy
      {
        title: 'Nordic Fjord Pine Cabin & Sauna',
        description: 'Hand-crafted from sustainable Nordic pine, this Scandinavian hideaway overlooks the mist-covered waters of Aurlandsfjord. Features a private wood-fired barrel sauna, stone hearth fireplace, and direct fjord kayak access.',
        propertyType: 'Cabin',
        location: { city: 'Flam', state: 'Vestland', country: 'Norway' },
        address: 'Nedre Brekkevegen 14, 5743 Flam, Norway',
        latitude: 60.8631,
        longitude: 7.1132,
        pricePerNight: 290,
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Sauna', 'Fireplace', 'Fjord View', 'Kitchen', 'Free Parking', 'Heating', 'Kayak'],
        rules: ['Sauna must be safely extinguished after use', 'Outdoor shoes off at entryway'],
        images: [
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'norway_1' },
          { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200', public_id: 'norway_2' },
          { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', public_id: 'norway_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner4._id,
        isApproved: true,
        rating: 4.96,
        numReviews: 19,
      },

      // 5. Cottage 1 (Isle of Skye, UK) - Owner: Aoife Murphy
      {
        title: 'Highland Heather Stone Cottage',
        description: 'A restored 19th-century croft cottage enveloped by purple heather hills and coastal lochs. Unwind by the crackling peat fireplace with a library of classic literature, antique copper soaking tub, and starry skies.',
        propertyType: 'Cottage',
        location: { city: 'Portree', state: 'Highlands', country: 'United Kingdom' },
        address: '14 Staffin Rd, Isle of Skye, IV51 9HW, UK',
        latitude: 57.4125,
        longitude: -6.1963,
        pricePerNight: 260,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Bathtub', 'Kitchen', 'Free Parking', 'Heating', 'Garden'],
        rules: ['No indoor smoking', 'Keep gate latched to prevent sheep roaming onto path'],
        images: [
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200', public_id: 'cottage_1' },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'cottage_2' },
          { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200', public_id: 'cottage_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '10:00',
        owner: owner4._id,
        isApproved: true,
        rating: 4.88,
        numReviews: 21,
      },

      // 6. Cottage 2 (Gordes, France) - Owner: Mateo Silva
      {
        title: 'Lavender Fields Provence Cottage',
        description: 'Tucked inside a centuries-old olive grove overlooking the Luberon Valley, this romantic stone cottage offers fragrant lavender gardens, private plunge pool, and shaded stone courtyards for morning espresso.',
        propertyType: 'Cottage',
        location: { city: 'Gordes', state: 'Provence', country: 'France' },
        address: 'Route de Sénanque, 84220 Gordes, France',
        latitude: 43.9125,
        longitude: 5.2001,
        pricePerNight: 310,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Plunge Pool', 'Garden', 'Kitchen', 'Air Conditioning', 'Free Parking', 'Terrace', 'BBQ Grill'],
        rules: ['Please respect the historic stone structures', 'Quiet hours after 10 PM'],
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200', public_id: 'provence_1' },
          { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200', public_id: 'provence_2' },
          { url: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&q=80&w=1200', public_id: 'provence_3' },
        ],
        checkInTime: '16:00',
        checkOutTime: '11:00',
        owner: owner3._id,
        isApproved: true,
        rating: 4.94,
        numReviews: 27,
      },

      // 7. Beachfront 1 (Malibu, California) - Owner: Liam Vance
      {
        title: 'Malibu Turquoise Beachfront Sanctuary',
        description: 'Architectural glass residence right on the sand with private tidal cove access, wraparound sundeck, and panoramic Pacific sunsets. Fall asleep to crashing waves and enjoy morning paddleboarding directly from your private staircase.',
        propertyType: 'Beachfront',
        location: { city: 'Malibu', state: 'CA', country: 'USA' },
        address: '22000 Pacific Coast Highway, Malibu, CA 90265',
        latitude: 34.0259,
        longitude: -118.7798,
        pricePerNight: 850,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['WiFi', 'Beach Access', 'Ocean View', 'Hot Tub', 'Chef Kitchen', 'EV Charger', 'Air Conditioning', 'Free Parking'],
        rules: ['No beach bonfires without permit', 'Rinse sand before entering residence', 'No events or commercial photo shoots'],
        images: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200', public_id: 'malibu_1' },
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200', public_id: 'malibu_2' },
          { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200', public_id: 'malibu_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner1._id,
        isApproved: true,
        rating: 4.98,
        numReviews: 35,
      },

      // 8. Beachfront 2 (Tulum, Mexico) - Owner: Sophia Bennett
      {
        title: 'Coral Bay Bohemian Beach Bungalow',
        description: 'Step directly onto powdery white Caribbean sands from your thatched palapa terrace. Features open-air artisan rain showers, woven hammocks beneath palm canopies, and private yoga mats for sunrise flow.',
        propertyType: 'Beachfront',
        location: { city: 'Tulum', state: 'Quintana Roo', country: 'Mexico' },
        address: 'Carretera Tulum-Boca Paila Km 7.5, 77780 Tulum, Mexico',
        latitude: 20.1583,
        longitude: -87.4589,
        pricePerNight: 390,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Beach Access', 'Ocean View', 'Hammocks', 'Yoga Deck', 'Kitchenette', 'Free Parking', 'Air Conditioning'],
        rules: ['Eco-conservation reserve: biodegradable sunscreen only', 'Footwear-free interior'],
        images: [
          { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', public_id: 'tulum_1' },
          { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', public_id: 'tulum_2' },
          { url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200', public_id: 'tulum_3' },
        ],
        checkInTime: '14:00',
        checkOutTime: '11:00',
        owner: owner2._id,
        isApproved: true,
        rating: 4.91,
        numReviews: 29,
      },

      // 9. Mountain Lodge 1 (Zermatt, Switzerland) - Owner: Aoife Murphy
      {
        title: 'Alpine Quartz Chalet & Spa',
        description: 'Ski-in / ski-out luxury chalet framed by dramatic Matterhorn views, floor-to-ceiling glass, and reclaimed cedar wood. Includes a private steam room, sunken outdoor whirlpool, and warm fireside lounge.',
        propertyType: 'Mountain Lodge',
        location: { city: 'Zermatt', state: 'Valais', country: 'Switzerland' },
        address: 'Winkelmattenweg 28, 3920 Zermatt, Switzerland',
        latitude: 45.9765,
        longitude: 7.7491,
        pricePerNight: 680,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ['WiFi', 'Hot Tub', 'Sauna', 'Ski Storage', 'Fireplace', 'Mountain View', 'Chef Kitchen', 'Heated Floors'],
        rules: ['Ski boots must be stored in heated locker room', 'No smoking anywhere inside'],
        images: [
          { url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&q=80&w=1200', public_id: 'zermatt_1' },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'zermatt_2' },
          { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', public_id: 'zermatt_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '10:00',
        owner: owner4._id,
        isApproved: true,
        rating: 4.97,
        numReviews: 38,
      },

      // 10. Mountain Lodge 2 (Queenstown, New Zealand) - Owner: Sophia Bennett
      {
        title: 'Wakatipu Vista Alpine Lodge',
        description: 'Perched high above Lake Wakatipu with sweeping vistas of the Remarkables mountain range. Features a cantilevered cedar hot tub, stone wood-burning fire pit, and gourmet kitchen for culinary evenings.',
        propertyType: 'Mountain Lodge',
        location: { city: 'Queenstown', state: 'Otago', country: 'New Zealand' },
        address: '88 Panorama Terrace, Queenstown 9300, New Zealand',
        latitude: -45.0312,
        longitude: 168.6626,
        pricePerNight: 540,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['WiFi', 'Hot Tub', 'Lake View', 'Mountain View', 'Fireplace', 'Kitchen', 'Free Parking', 'EV Charger'],
        rules: ['Respect quiet residential mountain zone after 10 PM', 'Fireplace damper instructions must be followed'],
        images: [
          { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200', public_id: 'queenstown_1' },
          { url: 'https://images.unsplash.com/photo-1507038772120-7ffe76f79d68?auto=format&fit=crop&q=80&w=1200', public_id: 'queenstown_2' },
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'queenstown_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner2._id,
        isApproved: true,
        rating: 4.93,
        numReviews: 22,
      },

      // 11. Glamping 1 (Joshua Tree, California) - Owner: Sophia Bennett
      {
        title: 'Solstice Desert Eco Haven',
        description: 'Minimalist adobe sanctuary in the high desert with unobstructed stargazing, solar architecture, plunge pool, open-air firepit, and panoramic mountain backdrop. Experience serene desert sunrises and silent night skies.',
        propertyType: 'Glamping',
        location: { city: 'Joshua Tree', state: 'CA', country: 'USA' },
        address: '62500 Sunburst Ave, Joshua Tree, CA 92252',
        latitude: 34.1347,
        longitude: -116.3131,
        pricePerNight: 240,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Plunge Pool', 'Stargazing Deck', 'Fire Pit', 'Solar Powered', 'Air Conditioning', 'Kitchenette'],
        rules: ['Desert conservation rules apply', 'No open flame during high wind advisory warnings', 'Dark Sky sanctuary: keep outdoor lights off after 10 PM'],
        images: [
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_1' },
          { url: 'https://images.unsplash.com/photo-1507038772120-7ffe76f79d68?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_2' },
          { url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200', public_id: 'desert_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner2._id,
        isApproved: true,
        rating: 4.89,
        numReviews: 20,
      },

      // 12. Glamping 2 (Sedona, Arizona) - Owner: Mateo Silva
      {
        title: 'Starlight Geodesic Dome & Cedar Bath',
        description: 'An off-grid geodesic dome nestled among Sedona red rock vortexes with a panoramic clear skylight for night sky viewing. Complete with a private outdoor cedar soaking tub, artisan firepit, and solar energy system.',
        propertyType: 'Glamping',
        location: { city: 'Sedona', state: 'AZ', country: 'USA' },
        address: '120 Red Rock Loop Rd, Sedona, AZ 86336',
        latitude: 34.8697,
        longitude: -111.761,
        pricePerNight: 195,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['WiFi', 'Stargazing Deck', 'Hot Tub', 'Fire Pit', 'Mountain View', 'Solar Powered', 'Free Parking', 'Air Conditioning'],
        rules: ['Adults-only retreat (21+)', 'Leave no trace on surrounding red rock trails'],
        images: [
          { url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200', public_id: 'sedona_1' },
          { url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200', public_id: 'sedona_2' },
          { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200', public_id: 'sedona_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner3._id,
        isApproved: true,
        rating: 4.90,
        numReviews: 17,
      },

      // 13. Treehouse 1 (Aspen, Colorado) - Owner: Sophia Bennett
      {
        title: 'Alpine Glass Treehouse Haven',
        description: 'Luxury suspended treehouse tucked away in Aspen forest with floor-to-ceiling glass walls, heated floors, outdoor cedar hot tub, and private ski storage. Enjoy panoramic snowy canopies in absolute privacy.',
        propertyType: 'Treehouse',
        location: { city: 'Aspen', state: 'CO', country: 'USA' },
        address: '400 Red Mountain Rd, Aspen, CO 81611',
        latitude: 39.1911,
        longitude: -106.8175,
        pricePerNight: 520,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Mountain View', 'Heated Floors', 'Ski Storage', 'Kitchen'],
        rules: ['No pets allowed due to suspended structural specs', 'Adults only (18+)'],
        images: [
          { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200', public_id: 'treehouse_1' },
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200', public_id: 'treehouse_2' },
          { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200', public_id: 'treehouse_3' },
        ],
        checkInTime: '14:00',
        checkOutTime: '10:00',
        owner: owner2._id,
        isApproved: true,
        rating: 4.95,
        numReviews: 31,
      },

      // 14. Treehouse 2 (Ubud, Bali) - Owner: Kenji Takahashi
      {
        title: 'Bamboo Canopy Zen Treehouse',
        description: 'Suspended over a sacred jungle river valley in Ubud, this two-story open-air bamboo treehouse features a private spring-fed plunge pool, swinging daybed, and soundtrack of tropical wildlife and river rapids.',
        propertyType: 'Treehouse',
        location: { city: 'Ubud', state: 'Bali', country: 'Indonesia' },
        address: 'Jl. Raya Sayan No. 88, Ubud, Gianyar, Bali 80571, Indonesia',
        latitude: -8.5069,
        longitude: 115.2625,
        pricePerNight: 275,
        maxGuests: 3,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['WiFi', 'Plunge Pool', 'Jungle View', 'Yoga Deck', 'Free Breakfast', 'Free Parking', 'Kitchenette', 'Hammock'],
        rules: ['Respect the natural jungle flora and fauna', 'No smoking within bamboo structure'],
        images: [
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'bali_1' },
          { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200', public_id: 'bali_2' },
          { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', public_id: 'bali_3' },
        ],
        checkInTime: '14:00',
        checkOutTime: '11:00',
        owner: owner5._id,
        isApproved: true,
        rating: 4.97,
        numReviews: 36,
      },

      // 15. Resort 1 (Kyoto, Japan) - Owner: Kenji Takahashi
      {
        title: 'Kyoto Moss Garden Onsen Sanctuary',
        description: 'An authentic ryokan-inspired wellness estate set amidst 300-year-old moss gardens and bamboo groves. Enjoy private geothermal mineral onsens, tatami tearooms, and kaiseki dining preparation pavilion.',
        propertyType: 'Resort',
        location: { city: 'Kyoto', state: 'Kansai', country: 'Japan' },
        address: 'Sagatenryuji Susukinobabacho, Ukyo Ward, Kyoto 616-8385, Japan',
        latitude: 35.0116,
        longitude: 135.6777,
        pricePerNight: 710,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['WiFi', 'Hot Spring Onsen', 'Zen Garden', 'Tea Room', 'Sauna', 'Breakfast Included', 'Free Parking', 'Heated Floors'],
        rules: ['Shoes removed in genkan entry', 'Proper traditional onsen bathing etiquette applies'],
        images: [
          { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200', public_id: 'kyoto_1' },
          { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200', public_id: 'kyoto_2' },
          { url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&q=80&w=1200', public_id: 'kyoto_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner5._id,
        isApproved: true,
        rating: 4.99,
        numReviews: 44,
      },

      // 16. Resort 2 (Arenal, Costa Rica) - Owner: Mateo Silva
      {
        title: 'Rainforest Eco-Lodge & Thermal Springs',
        description: 'Eco-certified luxury wellness estate at the base of Arenal Volcano surrounded by emerald rainforest. Immerse in private volcanic hot spring pools, guided birdwatching trails, and an open-air yoga shala.',
        propertyType: 'Resort',
        location: { city: 'La Fortuna', state: 'Alajuela', country: 'Costa Rica' },
        address: 'Camino al Volcán Arenal, 21007 La Fortuna, Costa Rica',
        latitude: 10.4678,
        longitude: -84.6427,
        pricePerNight: 440,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['WiFi', 'Thermal Pool', 'Volcano View', 'Spa', 'Yoga Shala', 'Kitchen', 'Free Parking', 'Guided Trails'],
        rules: ['Eco-conservation reserve: no single-use plastics', 'Stay on designated rainforest boardwalks'],
        images: [
          { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', public_id: 'costarica_1' },
          { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', public_id: 'costarica_2' },
          { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', public_id: 'costarica_3' },
        ],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        owner: owner3._id,
        isApproved: true,
        rating: 4.93,
        numReviews: 28,
      }
    ];

    const createdProperties = await Property.create(propertiesData);
    console.log(`Successfully created ${createdProperties.length} luxury retreat properties.`);

    // ── 5. SEEDING REALISTIC PLATFORM BOOKINGS ────────────────────────
    console.log('Seeding 18 realistic platform bookings with verified status distribution...');

    const today = new Date();
    const addDays = (d, n) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + n);
      return copy;
    };

    const bookingsToSeed = [
      // 1. Serenity Ocean Villa (Maya Lin) - Confirmed Upcoming
      {
        customer: customer1._id,
        property: createdProperties[0]._id,
        checkInDate: addDays(today, 12),
        checkOutDate: addDays(today, 16),
        guests: 4,
        nights: 4,
        pricePerNight: createdProperties[0].pricePerNight,
        totalPrice: createdProperties[0].pricePerNight * 4,
        status: 'confirmed',
        specialRequest: 'Vegetarian organic welcome basket requested for yoga group.',
      },

      // 2. Serenity Ocean Villa (Julian Hayes) - Pending Host Review
      {
        customer: customer2._id,
        property: createdProperties[0]._id,
        checkInDate: addDays(today, 25),
        checkOutDate: addDays(today, 28),
        guests: 2,
        nights: 3,
        pricePerNight: createdProperties[0].pricePerNight,
        totalPrice: createdProperties[0].pricePerNight * 3,
        status: 'pending',
        specialRequest: 'Arriving late in evening around 8:30 PM.',
      },

      // 3. Serenity Ocean Villa (Elena Rostova) - Completed Past Stay
      {
        customer: customer3._id,
        property: createdProperties[0]._id,
        checkInDate: addDays(today, -45),
        checkOutDate: addDays(today, -40),
        guests: 6,
        nights: 5,
        pricePerNight: createdProperties[0].pricePerNight,
        totalPrice: createdProperties[0].pricePerNight * 5,
        status: 'completed',
        specialRequest: 'Private meditation session setup on the yoga deck.',
      },

      // 4. Quinta do Mar Cliffside Villa (Chloé Dupont) - Confirmed Upcoming
      {
        customer: customer5._id,
        property: createdProperties[1]._id,
        checkInDate: addDays(today, 18),
        checkOutDate: addDays(today, 23),
        guests: 4,
        nights: 5,
        pricePerNight: createdProperties[1].pricePerNight,
        totalPrice: createdProperties[1].pricePerNight * 5,
        status: 'confirmed',
        specialRequest: 'Local Portuguese wine recommendation list.',
      },

      // 5. Redwood Sanctuary Cabin (Marcus Chen) - Completed Past Stay
      {
        customer: customer4._id,
        property: createdProperties[2]._id,
        checkInDate: addDays(today, -30),
        checkOutDate: addDays(today, -26),
        guests: 2,
        nights: 4,
        pricePerNight: createdProperties[2].pricePerNight,
        totalPrice: createdProperties[2].pricePerNight * 4,
        status: 'completed',
        specialRequest: 'Extra firewood for the stone hearth.',
      },

      // 6. Redwood Sanctuary Cabin (Maya Lin) - Confirmed Upcoming
      {
        customer: customer1._id,
        property: createdProperties[2]._id,
        checkInDate: addDays(today, 7),
        checkOutDate: addDays(today, 10),
        guests: 2,
        nights: 3,
        pricePerNight: createdProperties[2].pricePerNight,
        totalPrice: createdProperties[2].pricePerNight * 3,
        status: 'confirmed',
        specialRequest: 'Celebrating wedding anniversary.',
      },

      // 7. Nordic Fjord Pine Cabin (Julian Hayes) - Confirmed Upcoming
      {
        customer: customer2._id,
        property: createdProperties[3]._id,
        checkInDate: addDays(today, 15),
        checkOutDate: addDays(today, 20),
        guests: 2,
        nights: 5,
        pricePerNight: createdProperties[3].pricePerNight,
        totalPrice: createdProperties[3].pricePerNight * 5,
        status: 'confirmed',
        specialRequest: 'Photography excursion tips for sunrise fjord mist.',
      },

      // 8. Highland Heather Stone Cottage (Zara Al-Mansoor) - Completed Past Stay
      {
        customer: customer6._id,
        property: createdProperties[4]._id,
        checkInDate: addDays(today, -60),
        checkOutDate: addDays(today, -56),
        guests: 2,
        nights: 4,
        pricePerNight: createdProperties[4].pricePerNight,
        totalPrice: createdProperties[4].pricePerNight * 4,
        status: 'completed',
        specialRequest: 'Highland trail maps and walking sticks.',
      },

      // 9. Lavender Fields Provence Cottage (Elena Rostova) - Confirmed Upcoming
      {
        customer: customer3._id,
        property: createdProperties[5]._id,
        checkInDate: addDays(today, 30),
        checkOutDate: addDays(today, 35),
        guests: 3,
        nights: 5,
        pricePerNight: createdProperties[5].pricePerNight,
        totalPrice: createdProperties[5].pricePerNight * 5,
        status: 'confirmed',
        specialRequest: 'Dietary preference: gluten-free breakfast items.',
      },

      // 10. Malibu Turquoise Beachfront (Marcus Chen) - Confirmed Upcoming
      {
        customer: customer4._id,
        property: createdProperties[6]._id,
        checkInDate: addDays(today, 40),
        checkOutDate: addDays(today, 44),
        guests: 4,
        nights: 4,
        pricePerNight: createdProperties[6].pricePerNight,
        totalPrice: createdProperties[6].pricePerNight * 4,
        status: 'confirmed',
        specialRequest: 'EV charger adapter compatibility question.',
      },

      // 11. Coral Bay Bohemian Beach Bungalow (Chloé Dupont) - Completed Past Stay
      {
        customer: customer5._id,
        property: createdProperties[7]._id,
        checkInDate: addDays(today, -20),
        checkOutDate: addDays(today, -16),
        guests: 2,
        nights: 4,
        pricePerNight: createdProperties[7].pricePerNight,
        totalPrice: createdProperties[7].pricePerNight * 4,
        status: 'completed',
        specialRequest: 'Snorkeling gear requested.',
      },

      // 12. Alpine Quartz Chalet & Spa (Zara Al-Mansoor) - Confirmed Upcoming
      {
        customer: customer6._id,
        property: createdProperties[8]._id,
        checkInDate: addDays(today, 50),
        checkOutDate: addDays(today, 55),
        guests: 6,
        nights: 5,
        pricePerNight: createdProperties[8].pricePerNight,
        totalPrice: createdProperties[8].pricePerNight * 5,
        status: 'confirmed',
        specialRequest: 'Ski pass concierge assistance.',
      },

      // 13. Wakatipu Vista Alpine Lodge (Julian Hayes) - Pending Host Review
      {
        customer: customer2._id,
        property: createdProperties[9]._id,
        checkInDate: addDays(today, 22),
        checkOutDate: addDays(today, 26),
        guests: 3,
        nights: 4,
        pricePerNight: createdProperties[9].pricePerNight,
        totalPrice: createdProperties[9].pricePerNight * 4,
        status: 'pending',
        specialRequest: 'Early check-in around 1 PM if cleaning permits.',
      },

      // 14. Solstice Desert Eco Haven (Maya Lin) - Cancelled by Guest
      {
        customer: customer1._id,
        property: createdProperties[10]._id,
        checkInDate: addDays(today, -10),
        checkOutDate: addDays(today, -7),
        guests: 2,
        nights: 3,
        pricePerNight: createdProperties[10].pricePerNight,
        totalPrice: createdProperties[10].pricePerNight * 3,
        status: 'cancelled',
        specialRequest: 'Cancelled due to flight schedule rescheduling.',
      },

      // 15. Starlight Geodesic Dome (Marcus Chen) - Completed Past Stay
      {
        customer: customer4._id,
        property: createdProperties[11]._id,
        checkInDate: addDays(today, -15),
        checkOutDate: addDays(today, -13),
        guests: 2,
        nights: 2,
        pricePerNight: createdProperties[11].pricePerNight,
        totalPrice: createdProperties[11].pricePerNight * 2,
        status: 'completed',
        specialRequest: 'Stargazing telescope orientation.',
      },

      // 16. Alpine Glass Treehouse (Elena Rostova) - Confirmed Upcoming
      {
        customer: customer3._id,
        property: createdProperties[12]._id,
        checkInDate: addDays(today, 14),
        checkOutDate: addDays(today, 17),
        guests: 2,
        nights: 3,
        pricePerNight: createdProperties[12].pricePerNight,
        totalPrice: createdProperties[12].pricePerNight * 3,
        status: 'confirmed',
        specialRequest: 'Extra down pillows and heated blanket.',
      },

      // 17. Bamboo Canopy Zen Treehouse (Zara Al-Mansoor) - Pending Host Review
      {
        customer: customer6._id,
        property: createdProperties[13]._id,
        checkInDate: addDays(today, 35),
        checkOutDate: addDays(today, 40),
        guests: 2,
        nights: 5,
        pricePerNight: createdProperties[13].pricePerNight,
        totalPrice: createdProperties[13].pricePerNight * 5,
        status: 'pending',
        specialRequest: 'Traditional Balinese floral bath preparation.',
      },

      // 18. Kyoto Moss Garden Onsen Sanctuary (Maya Lin) - Confirmed Upcoming
      {
        customer: customer1._id,
        property: createdProperties[14]._id,
        checkInDate: addDays(today, 60),
        checkOutDate: addDays(today, 65),
        guests: 4,
        nights: 5,
        pricePerNight: createdProperties[14].pricePerNight,
        totalPrice: createdProperties[14].pricePerNight * 5,
        status: 'confirmed',
        specialRequest: 'Traditional Japanese tea ceremony arrangement.',
      },
    ];

    const createdBookings = await Booking.create(bookingsToSeed);
    console.log(`Successfully created ${createdBookings.length} realistic bookings across the platform.`);

    console.log('\n======================================================');
    console.log(' SEEDING COMPLETE SUMMARY:');
    console.log(' - Users created:', (await User.countDocuments()));
    console.log(' - Properties created:', createdProperties.length);
    console.log(' - Bookings created:', createdBookings.length);
    console.log('   * Confirmed bookings:', createdBookings.filter((b) => b.status === 'confirmed').length);
    console.log('   * Completed bookings:', createdBookings.filter((b) => b.status === 'completed').length);
    console.log('   * Pending bookings:', createdBookings.filter((b) => b.status === 'pending').length);
    console.log('   * Cancelled bookings:', createdBookings.filter((b) => b.status === 'cancelled').length);
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();

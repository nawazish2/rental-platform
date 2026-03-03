require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const Visit = require('../models/Visit');
const SupportTicket = require('../models/SupportTicket');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Visit.deleteMany({}),
    SupportTicket.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin',
    phone: '+91-9000000001',
  });

  const tenant1 = await User.create({
    name: 'Rahul Sharma',
    email: 'tenant@demo.com',
    password: 'demo123',
    role: 'tenant',
    phone: '+91-9000000002',
  });

  const tenant2 = await User.create({
    name: 'Priya Patel',
    email: 'tenant2@demo.com',
    password: 'demo123',
    role: 'tenant',
    phone: '+91-9000000003',
  });

  console.log('Users created');

  // Create properties
  const propertyData = [
    {
      title: 'Modern 2BHK in Bandra West',
      description: 'Spacious 2BHK apartment with sea view, fully furnished with premium appliances. Located in the heart of Bandra, walking distance to shopping and dining.',
      location: 'Bandra West, Mumbai',
      city: 'Mumbai',
      price: 55000,
      type: '2BHK',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: ['WiFi', 'Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup'],
      rules: ['No Pets', 'No Smoking', 'No Loud Music after 10pm'],
      availableFrom: new Date('2026-03-01'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Cozy Studio in Koramangala',
      description: 'Well-maintained studio apartment perfect for working professionals. Close to major IT companies and cafes.',
      location: 'Koramangala, Bangalore',
      city: 'Bangalore',
      price: 22000,
      type: 'Studio',
      images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
      amenities: ['WiFi', 'AC', 'Security', 'Laundry'],
      rules: ['No Pets', 'Working Professionals Only'],
      availableFrom: new Date('2026-03-10'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Luxury 3BHK Villa in Jubilee Hills',
      description: 'Premium 3BHK villa with private garden, modular kitchen, and premium interiors. Gated community with 24/7 security.',
      location: 'Jubilee Hills, Hyderabad',
      city: 'Hyderabad',
      price: 85000,
      type: '3BHK',
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
      amenities: ['Private Garden', 'Parking x2', 'Gym', 'Club House', 'Kids Play Area', 'WiFi', 'Power Backup'],
      rules: ['Family Only', 'No Smoking', 'No Pets'],
      availableFrom: new Date('2026-04-01'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Affordable 1BHK in Andheri East',
      description: 'Budget-friendly 1BHK near metro station. Ideal for single professionals or couples.',
      location: 'Andheri East, Mumbai',
      city: 'Mumbai',
      price: 28000,
      type: '1BHK',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      amenities: ['WiFi', 'Security', 'Lift'],
      rules: ['No Smoking'],
      availableFrom: new Date('2026-03-15'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Premium 2BHK in HSR Layout',
      description: 'Semi-furnished 2BHK in premium society. Ample parking and green surroundings.',
      location: 'HSR Layout, Bangalore',
      city: 'Bangalore',
      price: 38000,
      type: '2BHK',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
      amenities: ['Parking', 'Security', 'Gym', 'WiFi', 'Power Backup'],
      rules: ['No Pets', 'No Smoking', 'Families Preferred'],
      availableFrom: new Date('2026-03-20'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Spacious Villa in Whitefield',
      description: 'Independent 4BHK villa with terrace garden. Perfect for large families.',
      location: 'Whitefield, Bangalore',
      city: 'Bangalore',
      price: 75000,
      type: 'Villa',
      images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
      amenities: ['Private Parking', 'Terrace Garden', 'Gym', 'Swimming Pool', 'Solar Panels'],
      rules: ['Family Only', 'No Parties'],
      availableFrom: new Date('2026-04-15'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: '3BHK in Powai with Lake View',
      description: 'Beautiful lake-facing 3BHK in premium society. Well-connected to IT corridors.',
      location: 'Powai, Mumbai',
      city: 'Mumbai',
      price: 65000,
      type: '3BHK',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      amenities: ['Lake View', 'Gym', 'Swimming Pool', 'Parking', 'Concierge', 'WiFi'],
      rules: ['No Smoking', 'No Loud Parties'],
      availableFrom: new Date('2026-03-25'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: '1BHK Studio in Indiranagar',
      description: 'Modern studio apartment in the trendy Indiranagar locality. Cafes and pubs at doorstep.',
      location: 'Indiranagar, Bangalore',
      city: 'Bangalore',
      price: 25000,
      type: '1BHK',
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
      amenities: ['WiFi', 'AC', 'Security', 'Lift'],
      rules: ['Working Professionals', 'No Smoking Inside'],
      availableFrom: new Date('2026-03-01'),
      status: 'published',
      createdBy: admin._id,
    },
    {
      title: 'Newly Built 2BHK in Gachibowli',
      description: 'Brand new 2BHK in IT hub. Modular kitchen, vitrified flooring, and great ventilation.',
      location: 'Gachibowli, Hyderabad',
      city: 'Hyderabad',
      price: 32000,
      type: '2BHK',
      images: ['https://images.unsplash.com/photo-1617104678098-de229db51175?w=800'],
      amenities: ['Parking', 'Gym', 'Children Play Area', 'WiFi', 'CCTV'],
      rules: ['No Smoking', 'No Pets'],
      availableFrom: new Date('2026-03-10'),
      status: 'review',
      createdBy: admin._id,
    },
    {
      title: 'Heritage Apartment in South Delhi',
      description: 'Classic apartment in posh South Delhi colony. Close to markets and schools.',
      location: 'Greater Kailash, Delhi',
      city: 'Delhi',
      price: 48000,
      type: '2BHK',
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      amenities: ['Parking', 'Security', 'Garden', 'Power Backup'],
      rules: ['Family Only', 'No Smoking', 'No Pets'],
      availableFrom: new Date('2026-04-01'),
      status: 'published',
      createdBy: admin._id,
    },
  ];

  const properties = await Property.insertMany(propertyData);
  console.log(`${properties.length} properties created`);

  // Create sample visits
  await Visit.insertMany([
    {
      property: properties[0]._id,
      tenant: tenant1._id,
      status: 'scheduled',
      preferredDate: new Date('2026-03-10'),
      scheduledDate: new Date('2026-03-12'),
      notes: 'I want to check the sea view from balcony',
      adminNotes: 'Confirmed for 11 AM',
    },
    {
      property: properties[1]._id,
      tenant: tenant1._id,
      status: 'requested',
      preferredDate: new Date('2026-03-15'),
      notes: 'Looking for something close to office',
    },
    {
      property: properties[2]._id,
      tenant: tenant2._id,
      status: 'visited',
      preferredDate: new Date('2026-03-05'),
      scheduledDate: new Date('2026-03-06'),
    },
    {
      property: properties[4]._id,
      tenant: tenant2._id,
      status: 'decision_pending',
      preferredDate: new Date('2026-03-08'),
      scheduledDate: new Date('2026-03-09'),
    },
  ]);
  console.log('Sample visits created');

  // Create sample support tickets
  await SupportTicket.insertMany([
    {
      property: properties[0]._id,
      raisedBy: tenant1._id,
      subject: 'AC not working in bedroom',
      category: 'maintenance',
      messages: [
        { sender: tenant1._id, senderRole: 'tenant', text: 'The AC in the master bedroom has not been working since yesterday. Please send someone to fix it.', createdAt: new Date() },
      ],
      status: 'open',
    },
    {
      property: properties[2]._id,
      raisedBy: tenant2._id,
      subject: 'Query about move-in date',
      category: 'move-in',
      messages: [
        { sender: tenant2._id, senderRole: 'tenant', text: 'Can we move in a week earlier than the listed date?', createdAt: new Date() },
        { sender: admin._id, senderRole: 'admin', text: 'We will check with the owner and revert within 24 hours.', createdAt: new Date() },
      ],
      status: 'in_progress',
    },
  ]);
  console.log('Sample support tickets created');

  console.log('\n✅ Seed completed!');
  console.log('Demo credentials:');
  console.log('  Admin   — admin@demo.com  / demo123');
  console.log('  Tenant1 — tenant@demo.com / demo123');
  console.log('  Tenant2 — tenant2@demo.com / demo123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

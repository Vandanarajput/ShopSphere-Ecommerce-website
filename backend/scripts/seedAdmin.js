require('dotenv').config();
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

(async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ email: 'admin@shopsphere.com' });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@shopsphere.com',
      password: 'Admin@123',
      role: 'admin',
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@shopsphere.com');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();

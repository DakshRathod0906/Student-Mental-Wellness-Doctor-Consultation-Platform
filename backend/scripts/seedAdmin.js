const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables from backend directory
dotenv.config({ path: '../.env' }); // Check parent dir .env if run inside scripts
dotenv.config(); // fallback to current dir .env

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    const adminEmail = 'dakshra0906@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    // Create the admin user
    const adminUser = new User({
      role: 'admin',
      email: adminEmail,
      passwordHash: 'admin123', // Password gets hashed pre-save
      firstName: 'Admin',
      lastName: 'Platform',
      phoneNumber: '0000000000',
      status: 'active',
      isEmailVerified: true
    });

    await adminUser.save();

    console.log('\n=============================================');
    console.log('ADMIN USER CREATED SUCCESSFULLY');
    console.log('=============================================');
    console.log(`Email:    ${adminEmail}`);
    console.log('Password: admin123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();

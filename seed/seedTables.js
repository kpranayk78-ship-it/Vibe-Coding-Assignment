require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Table = require('../models/Table');

const seedTables = async () => {
  try {
    // 1. Connect to MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // 2. Delete all existing tables to avoid duplicates
    await Table.deleteMany({});
    console.log('All existing tables deleted.');

    // 3. Insert a few tables with fixed capacities
    const tablesToInsert = [
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 2 },
      { tableNumber: 3, capacity: 4 },
      { tableNumber: 4, capacity: 4 },
      { tableNumber: 5, capacity: 6 },
      { tableNumber: 6, capacity: 8 },
    ];
    
    await Table.insertMany(tablesToInsert);
    
    // 4. Print success message
    console.log('Successfully seeded database with new tables!');
    
    // 5. Exit
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedTables();
// import * as mongoose from 'mongoose';
// import { Item } from '../modules/items/schemas/item.schema';

// const uri = 'mongodb://localhost:27017/restaurant_db';

// // Items to seed
// const items = [
//   {
//     title: 'Pizza Margherita',
//     description: 'Classic pizza with tomatoes and mozzarella',
//     price: 12.99,
//   },
//   {
//     title: 'Spaghetti Carbonara',
//     description: 'Creamy pasta with pancetta and Parmesan',
//     price: 14.99,
//   },
//   {
//     title: 'Caesar Salad',
//     description: 'Fresh salad with Caesar dressing and croutons',
//     price: 9.99,
//   },
// ];

// async function seedDatabase() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(uri);

//     console.log('Connected to MongoDB');

//     // Drop the collection if it exists
//     // await ItemModel.deleteMany({});
//     // console.log('Cleared existing items');

//     // Insert the items
//     await Item.insertMany(items);
//     console.log('Items seeded successfully');
//   } catch (error) {
//     console.error('Error seeding database:', error);
//   } finally {
//     // Close the MongoDB connection
//     await mongoose.disconnect();
//     console.log('Disconnected from MongoDB');
//   }
// }

// seedDatabase();

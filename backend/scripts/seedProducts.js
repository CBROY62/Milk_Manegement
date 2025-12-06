const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk';

const products = [
  // Cow Milk Products
  {
    name: 'Cow Milk 500ml',
    type: 'cow_milk',
    description: 'Fresh cow milk, 500ml pack',
    priceB2C: 30,
    priceB2B: 25,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Cow Milk 1 Liter',
    type: 'cow_milk',
    description: 'Fresh cow milk, 1 liter pack',
    priceB2C: 55,
    priceB2B: 48,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Cow Milk 2 Liters',
    type: 'cow_milk',
    description: 'Fresh cow milk, 2 liters pack',
    priceB2C: 105,
    priceB2B: 90,
    stock: 100,
    unit: 'liter'
  },
  // Buffalo Milk Products
  {
    name: 'Buffalo Milk 500ml',
    type: 'buffalo_milk',
    description: 'Fresh buffalo milk, 500ml pack',
    priceB2C: 35,
    priceB2B: 30,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Buffalo Milk 1 Liter',
    type: 'buffalo_milk',
    description: 'Fresh buffalo milk, 1 liter pack',
    priceB2C: 65,
    priceB2B: 55,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Buffalo Milk 2 Liters',
    type: 'buffalo_milk',
    description: 'Fresh buffalo milk, 2 liters pack',
    priceB2C: 125,
    priceB2B: 105,
    stock: 100,
    unit: 'liter'
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('✅ Cleared existing products');

    // Insert products
    for (const productData of products) {
      const existingProduct = await Product.findOne({ 
        name: productData.name,
        type: productData.type 
      });

      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.name}`);
      } else {
        console.log(`⏭️  Product already exists: ${productData.name}`);
      }
    }

    console.log('✅ Product seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();


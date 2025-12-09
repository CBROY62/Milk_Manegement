const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk';

const additionalProducts = [
  // Buffalo Milk Variants (10 products)
  // Full Cream Buffalo Milk
  {
    name: 'Full Cream Buffalo Milk 500ml',
    type: 'buffalo_milk',
    variant: 'full_cream',
    fatContent: 7.0,
    description: 'Rich and creamy full cream buffalo milk with high fat content, 500ml pack',
    priceB2C: 40,
    priceB2B: 35,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Full Cream Buffalo Milk 1 Liter',
    type: 'buffalo_milk',
    variant: 'full_cream',
    fatContent: 7.0,
    description: 'Rich and creamy full cream buffalo milk with high fat content, 1 liter pack',
    priceB2C: 75,
    priceB2B: 65,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Full Cream Buffalo Milk 2 Liters',
    type: 'buffalo_milk',
    variant: 'full_cream',
    fatContent: 7.0,
    description: 'Rich and creamy full cream buffalo milk with high fat content, 2 liters pack',
    priceB2C: 145,
    priceB2B: 125,
    stock: 100,
    unit: 'liter'
  },
  // Standardized Buffalo Milk
  {
    name: 'Standardized Buffalo Milk 500ml',
    type: 'buffalo_milk',
    variant: 'standardized',
    fatContent: 5.0,
    description: 'Standardized buffalo milk with fixed 5% fat content, 500ml pack',
    priceB2C: 37,
    priceB2B: 32,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Standardized Buffalo Milk 1 Liter',
    type: 'buffalo_milk',
    variant: 'standardized',
    fatContent: 5.0,
    description: 'Standardized buffalo milk with fixed 5% fat content, 1 liter pack',
    priceB2C: 70,
    priceB2B: 60,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Standardized Buffalo Milk 2 Liters',
    type: 'buffalo_milk',
    variant: 'standardized',
    fatContent: 5.0,
    description: 'Standardized buffalo milk with fixed 5% fat content, 2 liters pack',
    priceB2C: 135,
    priceB2B: 115,
    stock: 100,
    unit: 'liter'
  },
  // Toned Buffalo Milk
  {
    name: 'Toned Buffalo Milk 500ml',
    type: 'buffalo_milk',
    variant: 'toned',
    fatContent: 3.5,
    description: 'Toned buffalo milk with 3.5% fat content, perfect balance of taste and health, 500ml pack',
    priceB2C: 35,
    priceB2B: 30,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Toned Buffalo Milk 1 Liter',
    type: 'buffalo_milk',
    variant: 'toned',
    fatContent: 3.5,
    description: 'Toned buffalo milk with 3.5% fat content, perfect balance of taste and health, 1 liter pack',
    priceB2C: 65,
    priceB2B: 55,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Toned Buffalo Milk 2 Liters',
    type: 'buffalo_milk',
    variant: 'toned',
    fatContent: 3.5,
    description: 'Toned buffalo milk with 3.5% fat content, perfect balance of taste and health, 2 liters pack',
    priceB2C: 125,
    priceB2B: 105,
    stock: 100,
    unit: 'liter'
  },
  // Double Toned Buffalo Milk
  {
    name: 'Double Toned Buffalo Milk 1 Liter',
    type: 'buffalo_milk',
    variant: 'double_toned',
    fatContent: 2.0,
    description: 'Double toned buffalo milk with 2% fat content, low fat option, 1 liter pack',
    priceB2C: 60,
    priceB2B: 50,
    stock: 100,
    unit: 'liter'
  },
  // Cow Milk Additional Sizes (5 products)
  // Full Cream Cow Milk - Additional Sizes
  {
    name: 'Full Cream Cow Milk 250ml',
    type: 'cow_milk',
    variant: 'full_cream',
    fatContent: 6.0,
    description: 'Rich and creamy full cream cow milk with high fat content, convenient 250ml pack',
    priceB2C: 20,
    priceB2B: 17,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Full Cream Cow Milk 5 Liters',
    type: 'cow_milk',
    variant: 'full_cream',
    fatContent: 6.0,
    description: 'Rich and creamy full cream cow milk with high fat content, family pack 5 liters',
    priceB2C: 300,
    priceB2B: 250,
    stock: 100,
    unit: 'liter'
  },
  // Standardized Cow Milk - Additional Sizes
  {
    name: 'Standardized Cow Milk 250ml',
    type: 'cow_milk',
    variant: 'standardized',
    fatContent: 4.5,
    description: 'Standardized cow milk with fixed 4.5% fat content, convenient 250ml pack',
    priceB2C: 18,
    priceB2B: 15,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Standardized Cow Milk 5 Liters',
    type: 'cow_milk',
    variant: 'standardized',
    fatContent: 4.5,
    description: 'Standardized cow milk with fixed 4.5% fat content, family pack 5 liters',
    priceB2C: 280,
    priceB2B: 230,
    stock: 100,
    unit: 'liter'
  },
  // Toned Cow Milk - Additional Size
  {
    name: 'Toned Cow Milk 5 Liters',
    type: 'cow_milk',
    variant: 'toned',
    fatContent: 3.0,
    description: 'Toned cow milk with 3% fat content, perfect balance of taste and health, family pack 5 liters',
    priceB2C: 260,
    priceB2B: 220,
    stock: 100,
    unit: 'liter'
  },
  // Buffalo Milk Additional Sizes (5 products)
  // Full Cream Buffalo Milk - Additional Sizes
  {
    name: 'Full Cream Buffalo Milk 250ml',
    type: 'buffalo_milk',
    variant: 'full_cream',
    fatContent: 7.0,
    description: 'Rich and creamy full cream buffalo milk with high fat content, convenient 250ml pack',
    priceB2C: 22,
    priceB2B: 19,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Full Cream Buffalo Milk 5 Liters',
    type: 'buffalo_milk',
    variant: 'full_cream',
    fatContent: 7.0,
    description: 'Rich and creamy full cream buffalo milk with high fat content, family pack 5 liters',
    priceB2C: 350,
    priceB2B: 300,
    stock: 100,
    unit: 'liter'
  },
  // Standardized Buffalo Milk - Additional Sizes
  {
    name: 'Standardized Buffalo Milk 250ml',
    type: 'buffalo_milk',
    variant: 'standardized',
    fatContent: 5.0,
    description: 'Standardized buffalo milk with fixed 5% fat content, convenient 250ml pack',
    priceB2C: 20,
    priceB2B: 17,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Standardized Buffalo Milk 5 Liters',
    type: 'buffalo_milk',
    variant: 'standardized',
    fatContent: 5.0,
    description: 'Standardized buffalo milk with fixed 5% fat content, family pack 5 liters',
    priceB2C: 330,
    priceB2B: 280,
    stock: 100,
    unit: 'liter'
  },
  // Toned Buffalo Milk - Additional Size
  {
    name: 'Toned Buffalo Milk 5 Liters',
    type: 'buffalo_milk',
    variant: 'toned',
    fatContent: 3.5,
    description: 'Toned buffalo milk with 3.5% fat content, perfect balance of taste and health, family pack 5 liters',
    priceB2C: 310,
    priceB2B: 260,
    stock: 100,
    unit: 'liter'
  }
];

const seedAdditionalProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Insert additional products
    let created = 0;
    let skipped = 0;

    for (const productData of additionalProducts) {
      const existingProduct = await Product.findOne({ 
        name: productData.name,
        type: productData.type,
        variant: productData.variant || null
      });

      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.name}${product.variant ? ` (${product.variant})` : ''}`);
        created++;
      } else {
        console.log(`⏭️  Product already exists: ${productData.name}`);
        skipped++;
      }
    }

    console.log(`\n✅ Additional Products seeding completed!`);
    console.log(`   Created: ${created} products`);
    console.log(`   Skipped: ${skipped} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding additional products:', error);
    process.exit(1);
  }
};

seedAdditionalProducts();


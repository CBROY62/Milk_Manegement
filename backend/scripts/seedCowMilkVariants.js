const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhushand620:bhushand620@milk.9obgflc.mongodb.net/Milk_Management?appName=Milk';

const cowMilkVariants = [
  // Full Cream Cow Milk (high-fat, rich)
  {
    name: 'Full Cream Cow Milk 500ml',
    type: 'cow_milk',
    variant: 'full_cream',
    fatContent: 6.0,
    description: 'Rich and creamy full cream cow milk with high fat content, 500ml pack',
    priceB2C: 35,
    priceB2B: 30,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Full Cream Cow Milk 1 Liter',
    type: 'cow_milk',
    variant: 'full_cream',
    fatContent: 6.0,
    description: 'Rich and creamy full cream cow milk with high fat content, 1 liter pack',
    priceB2C: 65,
    priceB2B: 55,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Full Cream Cow Milk 2 Liters',
    type: 'cow_milk',
    variant: 'full_cream',
    fatContent: 6.0,
    description: 'Rich and creamy full cream cow milk with high fat content, 2 liters pack',
    priceB2C: 125,
    priceB2B: 105,
    stock: 100,
    unit: 'liter'
  },
  // Standardized Cow Milk (fixed fat %, usually 4.5%)
  {
    name: 'Standardized Cow Milk 500ml',
    type: 'cow_milk',
    variant: 'standardized',
    fatContent: 4.5,
    description: 'Standardized cow milk with fixed 4.5% fat content, 500ml pack',
    priceB2C: 32,
    priceB2B: 27,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Standardized Cow Milk 1 Liter',
    type: 'cow_milk',
    variant: 'standardized',
    fatContent: 4.5,
    description: 'Standardized cow milk with fixed 4.5% fat content, 1 liter pack',
    priceB2C: 60,
    priceB2B: 50,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Standardized Cow Milk 2 Liters',
    type: 'cow_milk',
    variant: 'standardized',
    fatContent: 4.5,
    description: 'Standardized cow milk with fixed 4.5% fat content, 2 liters pack',
    priceB2C: 115,
    priceB2B: 95,
    stock: 100,
    unit: 'liter'
  },
  // Toned Milk (around 3% fat)
  {
    name: 'Toned Cow Milk 500ml',
    type: 'cow_milk',
    variant: 'toned',
    fatContent: 3.0,
    description: 'Toned cow milk with 3% fat content, perfect balance of taste and health, 500ml pack',
    priceB2C: 30,
    priceB2B: 25,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Toned Cow Milk 1 Liter',
    type: 'cow_milk',
    variant: 'toned',
    fatContent: 3.0,
    description: 'Toned cow milk with 3% fat content, perfect balance of taste and health, 1 liter pack',
    priceB2C: 55,
    priceB2B: 48,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Toned Cow Milk 2 Liters',
    type: 'cow_milk',
    variant: 'toned',
    fatContent: 3.0,
    description: 'Toned cow milk with 3% fat content, perfect balance of taste and health, 2 liters pack',
    priceB2C: 105,
    priceB2B: 90,
    stock: 100,
    unit: 'liter'
  },
  // Double Toned Milk (around 1.5% fat)
  {
    name: 'Double Toned Cow Milk 500ml',
    type: 'cow_milk',
    variant: 'double_toned',
    fatContent: 1.5,
    description: 'Double toned cow milk with 1.5% fat content, low fat option, 500ml pack',
    priceB2C: 28,
    priceB2B: 23,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Double Toned Cow Milk 1 Liter',
    type: 'cow_milk',
    variant: 'double_toned',
    fatContent: 1.5,
    description: 'Double toned cow milk with 1.5% fat content, low fat option, 1 liter pack',
    priceB2C: 52,
    priceB2B: 45,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Double Toned Cow Milk 2 Liters',
    type: 'cow_milk',
    variant: 'double_toned',
    fatContent: 1.5,
    description: 'Double toned cow milk with 1.5% fat content, low fat option, 2 liters pack',
    priceB2C: 100,
    priceB2B: 85,
    stock: 100,
    unit: 'liter'
  },
  // Skimmed Milk (fat-free, <0.5%)
  {
    name: 'Skimmed Cow Milk 500ml',
    type: 'cow_milk',
    variant: 'skimmed',
    fatContent: 0.5,
    description: 'Skimmed cow milk with less than 0.5% fat, fat-free option, 500ml pack',
    priceB2C: 26,
    priceB2B: 22,
    stock: 100,
    unit: 'ml'
  },
  {
    name: 'Skimmed Cow Milk 1 Liter',
    type: 'cow_milk',
    variant: 'skimmed',
    fatContent: 0.5,
    description: 'Skimmed cow milk with less than 0.5% fat, fat-free option, 1 liter pack',
    priceB2C: 48,
    priceB2B: 40,
    stock: 100,
    unit: 'liter'
  },
  {
    name: 'Skimmed Cow Milk 2 Liters',
    type: 'cow_milk',
    variant: 'skimmed',
    fatContent: 0.5,
    description: 'Skimmed cow milk with less than 0.5% fat, fat-free option, 2 liters pack',
    priceB2C: 92,
    priceB2B: 78,
    stock: 100,
    unit: 'liter'
  }
];

const seedCowMilkVariants = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Insert cow milk variants
    let created = 0;
    let skipped = 0;

    for (const productData of cowMilkVariants) {
      const existingProduct = await Product.findOne({ 
        name: productData.name,
        type: productData.type,
        variant: productData.variant
      });

      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.name} (${product.variant})`);
        created++;
      } else {
        console.log(`⏭️  Product already exists: ${productData.name}`);
        skipped++;
      }
    }

    console.log(`\n✅ Cow Milk Variants seeding completed!`);
    console.log(`   Created: ${created} products`);
    console.log(`   Skipped: ${skipped} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding cow milk variants:', error);
    process.exit(1);
  }
};

seedCowMilkVariants();


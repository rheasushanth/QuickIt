import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';
import { prod_list, cat_list } from './data/seedData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Seed categories
    const categories = cat_list.map(cat => ({
      name: cat.cat_name,
      image: cat.cat_image,
      isActive: true,
      sortOrder: 1
    }));

    await Category.insertMany(categories);
    console.log(`✅ Seeded ${categories.length} categories`);

    // Seed products
    const products = prod_list.map(product => ({
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      category: product.category,
      description: `High quality ${product.name} from our premium collection`,
      stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
      isActive: true,
      unit: 'piece',
      brand: 'QuickIT',
      ratings: {
        average: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
        count: Math.floor(Math.random() * 100) + 5
      }
    }));

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Update category product counts
    for (const category of categories) {
      const productCount = await Product.countDocuments({ category: category.name });
      await Category.updateOne(
        { name: category.name },
        { productCount }
      );
    }

    console.log('✅ Updated category product counts');
    console.log('🎉 Database seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
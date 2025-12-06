import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Key products that users might have in cart (extracted from assets.js)
const products = [
    {
        customId: "1",
        name: "Atta",
        price: 400,
        category: "Atta, Rice & Dal",
        stock: 100,
        image: "/src/assets/Atta.jpg"
    },
    {
        customId: "2", 
        name: "Sooji (1kg)",
        price: 85,
        category: "Atta, Rice & Dal",
        stock: 50,
        image: "/src/assets/Besan, Sooji & Maida.webp"
    },
    {
        customId: "3",
        name: "Bhatura Mix (500g)",
        price: 95,
        category: "Atta, Rice & Dal", 
        stock: 30,
        image: "/src/assets/Millet & Other Flours.webp"
    },
    {
        customId: "4",
        name: "Basmati Rice (5kg)",
        price: 680,
        category: "Atta, Rice & Dal",
        stock: 60,
        image: "/src/assets/Rice.webp"
    },
    {
        customId: "5",
        name: "Toor Dal (1kg)",
        price: 150,
        category: "Atta, Rice & Dal", 
        stock: 80,
        image: "/src/assets/Toor Dal.webp"
    },
    {
        customId: "575",
        name: "Cheetos",
        price: 250,
        category: "Snacks & Munchies",
        stock: 25,
        image: "/src/assets/Imported Snacks.webp"
    },
    {
        customId: "576", 
        name: "Makhana",
        price: 180,
        category: "Snacks & Munchies",
        stock: 40,
        image: "/src/assets/Makhana & More.jpg"
    },
    {
        customId: "6",
        name: "Chicken (1kg)",
        price: 320,
        category: "Meat & Fish",
        stock: 20,
        image: "/src/assets/Chicken.jpg"
    },
    {
        customId: "7",
        name: "Mutton (1kg)", 
        price: 750,
        category: "Meat & Fish",
        stock: 15,
        image: "/src/assets/Mutton.webp"
    },
    {
        customId: "8",
        name: "Fish (1kg)",
        price: 450,
        category: "Meat & Fish",
        stock: 25,
        image: "/src/assets/Fish.webp"
    },
    {
        customId: "9",
        name: "Milk (1L)",
        price: 60,
        category: "Dairy & Breakfast",
        stock: 100,
        image: "/src/assets/Milk.webp"
    },
    {
        customId: "10",
        name: "Bread",
        price: 35,
        category: "Bakery & Biscuits",
        stock: 50,
        image: "/src/assets/Bread & Pav.webp"
    },
    {
        customId: "11",
        name: "Butter (500g)",
        price: 200,
        category: "Dairy & Breakfast",
        stock: 40,
        image: "/src/assets/Butter & More.webp"
    },
    {
        customId: "12",
        name: "Eggs (12 pieces)",
        price: 84,
        category: "Dairy & Breakfast",
        stock: 60,
        image: "/src/assets/Eggs.webp"
    },
    {
        customId: "13",
        name: "Banana (1kg)",
        price: 50,
        category: "Fruits & Vegetables",
        stock: 100,
        image: "/src/assets/Banana.webp"
    },
    {
        customId: "14",
        name: "Apple (1kg)",
        price: 180,
        category: "Fruits & Vegetables",
        stock: 80,
        image: "/src/assets/Apple.webp"
    },
    {
        customId: "15",
        name: "Onion (1kg)",
        price: 30,
        category: "Fruits & Vegetables",
        stock: 120,
        image: "/src/assets/Onion.webp"
    },
    {
        customId: "16",
        name: "Potato (1kg)",
        price: 25,
        category: "Fruits & Vegetables",
        stock: 150,
        image: "/src/assets/Potato.webp"
    },
    {
        customId: "17",
        name: "Tomato (1kg)",
        price: 40,
        category: "Fruits & Vegetables",
        stock: 90,
        image: "/src/assets/Tomato.webp"
    },
    {
        customId: "18",
        name: "Biscuits (Pack)",
        price: 45,
        category: "Bakery & Biscuits",
        stock: 70,
        image: "/src/assets/Biscuits.webp"
    },
    {
        customId: "19",
        name: "Tea (250g)",
        price: 120,
        category: "Tea, Coffee & Health Drink",
        stock: 50,
        image: "/src/assets/Tea.webp"
    },
    {
        customId: "20",
        name: "Coffee (200g)",
        price: 180,
        category: "Tea, Coffee & Health Drink",
        stock: 45,
        image: "/src/assets/Coffee.webp"
    }
];

const seedProducts = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Create products
        const createdProducts = [];
        for (const productData of products) {
            try {
                const product = new Product({
                    customId: productData.customId,
                    name: productData.name,
                    price: productData.price,
                    category: productData.category,
                    stock: productData.stock,
                    image: productData.image,
                    description: `Fresh and high-quality ${productData.name}`,
                    isActive: true,
                    unit: 'piece'
                });

                const savedProduct = await product.save();
                createdProducts.push(savedProduct);
                console.log(`✅ Created: ${product.name} (ID: ${productData.customId})`);
            } catch (error) {
                console.error(`❌ Error creating ${productData.name}:`, error.message);
            }
        }

        console.log(`\n🎉 Successfully seeded ${createdProducts.length} products!`);
        console.log('\n📋 Product Summary:');
        createdProducts.forEach(product => {
            console.log(`- ${product.name}: ₹${product.price} (Stock: ${product.stock}) [ID: ${product.customId}]`);
        });

        // Close connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run the seeder
seedProducts();
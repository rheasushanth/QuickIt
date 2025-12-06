import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Function to parse the frontend assets.js file and extract all products
const extractProductsFromAssets = () => {
    try {
        // Read the assets.js file
        const assetsPath = path.join(process.cwd(), '../frontend/src/assets/assets.js');
        let assetsContent = fs.readFileSync(assetsPath, 'utf8');
        
        // Extract the prod_list array using regex
        const prodListMatch = assetsContent.match(/export const prod_list = \[([\s\S]*?)\];/);
        if (!prodListMatch) {
            throw new Error('Could not find prod_list in assets.js');
        }
        
        let prodListString = prodListMatch[1];
        
        // Clean up the string and extract individual products
        const products = [];
        
        // Split by product objects (look for _id pattern)
        const productMatches = prodListString.match(/\{\s*_id:\s*"[^"]*"[\s\S]*?\}/g);
        
        if (productMatches) {
            productMatches.forEach(productStr => {
                try {
                    // Extract _id
                    const idMatch = productStr.match(/_id:\s*"([^"]*)"/);
                    // Extract name
                    const nameMatch = productStr.match(/name:\s*"([^"]*)"/);
                    // Extract price
                    const priceMatch = productStr.match(/price:\s*(\d+)/);
                    // Extract category
                    const categoryMatch = productStr.match(/category:\s*"([^"]*)"/);
                    
                    if (idMatch && nameMatch && priceMatch && categoryMatch) {
                        products.push({
                            customId: idMatch[1],
                            name: nameMatch[1],
                            price: parseInt(priceMatch[1]),
                            category: categoryMatch[1],
                            stock: Math.floor(Math.random() * 100) + 20, // Random stock between 20-120
                            image: `/assets/placeholder.jpg`, // Placeholder image
                            description: `Fresh and high-quality ${nameMatch[1]}`,
                            isActive: true,
                            unit: 'piece'
                        });
                    }
                } catch (e) {
                    console.warn('Error parsing product:', e.message);
                }
            });
        }
        
        return products;
    } catch (error) {
        console.error('Error reading assets file:', error.message);
        // Fallback to manual product list
        return getManualProductList();
    }
};

// Fallback manual product list with more comprehensive data
const getManualProductList = () => {
    return [
        // Atta, Rice & Dal
        { customId: "1", name: "Atta", price: 400, category: "Atta, Rice & Dal", stock: 100, image: "/assets/atta.jpg" },
        { customId: "2", name: "Sooji (1kg)", price: 85, category: "Atta, Rice & Dal", stock: 50, image: "/assets/sooji.jpg" },
        { customId: "3", name: "Bhatura Mix (500g)", price: 95, category: "Atta, Rice & Dal", stock: 30, image: "/assets/bhatura.jpg" },
        { customId: "4", name: "Moong Dal (1kg)", price: 130, category: "Atta, Rice & Dal", stock: 75, image: "/assets/moong-dal.jpg" },
        { customId: "5", name: "White Poha (Flattened Rice) (500g)", price: 100, category: "Atta, Rice & Dal", stock: 40, image: "/assets/poha.jpg" },
        { customId: "6", name: "Rajma (Red Kidney Beans) (1kg)", price: 150, category: "Atta, Rice & Dal", stock: 60, image: "/assets/rajma.jpg" },
        { customId: "7", name: "Basmati Rice - Premium (5kg)", price: 680, category: "Atta, Rice & Dal", stock: 35, image: "/assets/rice.jpg" },
        { customId: "8", name: "Toor Dal (Arhar Dal) (1kg)", price: 110, category: "Atta, Rice & Dal", stock: 80, image: "/assets/toor-dal.jpg" },
        
        // Baby Care
        { customId: "9", name: "Baby Cereal", price: 200, category: "Baby Care", stock: 25, image: "/assets/baby-cereal.jpg" },
        
        // Chicken, Meat & Fish
        { customId: "10", name: "1 KG Chicken", price: 320, category: "Chicken, Meat & Fish", stock: 20, image: "/assets/chicken.jpg" },
        { customId: "11", name: "Fish", price: 400, category: "Chicken, Meat & Fish", stock: 15, image: "/assets/fish.jpg" },
        
        // Dairy, Bread & Eggs
        { customId: "15", name: "Milk (1L)", price: 60, category: "Dairy, Bread & Eggs", stock: 100, image: "/assets/milk.jpg" },
        { customId: "16", name: "Bread", price: 35, category: "Dairy, Bread & Eggs", stock: 50, image: "/assets/bread.jpg" },
        { customId: "17", name: "Eggs (12 pieces)", price: 84, category: "Dairy, Bread & Eggs", stock: 60, image: "/assets/eggs.jpg" },
        { customId: "18", name: "Butter (500g)", price: 200, category: "Dairy, Bread & Eggs", stock: 40, image: "/assets/butter.jpg" },
        { customId: "19", name: "Cheese Slices", price: 150, category: "Dairy, Bread & Eggs", stock: 35, image: "/assets/cheese.jpg" },
        { customId: "20", name: "Paneer (250g)", price: 120, category: "Dairy, Bread & Eggs", stock: 45, image: "/assets/paneer.jpg" },
        
        // Fruits & Vegetables
        { customId: "25", name: "Banana (1kg)", price: 50, category: "Fruits & Vegetables", stock: 100, image: "/assets/banana.jpg" },
        { customId: "26", name: "Apple (1kg)", price: 180, category: "Fruits & Vegetables", stock: 80, image: "/assets/apple.jpg" },
        { customId: "27", name: "Onion (1kg)", price: 30, category: "Fruits & Vegetables", stock: 120, image: "/assets/onion.jpg" },
        { customId: "28", name: "Potato (1kg)", price: 25, category: "Fruits & Vegetables", stock: 150, image: "/assets/potato.jpg" },
        { customId: "29", name: "Tomato (1kg)", price: 40, category: "Fruits & Vegetables", stock: 90, image: "/assets/tomato.jpg" },
        { customId: "30", name: "Carrot (1kg)", price: 45, category: "Fruits & Vegetables", stock: 70, image: "/assets/carrot.jpg" },
        { customId: "31", name: "Cucumber (1kg)", price: 35, category: "Fruits & Vegetables", stock: 65, image: "/assets/cucumber.jpg" },
        { customId: "32", name: "Green Capsicum (500g)", price: 60, category: "Fruits & Vegetables", stock: 40, image: "/assets/capsicum.jpg" },
        { customId: "33", name: "Spinach (250g)", price: 25, category: "Fruits & Vegetables", stock: 55, image: "/assets/spinach.jpg" },
        { customId: "34", name: "Coriander (100g)", price: 15, category: "Fruits & Vegetables", stock: 85, image: "/assets/coriander.jpg" },
        
        // Snacks & Munchies
        { customId: "575", name: "Cheetos", price: 250, category: "Snacks & Munchies", stock: 25, image: "/assets/cheetos.jpg" },
        { customId: "576", name: "Makhana", price: 180, category: "Snacks & Munchies", stock: 40, image: "/assets/makhana.jpg" },
        { customId: "50", name: "Lay's Chips", price: 20, category: "Snacks & Munchies", stock: 60, image: "/assets/lays.jpg" },
        { customId: "51", name: "Biscuits (Pack)", price: 45, category: "Snacks & Munchies", stock: 70, image: "/assets/biscuits.jpg" },
        { customId: "52", name: "Namkeen Mix", price: 80, category: "Snacks & Munchies", stock: 45, image: "/assets/namkeen.jpg" },
        { customId: "53", name: "Roasted Peanuts (500g)", price: 120, category: "Snacks & Munchies", stock: 35, image: "/assets/peanuts.jpg" },
        
        // Tea, Coffee & Health Drink
        { customId: "60", name: "Tea (250g)", price: 120, category: "Tea, Coffee & Health Drink", stock: 50, image: "/assets/tea.jpg" },
        { customId: "61", name: "Coffee (200g)", price: 180, category: "Tea, Coffee & Health Drink", stock: 45, image: "/assets/coffee.jpg" },
        { customId: "62", name: "Green Tea (100g)", price: 250, category: "Tea, Coffee & Health Drink", stock: 30, image: "/assets/green-tea.jpg" },
        { customId: "63", name: "Horlicks (500g)", price: 300, category: "Tea, Coffee & Health Drink", stock: 25, image: "/assets/horlicks.jpg" },
        
        // Cold Drinks & Juices
        { customId: "70", name: "Coca Cola (600ml)", price: 40, category: "Cold Drinks & Juices", stock: 80, image: "/assets/coca-cola.jpg" },
        { customId: "71", name: "Orange Juice (1L)", price: 120, category: "Cold Drinks & Juices", stock: 35, image: "/assets/orange-juice.jpg" },
        { customId: "72", name: "Mango Juice (1L)", price: 140, category: "Cold Drinks & Juices", stock: 30, image: "/assets/mango-juice.jpg" },
        
        // Masala, Oil & More
        { customId: "80", name: "Cooking Oil (1L)", price: 150, category: "Masala, Oil & More", stock: 60, image: "/assets/oil.jpg" },
        { customId: "81", name: "Turmeric Powder (100g)", price: 40, category: "Masala, Oil & More", stock: 75, image: "/assets/turmeric.jpg" },
        { customId: "82", name: "Red Chilli Powder (100g)", price: 50, category: "Masala, Oil & More", stock: 70, image: "/assets/chilli.jpg" },
        { customId: "83", name: "Garam Masala (50g)", price: 80, category: "Masala, Oil & More", stock: 45, image: "/assets/garam-masala.jpg" },
        { customId: "84", name: "Salt (1kg)", price: 20, category: "Masala, Oil & More", stock: 100, image: "/assets/salt.jpg" },
        
        // Personal Care
        { customId: "90", name: "Toothpaste", price: 85, category: "Personal Care", stock: 50, image: "/assets/toothpaste.jpg" },
        { customId: "91", name: "Shampoo (200ml)", price: 150, category: "Personal Care", stock: 40, image: "/assets/shampoo.jpg" },
        { customId: "92", name: "Soap (4 pack)", price: 120, category: "Personal Care", stock: 60, image: "/assets/soap.jpg" },
        { customId: "93", name: "Face Wash (100ml)", price: 180, category: "Personal Care", stock: 35, image: "/assets/face-wash.jpg" },
        
        // Cleaning Essentials
        { customId: "100", name: "Detergent Powder (1kg)", price: 180, category: "Cleaning Essentials", stock: 40, image: "/assets/detergent.jpg" },
        { customId: "101", name: "Dishwash Liquid (500ml)", price: 95, category: "Cleaning Essentials", stock: 55, image: "/assets/dishwash.jpg" },
        { customId: "102", name: "Floor Cleaner (1L)", price: 120, category: "Cleaning Essentials", stock: 35, image: "/assets/floor-cleaner.jpg" },
        
        // Bakery & Biscuits
        { customId: "110", name: "Cake (500g)", price: 250, category: "Bakery & Biscuits", stock: 20, image: "/assets/cake.jpg" },
        { customId: "111", name: "Cookies (200g)", price: 80, category: "Bakery & Biscuits", stock: 45, image: "/assets/cookies.jpg" },
        { customId: "112", name: "Rusk (200g)", price: 60, category: "Bakery & Biscuits", stock: 50, image: "/assets/rusk.jpg" },
        
        // Sweet Tooth
        { customId: "120", name: "Chocolate Bar", price: 50, category: "Sweet Tooth", stock: 60, image: "/assets/chocolate.jpg" },
        { customId: "121", name: "Ice Cream (500ml)", price: 200, category: "Sweet Tooth", stock: 25, image: "/assets/ice-cream.jpg" },
        { customId: "122", name: "Sweets (250g)", price: 300, category: "Sweet Tooth", stock: 30, image: "/assets/sweets.jpg" },
        
        // Breakfast & Instant Food
        { customId: "130", name: "Cornflakes (500g)", price: 180, category: "Breakfast & Instant Food", stock: 40, image: "/assets/cornflakes.jpg" },
        { customId: "131", name: "Oats (500g)", price: 120, category: "Breakfast & Instant Food", stock: 50, image: "/assets/oats.jpg" },
        { customId: "132", name: "Maggi Noodles (12 pack)", price: 144, category: "Breakfast & Instant Food", stock: 70, image: "/assets/maggi.jpg" }
    ].map(product => ({
        ...product,
        description: `Fresh and high-quality ${product.name}`,
        isActive: true,
        unit: 'piece'
    }));
};

const seedAllProducts = async () => {
    try {
        console.log('🌱 Starting comprehensive database seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Try to extract products from assets.js, fallback to manual list
        console.log('📖 Reading products from assets.js...');
        let products = extractProductsFromAssets();
        
        if (products.length === 0) {
            console.log('⚠️  Could not extract from assets.js, using manual product list...');
            products = getManualProductList();
        }

        console.log(`📦 Found ${products.length} products to seed`);

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Create products in batches for better performance
        const batchSize = 10;
        const createdProducts = [];
        
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            try {
                const batchResults = await Product.insertMany(batch);
                createdProducts.push(...batchResults);
                console.log(`✅ Created batch ${Math.floor(i/batchSize) + 1}: ${batch.length} products`);
            } catch (error) {
                console.error(`❌ Error creating batch ${Math.floor(i/batchSize) + 1}:`, error.message);
                // Try individual creation for failed batch
                for (const productData of batch) {
                    try {
                        const product = await Product.create(productData);
                        createdProducts.push(product);
                        console.log(`✅ Individual create: ${product.name}`);
                    } catch (individualError) {
                        console.error(`❌ Failed to create ${productData.name}:`, individualError.message);
                    }
                }
            }
        }

        console.log(`\n🎉 Successfully seeded ${createdProducts.length} products!`);
        
        // Group by category for summary
        const categoryGroups = createdProducts.reduce((acc, product) => {
            if (!acc[product.category]) acc[product.category] = [];
            acc[product.category].push(product);
            return acc;
        }, {});

        console.log('\n📋 Products by Category:');
        Object.entries(categoryGroups).forEach(([category, products]) => {
            console.log(`\n🏷️  ${category} (${products.length} items):`);
            products.forEach(product => {
                console.log(`   - ${product.name}: ₹${product.price} (Stock: ${product.stock}) [ID: ${product.customId}]`);
            });
        });

        // Close connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        console.log('\n🚀 All products are now available in your MongoDB database!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run the comprehensive seeder
seedAllProducts();
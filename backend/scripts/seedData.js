require('dotenv').config();
const connectDB = require('../src/config/db');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const slugify = require('../src/utils/slugify');

const categories = [
  { name: 'Electronics' },
  { name: 'Clothing' },
  { name: 'Books' },
  { name: 'Home & Kitchen' },
  { name: 'Sports' },
];

// Helper: turn an Unsplash photo ID into an image record
// publicId is required by the Product schema; we prefix with `seed:` so
// real Cloudinary deletes never collide with these.
const img = (id) => ({
  url: `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`,
  publicId: `seed:${id}`,
});

function makeProducts(catMap) {
  return [
    // ---------------- ELECTRONICS ----------------
    {
      name: 'Wireless Noise-Cancelling Headphones',
      description:
        'Premium over-ear Bluetooth headphones with 30-hour battery life, active noise cancellation, and plush memory-foam ear cups. Includes carrying case and USB-C cable.',
      price: 2499, mrp: 3999,
      category: catMap['Electronics'], brand: 'Sony', stock: 50,
      images: [img('photo-1505740420928-5e560c06d30e')],
    },
    {
      name: 'Smart LED Desk Lamp',
      description:
        'Touch-controlled desk lamp with 5 brightness levels, 3 color temperatures and a built-in USB charging port. Eye-care flicker-free LED.',
      price: 899, mrp: 1299,
      category: catMap['Electronics'], brand: 'Philips', stock: 30,
      images: [img('photo-1507473885765-e6ed057f782c')],
    },
    {
      name: 'Portable Bluetooth Speaker',
      description:
        'Rugged waterproof speaker with 360° sound, deep bass, and 20-hour battery life. Pair two for true stereo sound.',
      price: 1499, mrp: 2499,
      category: catMap['Electronics'], brand: 'JBL', stock: 75,
      images: [img('photo-1608043152269-423dbba4e7e1')],
    },
    {
      name: 'Fitness Smartwatch with Heart Rate Monitor',
      description:
        '1.4" AMOLED display, SpO2 sensor, sleep tracking, 100+ sport modes, IP68 water resistant. 7-day battery life.',
      price: 2999, mrp: 5999,
      category: catMap['Electronics'], brand: 'Noise', stock: 80,
      images: [img('photo-1546868871-7041f2a55e12')],
    },

    // ---------------- CLOTHING ----------------
    {
      name: "Men's Classic Cotton T-Shirt",
      description:
        '100% combed cotton, pre-shrunk crew-neck T-shirt. Soft hand-feel, breathable, machine washable. Classic regular fit.',
      price: 349, mrp: 599,
      category: catMap['Clothing'], brand: "Levi's", stock: 120,
      images: [img('photo-1521572163474-6864f9cf17ab')],
    },
    {
      name: "Women's Denim Jacket",
      description:
        'Mid-wash classic denim jacket with button front, two chest pockets and side pockets. Soft cotton-denim blend, slim fit.',
      price: 1899, mrp: 2999,
      category: catMap['Clothing'], brand: 'H&M', stock: 45,
      images: [img('photo-1591047139829-d91aecb6caea')],
    },
    {
      name: 'Unisex Pullover Hoodie',
      description:
        'Heavyweight 320 GSM fleece-lined hoodie with adjustable drawstring hood and kangaroo pocket. Cozy, warm and durable.',
      price: 1299, mrp: 1999,
      category: catMap['Clothing'], brand: 'UNIQLO', stock: 90,
      images: [img('photo-1556821840-3a63f95609a7')],
    },
    {
      name: 'Casual Linen Shirt',
      description:
        'Breathable lightweight linen shirt perfect for summer. Relaxed fit with mother-of-pearl buttons. Available in cream and sky-blue.',
      price: 999, mrp: 1599,
      category: catMap['Clothing'], brand: 'Zara', stock: 60,
      images: [img('photo-1602810318383-e386cc2a3ccf')],
    },

    // ---------------- BOOKS ----------------
    {
      name: 'JavaScript: The Good Parts',
      description:
        'Essential guide to the best features of JavaScript by Douglas Crockford. A must-read for every web developer.',
      price: 499, mrp: 799,
      category: catMap['Books'], brand: "O'Reilly", stock: 80,
      images: [img('photo-1517842645767-c639042777db')],
    },
    {
      name: 'Atomic Habits',
      description:
        'An easy and proven way to build good habits and break bad ones by James Clear. International bestseller — over 10M copies sold.',
      price: 399, mrp: 699,
      category: catMap['Books'], brand: 'Penguin', stock: 150,
      images: [img('photo-1544716278-ca5e3f4abd8c')],
    },
    {
      name: 'Rich Dad Poor Dad',
      description:
        'What the rich teach their kids about money — that the poor and middle class do not. By Robert Kiyosaki.',
      price: 350, mrp: 599,
      category: catMap['Books'], brand: 'Plata Publishing', stock: 100,
      images: [img('photo-1512820790803-83ca734da794')],
    },
    {
      name: 'The Alchemist',
      description:
        "Paulo Coelho's enchanting novel about Santiago, an Andalusian shepherd boy who travels in search of a worldly treasure. A modern classic.",
      price: 299, mrp: 499,
      category: catMap['Books'], brand: 'HarperCollins', stock: 200,
      images: [img('photo-1543002588-bfa74002ed7e')],
    },

    // ---------------- HOME & KITCHEN ----------------
    {
      name: 'Non-Stick Cookware Set (5 piece)',
      description:
        '5-piece non-stick cookware set with PFOA-free coating, tempered-glass lids and stay-cool bakelite handles. Compatible with gas and induction.',
      price: 1799, mrp: 2999,
      category: catMap['Home & Kitchen'], brand: 'Prestige', stock: 25,
      images: [img('photo-1584990347449-a8d09a8d8d61')],
    },
    {
      name: 'Stainless Steel Water Bottle 1L',
      description:
        'Double-wall vacuum-insulated bottle keeps drinks cold 24h and hot 12h. Leak-proof, BPA-free, with carry loop.',
      price: 449, mrp: 699,
      category: catMap['Home & Kitchen'], brand: 'Milton', stock: 150,
      images: [img('photo-1602143407151-7111542de6e8')],
    },
    {
      name: 'Ceramic Coffee Mug Set (Set of 4)',
      description:
        'Microwave and dishwasher safe ceramic mugs in matte pastel finishes. 350ml each. Perfect for coffee, tea, or hot chocolate.',
      price: 599, mrp: 999,
      category: catMap['Home & Kitchen'], brand: 'Borosil', stock: 70,
      images: [img('photo-1514228742587-6b1558fcca3d')],
    },
    {
      name: 'Bamboo Cutting Board with Juice Groove',
      description:
        'Eco-friendly bamboo cutting board with deep juice groove and built-in handles. Sturdy, knife-friendly and naturally antibacterial.',
      price: 499, mrp: 799,
      category: catMap['Home & Kitchen'], brand: 'HomeCentre', stock: 110,
      images: [img('photo-1591193686104-fddba4d0e4c1')],
    },

    // ---------------- SPORTS ----------------
    {
      name: 'Yoga Mat with Carry Strap',
      description:
        'Anti-slip 6mm thick yoga mat made from eco-friendly TPE material. Lightweight, easy to clean, includes carry strap.',
      price: 699, mrp: 999,
      category: catMap['Sports'], brand: 'Decathlon', stock: 90,
      images: [img('photo-1592432678016-e910b452f9a2')],
    },
    {
      name: "Women's Running Sneakers",
      description:
        'Lightweight mesh upper with responsive foam midsole. Designed for daily runs and gym workouts. Non-slip rubber outsole.',
      price: 1299, mrp: 1999,
      category: catMap['Sports'], brand: 'Nike', stock: 60,
      images: [img('photo-1542291026-7eec264c27ff')],
    },
    {
      name: 'Adjustable Dumbbell Set 10kg',
      description:
        'Pair of adjustable dumbbells with plates that quickly snap on/off. Chrome-finish handles with knurled grip. Total weight 10kg.',
      price: 1499, mrp: 2499,
      category: catMap['Sports'], brand: 'Powermax', stock: 40,
      images: [img('photo-1517344884509-a0c97ec11bcc')],
    },
    {
      name: 'Tennis Racket — Pro Series',
      description:
        'Graphite-composite tennis racket with 100 sq in head, balanced weight (300g) and shock-absorbing handle. Pre-strung, ready to play.',
      price: 1899, mrp: 2999,
      category: catMap['Sports'], brand: 'Wilson', stock: 35,
      images: [img('photo-1622279457486-62dcc4a431d6')],
    },
  ];
}

(async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found. Run: npm run seed:admin first.');
      process.exit(1);
    }

    // Seed categories
    const catMap = {};
    for (const cat of categories) {
      const slug = slugify(cat.name);
      let category = await Category.findOne({ slug });
      if (!category) {
        category = await Category.create({ name: cat.name, slug });
        console.log(`  ✓ Category created: ${cat.name}`);
      } else {
        console.log(`  → Category exists:  ${cat.name}`);
      }
      catMap[cat.name] = category._id;
    }

    // Seed products
    const products = makeProducts(catMap);
    let created = 0, skipped = 0;
    for (const p of products) {
      const slug = slugify(p.name);
      const existing = await Product.findOne({ slug });
      if (!existing) {
        await Product.create({ ...p, slug, createdBy: admin._id });
        console.log(`  ✓ Product created: ${p.name}  (${p.brand})`);
        created++;
      } else {
        console.log(`  → Product exists:  ${p.name}`);
        skipped++;
      }
    }

    console.log(`\nSeed complete! ${created} created, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();

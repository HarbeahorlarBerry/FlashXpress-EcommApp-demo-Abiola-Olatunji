import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/usersSchema.js";
import Product from "../Models/productSchema.js";

const PASSWORD = process.env.SEED_PASSWORD || "Demo@12345";
const DOMAIN = "@demo.shop";

const catalog = {
  electronics: ["Wireless Earbuds Pro", "Smart Watch Series X", "Portable Bluetooth Speaker", "USB-C Fast Charger 65W"],
  fashion: ["Classic Denim Jacket", "Minimal Leather Sneakers", "Canvas Weekend Backpack", "Polarized Aviator Sunglasses"],
  home: ["Ceramic Pour-Over Set", "LED Desk Lamp", "Memory Foam Pillow", "Stainless Steel Water Bottle"],
  beauty: ["Vitamin C Serum", "Bamboo Hair Brush", "Hydrating Face Mask Pack", "Matte Lipstick Trio"],
  sports: ["Non-Slip Yoga Mat", "Adjustable Dumbbell Set", "Running Armband", "Resistance Bands Kit"],
  toys: ["Building Blocks 500pc", "Remote Control Stunt Car", "Wooden Puzzle Set", "Plush Dinosaur"],
};

await mongoose.connect(process.env.MONGODB_URL);

const old = await User.find({ gmail: { $regex: `${DOMAIN.replace(".", "\\.")}$` } }).select("_id");
const oldIds = old.map((u) => u._id);
await Product.deleteMany({ userId: { $in: oldIds } });
await User.deleteMany({ _id: { $in: oldIds } });

const password = await bcrypt.hash(PASSWORD, 12);
const mk = (username, role) => ({ username, gmail: `${username}${DOMAIN}`, password, role, isVerified: true });
const [admin, sellerA, sellerB, buyer] = await User.insertMany([
  mk("admin", "admin"), mk("techstore", "seller"), mk("stylehub", "seller"), mk("buyer", "user"),
]);

const sellers = [sellerA, sellerB];
const products = [];
let i = 0;
for (const [category, names] of Object.entries(catalog)) {
  for (const name of names) {
    i += 1;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    products.push({
      name,
      description: `${name}: quality you can rely on, fast shipping and easy returns. Demo listing for the portfolio store.`,
      price: Math.round((9.99 + ((i * 37) % 180)) * 100) / 100,
      category,
      stock: 20 + ((i * 13) % 80),
      images: [`https://picsum.photos/seed/${slug}/800/800`, `https://picsum.photos/seed/${slug}-2/800/800`],
      userId: sellers[i % 2]._id,
      averageRating: Math.min(5, 3.8 + ((i * 7) % 12) / 10),
      reviewCount: 5 + ((i * 11) % 200),
      soldCount: (i * 53) % 900,
    });
  }
}
await Product.insertMany(products);

console.log(`Seeded ${products.length} products.`);
console.log(`Logins (password: ${PASSWORD}):`);
console.log(`  admin${DOMAIN} | techstore${DOMAIN} (seller) | stylehub${DOMAIN} (seller) | buyer${DOMAIN}`);
await mongoose.disconnect();
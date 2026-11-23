import mongoose from 'mongoose';
import User from '../Models/usersSchema.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL); // No need for options in Mongoose v6+
    console.log(" Connected ✅to MongoDB 📦");

    // Role Migration
    const result = await User.updateMany(
      { role: {$exists: false} },
      { $set: { role: "user"} }
    );
    console.log(`🔄 Role migration complete: ${result.modifiedCount} users updated`);

    // Example: ensure admin account
    await User.updateOne(
      { gmail: "harbeahorlarberry@gmail.com"},
      {$set: { role: "altimateAdmin" } }
    );

    console.log("👑 Admin & AltimateAdmin accounts ensured");
    
    
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the app on DB failure
  }
};

export default connectDB;



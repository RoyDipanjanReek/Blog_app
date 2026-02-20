import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Mongodb connect successfully");
  } catch (error) {
    console.log("mongo db connection error");
    process.exit(1);
  }
};

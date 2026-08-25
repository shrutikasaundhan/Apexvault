import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log(process.env.DB_URL);

    console.log("Database connected");
  } catch (err) {
    console.log(err);
    console.log("Could Not Connect to the Database");
    process.exit(1);
  }
}



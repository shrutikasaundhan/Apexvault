import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: Date
});

const OTP = mongoose.models.OTP || mongoose.model("OTP", otpSchema);

async function main() {
  const dbUrl = "mongodb://shruti:shruti123@127.0.0.1:27017/storageApp?authSource=storageApp";
  await mongoose.connect(dbUrl);
  
  const records = await OTP.find().lean();
  console.log("OTPs in DB:");
  records.forEach(r => {
    console.log(`- Email: ${r.email}, OTP: ${r.otp}, CreatedAt: ${r.createdAt}`);
  });
  
  await mongoose.connection.close();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

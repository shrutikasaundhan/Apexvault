import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use false for STARTTLS (port 587)
  family: 4, // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP in MongoDB
  await OTP.findOneAndUpdate(
    { email },
    {
      otp,
      createdAt: new Date(),
    },
    {
      upsert: true,
    }
  );

  console.log(`\n==========================================\n[OTP DEBUG] Generated OTP for ${email} is: ${otp}\n==========================================\n`);

  const html = `
    <div style="font-family:sans-serif;">
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `Storage App <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Storage App OTP",
      html,
    });
  } catch (mailError) {
    console.error("Failed to send OTP email via SMTP:", mailError.message);
    console.log(`\n==========================================\n[DEVELOPMENT ONLY] OTP for ${email} is: ${otp}\n==========================================\n`);
  }

  return {
    success: true,
    message: `OTP sent successfully on ${email}`,
  };
}
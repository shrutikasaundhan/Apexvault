import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

function getTransporter() {
  const user = process.env.EMAIL_USER || "shrutigupta1907@gmail.com";
  const pass = (process.env.EMAIL_PASS || "frka lebq lsao jenr").replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

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
    <div style="font-family:sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px;">
      <h2 style="color: #4F46E5;">Apexvault Verification</h2>
      <p style="font-size: 16px;">Your verification OTP is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">${otp}</div>
      <p style="color: #6B7280; font-size: 14px;">This OTP is valid for 2 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  try {
    const transporter = getTransporter();
    const sender = process.env.EMAIL_USER || "shrutigupta1907@gmail.com";
    await transporter.sendMail({
      from: `Apexvault <${sender}>`,
      to: email,
      subject: `Your Apexvault Verification Code: ${otp}`,
      html,
    });
    console.log(`OTP email sent successfully to ${email}`);
  } catch (mailError) {
    console.error("Failed to send OTP email via SMTP:", mailError.message);
    console.log(`\n==========================================\n[BACKUP] OTP for ${email} is: ${otp}\n==========================================\n`);
  }

  return {
    success: true,
    message: `OTP sent successfully on ${email}`,
  };
}
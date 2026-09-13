import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

function getTransporter() {
  const user = process.env.EMAIL_USER || "shrutigupta1907@gmail.com";
  const pass = (process.env.EMAIL_PASS || "frka lebq lsao jenr").replace(/\s+/g, "");

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
}

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // 1. Save OTP in MongoDB immediately
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
    <div style="font-family:sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 480px; margin: 0 auto; background-color: #ffffff;">
      <h2 style="color: #059669; margin-top: 0; font-size: 22px;">ApexVault Security</h2>
      <p style="font-size: 15px; color: #334155; margin-bottom: 8px;">Your email verification code is:</p>
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 20px 0; padding: 12px; background: #f1f5f9; text-align: center; border-radius: 8px;">${otp}</div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This verification code is valid for <strong>2 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  // 2. Dispatch email to Gmail SMTP asynchronously
  const transporter = getTransporter();
  const sender = process.env.EMAIL_USER || "shrutigupta1907@gmail.com";

  transporter.sendMail({
    from: `"ApexVault" <${sender}>`,
    to: email,
    subject: `Your ApexVault Verification Code: ${otp}`,
    html,
  }).then((info) => {
    console.log(`[EMAIL SUCCESS] OTP delivered to ${email}:`, info.messageId);
  }).catch((err) => {
    console.error("[EMAIL ERROR] SMTP delivery error:", err.message);
  });

  return {
    success: true,
    message: `OTP sent successfully to ${email}`,
  };
}
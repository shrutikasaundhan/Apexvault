import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string(),
});

export const otpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  otp: z.string().length(4, "Please enter a valid 4 digit OTP").regex(/^\d{4}/, "Please enter a valid 4 digit OTP"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must be at most 100 characters"),
  otp: z.string().length(4, "Please enter a valid 4 digit OTP").regex(/^\d{4}/, "Please enter a valid 4 digit OTP"),
});

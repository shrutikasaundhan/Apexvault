import express from "express"
import { handlerazorpayWebhook } from "../controllers/webhookController.js";


const router=express.Router();

router.post("/razorpay",handlerazorpayWebhook);

export default router;
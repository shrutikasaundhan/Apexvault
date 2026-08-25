import express from "express"
import { createsubscription } from "../controllers/subscriptionController.js";

const router=express.Router();

router.post("/",createsubscription);

export default router;
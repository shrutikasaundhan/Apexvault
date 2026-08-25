import Razorpay from "razorpay"
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";


export const PLANS = {
 plan_TGRAbkdGNSE6P2: {
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_TGRBqGH2twaqUF: {
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_TGRD4RZ6EvIIGF: {
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_TGRERxZ8QHFziv: {
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_TGRFKvDlcRr493: {
    storageQuotaBytes: 10 * 1024 ** 4,
  },
  plan_TGRHXMlO3xJVec: {
    storageQuotaBytes: 10 * 1024 ** 4,
  },
};


export const handlerazorpayWebhook=async(req,res)=>{

    const signature=req.headers["x-razorpay-signature"];
    const isSignature=Razorpay.validateWebhookSignature(JSON.stringify(req.body) , signature, process.env.RAZORPAY_WEBHOOK_SECRET);

    if(isSignature){
      console.log("Signature verified");
      if(req.body.event==='subscription.activated'){

        const rzpSubscription=req.body.payload.subscription.entity;
        const planId=rzpSubscription.plan_id;
        const subscription=await Subscription.findOne({razorpaySubscriptionId:rzpSubscription.id});


        subscription.status = rzpSubscription.status;
        await subscription.save();
        const storageQuotaBytes=PLANS[planId].storageQuotaBytes;
        const user=await User.findById(subscription.userId);
        user.maxStorageInBytes=storageQuotaBytes;
        await user.save();
        console.log("subscription activated");
      }
    }
    else{
      console.log("Signature not verified");
    }
    console.log(req.body);
    res.end("OK");
}
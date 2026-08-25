import RazorPay from "razorpay"
import Subscription from "../models/subscriptionModel.js";

const rzpInstance=new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

export const createsubscription=async(req,res,next)=>{
    try{
        console.log(req.body);


    console.log(req.user);
    const newSubscription=await rzpInstance.subscriptions.create({
        plan_id:req.body.planId,
        total_count:120,
        notes:{

            userId:req.user._id
        }
    });

    const subscription=new Subscription({
        razorpaySubscriptionId:newSubscription.id,
        userId:req.user._id,
    })

    await subscription.save();
    console.log(newSubscription);
    res.json({ subscriptionId: newSubscription.id, subscrptionId: newSubscription.id });
    }catch(err){
        next(err);
    }
}
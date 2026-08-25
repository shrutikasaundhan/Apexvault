import RazorPay from "razorpay"
import Subscription from "../models/subscriptionModel.js";

const rzpInstance=new RazorPay({
    key_id:"rzp_test_TGV5JcN9Yemgac",
    key_secret:"Tg5Hk5NP9Epoi0Gj8oOi2811"

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
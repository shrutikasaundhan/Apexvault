import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { type } from "os";

const subscriptionSchema = new Schema(
  {
    razorpaySubscriptionId: {
      type: String,
      required: true,
     
    },

    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
   
    
   
    
    status: {
      type: String,
      enum: ["created", "pending", "active","past_due","paused","cancel","in-grace"],
      default: "created",
      required:true,
    },},
   
  {
    strict: "throw",
  }
);



const Subscription  = model("Subscription", subscriptionSchema);

export default Subscription;

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const couponSchema = new mongoose.Schema(
{
    name: {
        type:String,
        trim:true,
        unique:true,
        uppercase:true,
        required:"Name is required",
        minlength:[6, "Too short"],
        maxlength:[12, "Too long"],
    }, 
    expiry: {
        type: Date,
        require:true
    },
    discount: {
        type:Number,
        required:true
    }
},
{timestamps:true}
);
module.exports = mongoose.model("Coupon",couponSchema);

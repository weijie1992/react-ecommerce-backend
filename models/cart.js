const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const cartSchema = new mongoose.Schema(
{
    products :[
        {
            product : {
                type: ObjectId,
                ref: "Product"
            },
            count: Number,
            color: String,
            price: Number
        }
    ],
    cartTotal : Number,
    totalAfterDiscount : Number,
    orderedBy: {
        type:ObjectId,
        ref:"user"
    },
},
{timestamps:true}
);
module.exports = mongoose.model("Cart",cartSchema);

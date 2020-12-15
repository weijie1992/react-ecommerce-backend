const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const orderSchema = new mongoose.Schema(
    {
        products :[
            {
                product : {
                    type: ObjectId,
                    ref: "Product"
                },
                count: Number,
                color: String
            }
        ],
        paymentIntent : {},
        orderStatus : {
            type:String,
            default: "Not Processed",
            enum:["Not Processed","Cash On Delivery","Processing","Dispatch","Cancelled","Completed"]
        },
        orderedBy: {
            type:ObjectId,
            ref:"user"
        }
    },
    {timestamps:true}
);

module.exports = mongoose.model("Order",orderSchema)
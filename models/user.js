const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

const userSchema = new mongoose.Schema(
    {
        name:String,
        email: {
            type:String,
            required:true,
            index:true //to query db more efficiently
        },
        role: {
            type:String,
            default:"subscriber"
        },
        cart: {
            type:Array,
            default:[]
        },
        address:String,
        wishlist:[
            {
                type:ObjectId, 
                ref: "Product"
            }
        ],
    }, 
    {timestamps: true} //create and update date will be auto populated 
);

module.exports = mongoose.model("User",userSchema);
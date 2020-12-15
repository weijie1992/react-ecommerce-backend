const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;

const productSchema = new mongoose.Schema({
    title : {
        type:String,
        trim:true,
        required:true,
        maxlength:32,
        text:true //for searching the DB using $text
    },
    slug : {
        type:String,
        unique:true,
        index:true //for searching the DB
    },
    description : {
        type:String,
        required:true,
        maxlength:2000,
        text:true //for searching the DB using $text
    },
    price : {
        type:Number,
        required:true,
        trim:true,
        maxlength:32
    },
    category : {
        type:ObjectId,
        ref:"Category"
    },
    subs : [
        {
            type:ObjectId,
            ref:"Sub"
        }
    ],
    quantity : Number,
    sold: {
        type:Number,
        default:0
    },
    images: {
        type:Array,
    },
    shipping:{
        type:String,
        enum: ["Yes", "No"]
    },
    color: {
        type:String,
        enum: ["Black", "Brown", "Silver", "White", "Blue"]
    },
    brand: {
        type:String,
        enum:["Apple", "Samsung", "Microsoft", "Lenovo", "ASUS"]
    },
    ratings: [
        {
        star:Number,
        postedBy:{
            type:ObjectId,
            ref:"User"}
        }
    ]
},
    {timestamps:true}
);

module.exports = mongoose.model("Product",productSchema);
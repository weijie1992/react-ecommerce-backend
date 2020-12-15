const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
    //Apply coupon
    
    //get user's cart total value
    const user = await User.findOne({email:req.user.email}).exec();
    const {cartTotal,totalAfterDiscount} = await Cart.findOne({orderedBy:user._id}).exec();
    console.log("Cart Total Charge", cartTotal, " After Discount : ", totalAfterDiscount);
    let finalAmount = 0;

    if(req.body.couponApplied && totalAfterDiscount!==0) {
        finalAmount = totalAfterDiscount * 100;
    } else {
        finalAmount = cartTotal * 100;
    }

    //Calculate price
    const paymentIntent = await stripe.paymentIntents.create({
        amount : finalAmount,
        currency:"usd"
    });
    res.json({
        clientSecret: paymentIntent.client_secret,
        cartTotal:cartTotal,
        totalAfterDiscount:totalAfterDiscount,
        payable:finalAmount
    })
}
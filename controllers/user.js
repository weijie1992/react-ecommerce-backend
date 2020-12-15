const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const { json } = require("body-parser");
const uniqueid = require("uniqueid");

exports.userCart = async (req,res) => {
    const cart = req.body.cart;
    console.log(cart);
    
    let products = [];

    const user = await User.findOne({email:req.user.email}).exec();

    //check if logged in user cart's already exist, if exist delete existing cart
    let cartExistByThisUser = await Cart.findOne({orderedBy:user._id}).exec();
    console.log("cartExistByThisUser",cartExistByThisUser);
    if(cartExistByThisUser) { //this will return existing cart if exist and we can chain on remove method
        cartExistByThisUser.remove();
        console.log("Removed Old Cart");
    }

    for(let i=0; i<cart.length;i++) {
        let object = {};

        object.product=cart[i]._id;
        object.count=cart[i].count;
        object.color=cart[i].color;
        //get price from backend not using frontend
        let productFromDb = await Product.findById(cart[i]._id).select("price").exec();
        object.price = productFromDb.price;

        products.push(object);
    }
    console.log("Products", products);
    let cartTotal = 0;
    for(let i = 0; i<products.length; i++) {
        cartTotal = cartTotal + (products[i].price * products[i].count); 
    }
    
    console.log("cartTotal", cartTotal);
    
    //console.log("cartTotal", cartTotal);

    let newCart = await new Cart({
        products:products,
        cartTotal:cartTotal,
        totalAfterDiscount:0,
        orderedBy:user._id
    }).save();

    console.log("New Cart", newCart);

    res.json({ok:true});
};

exports.getUserCart = async(req,res) => {
    const user = await User.findOne({email:req.user.email}).exec();

    let cart = await Cart.findOne({orderedBy:user._id})
    .populate("products.product","_id title price totalAfterDiscount")
    .exec();
    const {products,cartTotal,totalAfterDiscount}  = cart;
    res.json({products, cartTotal, totalAfterDiscount});
}

exports.emptyCart = async (req, res) => {
    const user = await User.findOne({email:req.user.email}).exec();
    const cart = await Cart.findOneAndRemove({orderedBy:user._id}).exec();
    res.json(cart);
}

exports.saveAddress = async(req,res) => {
    const userAddress = await User.findOneAndUpdate({email:req.user.email},{address:req.body.address}).exec();
    res.json({ok:true});
}

exports.applyCouponToUserCart = async(req,res) => {
    const {coupon} = req.body;
    console.log("COUPON",coupon);
    try {

        //retrive the user's  cart which input the valid coupon
        const user = await User.findOne({email:req.user.email}).exec();

        //check if valid coupon
        const validCoupon = await Coupon.findOne({name:coupon}).exec();
        if(validCoupon===null) {
            //removed discount price from cart
            await Cart.findOneAndUpdate({orderedBy:user._id}, {totalAfterDiscount:0},{new:true});
            return res.json({
                err:"Invalid Coupon"
            });
        }

        let {products, cartTotal} = await Cart.findOne({orderedBy:user._id})
        .populate("products.product", "_id title price")
        .exec();
        console.log("cartTotal", cartTotal, 'discount%', validCoupon.discount);

        //calcuate total after discount
        let totalAfterDiscount = (cartTotal - ((cartTotal * validCoupon.discount) /100)).toFixed(2); //2 decimal place
        //Update user cart totalAfterDiscount field
        await Cart.findOneAndUpdate({orderedBy:user._id}, {totalAfterDiscount:totalAfterDiscount},{new:true}).exec();
        res.json(totalAfterDiscount);
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
};

exports.createOrder = async(req, res) => {
    try {
        //get paymentIntent from stripe
        const {paymentIntent} = req.body.stripeResponse;
        console.log("*paymentIntent*",paymentIntent);
        //get the products purchase in user's Cart
        const user = await User.findOne({email:req.user.email}).exec();
        console.log("*user*",user);
        let {products} = await Cart.findOne({orderedBy:user._id}).exec();
        console.log("*products*",products);
        //insert a document to Order collection
        let newOrder = await new Order({
            products,paymentIntent,orderedBy:user._id
        }).save();
        console.log(newOrder);

        //decrement quantity and increment sold from Product collection
        let bulkOption = products.map((item) => {
            return {
                updateOne : {
                    filter: {_id: item.product._id},  //find by item.product._id
                    update : {$inc :{quantity:-item.count, sold:+item.count}} //update to decrement quantity and increment sold
                }
            }
        });
        console.log("**1BulkOption Updated", bulkOption);
        let updated = await Product.bulkWrite(bulkOption,{new: true});
        console.log("**2updated", updated);

        res.json({ok:true});
    }
    catch(err) {
        console.log(err);
        res.status(400).json({err:err.message});
    }
}

exports.createCashOrder = async(req, res) => {
    try {
        //get COD
        const {COD,couponApplied} = req.body;
        console.log("COD is : ", COD);
        console.log("couponApplied is : ", couponApplied);
        if(!COD) return res.status(400).send("Create cash order failed");

        //get the products purchase in user's Cart
        const user = await User.findOne({email:req.user.email}).exec();
        console.log("*user*",user);
        let userCart = await Cart.findOne({orderedBy:user._id}).exec();
        console.log("*userCart*",userCart);

        //Check if coupon is applied
        let finalAmount = 0;
        if(couponApplied && userCart.totalAfterDiscount!==0) {
            finalAmount = userCart.totalAfterDiscount * 100;
        } else {
            finalAmount = userCart.cartTotal * 100;
        }

        //insert a document to Order collection
        let newOrder = await new Order({
            products:userCart.products,
            paymentIntent: {
                id:uniqueid,
                amount:finalAmount,
                currency:"usd",
                status:"Cash On Delivery",
                created:Date.now(),
                payment_method_types:['cash']
            },
            orderedBy:user._id,
            orderStatus:"Cash On Delivery"
        }).save();

        console.log("******newOrder",newOrder);

        //decrement quantity and increment sold from Product collection
        let bulkOption = userCart.products.map((item) => {
            return {
                updateOne : {
                    filter: {_id: item.product._id},  //find by item.product._id
                    update : {$inc :{quantity:-item.count, sold:+item.count}} //update to decrement quantity and increment sold
                }
            }
        });
        console.log("**1BulkOption Updated", bulkOption);
        let updated = await Product.bulkWrite(bulkOption,{new: true});
        console.log("**2updated", updated);

        res.json({ok:true});
    }
    catch(err) {
        console.log(err);
        res.status(400).json({err:err.message});
    }
}

exports.orders = async (req,res) => {
    try {
        let user = await User.findOne({email:req.user.email}).exec();
        let userOrders = await Order.find({orderedBy:user._id})
        .populate("products.product")
        .sort([["createdAt","desc"]])
        .exec();

        res.json(userOrders);
    }
    catch (err) {
        console.log(err);
    }
}
//wishlist
exports.addToWishlist = async (req,res) => {
    try{
        const {productId} = req.body;
        let user = await User.findOneAndUpdate(
            {email:req.user.email},
            {$addToSet:{wishlist:productId}}, //add to array without duplicate
            {new:true})
            .exec();
        res.json({ok:true});
    }
    catch(err) {
        console.log(err);
    }
}
//wishlist
exports.wishlist = async (req,res) => {
    try{
        const userWishlist = await User.findOne(
            {email:req.user.email})
            .select('wishlist')
            .populate("wishlist")
            .exec();

        res.json(userWishlist);
    }
    catch(err) {
        console.log(err);
    }
}
//wishlist
exports.removeFromWishlist = async (req,res) => {
    try{
        const productId = req.params.productId;
        const deletedWishlist = await User.findOneAndUpdate(
            {email:req.user.email},
            {$pull: { wishlist:productId } },
            {new:true}
        ).exec();

        res.json({ok:true});
    }
    catch(err) {
        console.log(err);
    }
}
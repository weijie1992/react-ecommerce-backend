const order = require("../models/order");
const Order = require("../models/order");

exports.orders = async(req,res) => {
    try {
        let orders = await Order.find({})
        .sort("-createdAt")
        .populate("products.product")
        .exec();
        res.json(orders);
    }
    catch(err) {
        console.log(err);
        res.status(400).json({err:"Error retrieving"});
    }
};

exports.orderStatus = async(req,res) => {
    try {
        const {orderId, orderStatus} = req.body;
        let updated = await order.findByIdAndUpdate(orderId, {orderStatus:orderStatus},{new:true}).exec();
        res.json(updated);
    }
    catch(err) {
        console.log(err);
        res.status(400).json({err:"Error updating"});
    }
}
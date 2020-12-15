const Coupon =  require("../models/coupon");

exports.create= async(req,res) => {
    try {
        console.log(req.body);
        const {name,expiry,discount} = req.body.coupon;
        const coupon = await new Coupon({name:name,expiry:expiry,discount:discount}).save();
        console.log("123coupon",coupon);
        res.json(coupon);
    }
    catch (err) {
        res.status(400).send("Create Fail");
        console.log(err);
    }
}

exports.remove= async (req,res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.couponId).exec();
        res.json(coupon);
    }
    catch (err) {
        console.log(err);
    }
}

exports.list= async (req,res) => {
    try {
        res.json(await Coupon.find({}).sort({ createdAt: -1 }).exec());
      } catch (err) {
        console.log(err);
      }
}
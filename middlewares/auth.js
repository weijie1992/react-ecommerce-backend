const admin = require("../firebase/index");
const User = require("../models/user");

//next is the callback, if everything is successful, execute next, next is to proceed to the call, it is required
exports.authCheck = async(req,res, next) => {
    try {
        //firebase to validate token
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken);
        console.log("In Auth Check: ", firebaseUser);
        //pass sucessful user to req.user which is used by createOrUpdateUser controller
        req.user = firebaseUser;
        //execute next to proceed.
        next();
    } catch(err) {
        console.log("User Auth Check Error: ", err);
        res.status(401).json({
            err:err.message
        })
    }
}

exports.adminCheck = async(req,res,next)=> {
    const email = req.user.email;

    const adminUser = await User.findOne({email:email}).exec();

    if(adminUser.role !== "admin") {
        res.status(403).json({
            err:"Admin resource, Access denied"
        });
    }
    else {
        next();
    }
}
const express = require("express");
const router = express.Router();

//middleware
const {authCheck,adminCheck} = require("../middlewares/auth");
//controller
const {createOrUpdateUser,currentUser} = require("../controllers/auth");


//route for create or update user
//middleware authcheck to validate token
//controller to create/update user
router.post("/create-or-update-user",authCheck,createOrUpdateUser);
router.post("/current-user",authCheck,currentUser);
router.post("/current-admin",authCheck,adminCheck,currentUser);
//export,non destructure.
module.exports=router;
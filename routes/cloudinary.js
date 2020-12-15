const express = require("express");
const router = express.Router();

//middleware
const {authCheck, adminCheck} = require("../middlewares/auth");
//constrollers
const {upload,remove} = require("../controllers/cloudinary");
//upload
router.post("/uploadimages",authCheck, adminCheck,upload);
//remove
router.post("/removeimages",authCheck, adminCheck,remove);

module.exports=router;
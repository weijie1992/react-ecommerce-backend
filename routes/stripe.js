const express = require("express");
const router = express.Router();
const {authCheck} = require("../middlewares/auth");
const {createPaymentIntent} = require("../controllers/stripe");

router.post("/createPaymentIntent", authCheck,createPaymentIntent );

module.exports = router;
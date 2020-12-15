const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config(); //for .env file

//import routes
//const authRoutes = require("./routes/auth");

//express app instance
const app = express();

//connect to mongo db
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(()=>{
    return console.log("DB Connected")
    })
.catch((err)=>{
    return console.log("Database error : " + err);
    });

//Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({limit:"2mb"}));
app.use(cors());
//Route Middleware - import and run
//app.use("/api",authRoutes);
fs.readdirSync("./routes").map((route)=>{
    return app.use("/api", require("./routes/"+route));
})
//start route
const port = process.env.PORT;
app.listen(port, ()=>console.log(`Server is running on Port ${port}`));

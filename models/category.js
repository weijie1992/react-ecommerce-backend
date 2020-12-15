const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name : {
            type:String,
            trim:true, //remove begining and ending space
            required:"name is required",
            minlength:[2,'Too short'], //Too short is the message sent if length is less than 3
            maxlength:[32,'Too long'] //Too long is the message sent if length is more than 32
        },
        slug : {
            type:String,
            unique:true, 
            lowercase:true,
            index:true //for better querying
        }
    },
    {timestamps:true}
);

module.exports = mongoose.model("Category",categorySchema)
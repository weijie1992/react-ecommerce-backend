const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.ObjectId;
const subSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            trim:true,
            required: "Name is required",
            minlength: [2,"Too Short"],
            maxlength: [32, "Too Long"]
        },
        slug: {
            type:String,
            unique:true,
            lowercase:true,
            index:true
        },
        parent: {
            type: ObjectId, 
            ref:"Category", //reference key to Category model
            required:true
        },
    },
    {timestamps:true}
)

module.exports = mongoose.model("Sub",subSchema)
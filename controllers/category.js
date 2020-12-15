const Category = require("../models/category");
const slugify = require("slugify");
const Sub = require("../models/sub");
const Product = require("../models/product");

exports.create = async(req,res) => {
    try {
        const name = req.body.name;
        const category = await new Category(
            {
                name:name, 
                slug:slugify(name)
            }
        ).save();
        res.json(category);
    }
    catch(err){
        console.log(err);
        res.status(400).send("Create category failed");
    }
}

exports.list = async(req,res) => {
    try{
        const category =await Category.find({}).sort({createdAt:-1}).exec(); //sort latest using sort({createdAt:-1})
        res.json(category);
    }
    catch(err) {
        console.log(err);
        res.status(400).send("List category failed");
    }
}

//this function will return both category object as well as products object
exports.read = async(req,res) => {
    try {
        let category = await Category.findOne({slug:req.params.slug}).exec();
        
        const products = await Product.find({category:category})
        .populate("category")
        .exec();
        
        res.json({category,products});
    }
    catch(err) {
        console.log(err);
        res.status(400).send("Get category failed");
    }
}

exports.update = async(req,res) => {
    try {
        const name = req.body.name;
        const updated = await Category.findOneAndUpdate(
            {slug:req.params.slug},
            {name:name,slug: slugify(name)},
            {new:true} //return updated document
        ).exec();
        res.json(updated);
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Update Category failed");
    }
    
}
exports.remove = async(req,res) => {
    try {
        const deleted = await Category.findOneAndDelete({slug:req.params.slug}).exec();
        res.json(deleted);
    }
    catch(err) {
        console.log(err);
        res.status(400).send("Delete category fail");
    }
};

exports.getSubs = async(req,res) => {
    try {
        const _id = req.params._id;
        const subs = await Sub.find({parent:_id}).exec();
        res.json(subs);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}

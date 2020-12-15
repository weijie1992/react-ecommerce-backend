const Sub = require("../models/sub");
const slugify = require("slugify");
const Product = require("../models/product");

exports.create = async(req,res) => {
    try {
        const name = req.body.name;
        const sub = await new Sub(
            {
                name:name, 
                slug:slugify(name),
                parent:req.body.parent
            }
        ).save();
        res.json(sub);
    }
    catch(err){
        console.log(err);
        res.status(400).send("Create category failed");
    }
}

exports.list = async(req,res) => {
    try{
        const sub =await Sub.find({}).sort({createdAt:-1}).exec(); //sort latest using sort({createdAt:-1})
        res.json(sub);
    }
    catch(err) {
        console.log(err);
        res.status(400).send("List sub category failed");
    }
}

exports.read = async(req,res) => {
    try {
        let sub = await Sub.findOne({slug:req.params.slug}).exec();
        let products = await Product.find({subs:sub}).populate("category").exec();
        res.json({sub,products});
    }
    catch(err) {
        console.log(err);
        res.status(400).send("Get Sub Category failed");
    }
}

exports.update = async(req,res) => {
    try {
        const name = req.body.name;
        console.log("******SLUG********",req.params.slug);
        const updated = await Sub.findOneAndUpdate(
            {slug:req.params.slug},
            {name:name,slug: slugify(name),parent:req.body.parent},
            {new:true} //return updated document
        );
        res.json(updated);
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Sub Category Update failed");
    }    
}
exports.remove = async(req,res) => {
    try {
        const deleted = await Sub.findOneAndDelete({slug:req.params.slug}).exec();
        res.json(deleted);
    }
    catch(err) {
        console.log(err);
        res.status(400).send("Delete category fail");
    }
}

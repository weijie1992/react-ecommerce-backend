const Product = require("../models/product");
const slugify = require("slugify");
const { json } = require("body-parser");
const User = require("../models/user");
const { aggregate } = require("../models/product");

exports.create = async (req, res) => {
    try {
        console.log(req.body);
        req.body.slug = slugify(req.body.title);
        
        const newProduct = await new Product(req.body).save();
        res.json(newProduct);
    }
    catch(err) {
        console.log(err);
        //res.status(400).send(err.message);
        res.status(400).json({
            err:err.message
        });
    }
};

exports.listAll = async(req,res) => {
    try {
        //return entire product
        let product = await Product.find({})
        .limit(parseInt(req.params.count))
        .populate("category") //populate will retrieve the entire reference of category document that reference to this product
        .populate("subs") //populate will retrieve the entire reference of subs document that reference to this product
        .sort([["createdAt","desc"]])
        .exec();; 
        res.json(product);
    }
    catch(err) {
        console.log(err);
        res.status(400).json({
            err:err.message
        });
    }
}

exports.remove = async(req, res) => {
    try {
        const deleted = await Product.findOneAndRemove({slug:req.params.slug}).exec();
        return res.json(deleted);
    }
    catch(err) {
        console.log(err);
        res.status(400).send("Product delete failed");
    }
}

exports.read = async(req,res) => {
    try {
        const product = await Product.findOne({slug:req.params.slug})
        .populate("category")
        .populate("subs")
        .exec();
        res.json(product);
    }
    catch(err) {
        console.log(err);
        res.status(400).send("Product read failed");
    }
}
exports.update = async(req,res) => {
    try {
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updated = await Product.findOneAndUpdate(
            {slug:req.params.slug},
            req.body,//updated entire body
            {new:true}
        ).exec();
        res.json(updated);
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
};
/*Without Pagination */
// exports.list = async(req,res) => {
//     try {
        
//         const {sort, order, limit } = req.body;
//         const products = await Product.find({})
//         .populate("category")
//         .populate("subs")
//         .sort([[sort, order]])//sort = createdAt/updateAt, order = desc/asc
//         .limit(limit)
//         .exec();

//         res.json(products);
//     }
//     catch(err) {
//         console.log(err);
//         return res.status(400).json(err.message);
//     }
// }
exports.list = async(req,res) => {
        try {
            const {sort, order, page } = req.body;
            const currentPage = page || 1;
            const displayPerPage = 3;
            const products = await Product.find({})
            .skip((currentPage-1) * displayPerPage) //skip number of products, exampple if currentPage=2, it will be (2-1)*3 which will skil the first 3 component and start from 4
            .populate("category")
            .populate("subs")
            .sort([[sort, order]])//sort = createdAt/updateAt, order = desc/asc
            .limit(displayPerPage)
            .exec();
    
            res.json(products);
        }
        catch(err) {
            console.log(err);
            return res.status(400).json(err.message);
        }
    }

exports.productCount = async(req,res) => {
    try {
        const total = await Product.find({}).estimatedDocumentCount().exec(); //count all document in collection
        return res.json(total);
    }
    catch (err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}
exports.productStar = async(req,res) => {
    try {
        const product = await Product.findById(req.params.productId).exec();
        const user = await User.findOne({email:req.user.email}).exec();
        //check if currently logged in user has alread added rating to this product
        const star = req.body.star;
        let checkExistingRatedUser = product.ratings.find((existingRatedUser)=> { //array.find method will return either the user object or undefined if not found
            return existingRatedUser.postedBy.toString()===user._id.toString()
        });
        console.log("***checkExistingRatedUser***",checkExistingRatedUser);
        //Push to rating array if user havent left rating, else update rating array
        if(checkExistingRatedUser === undefined) {

            let ratingAdded = await Product.findByIdAndUpdate(
                req.params.productId,
                {
                    $push:{ ratings: {star:star, postedBy:user._id} }//$push is to add to the document of array
                }, 
                {new:true}
            ).exec();
            console.log("**Rating Added**", ratingAdded);
            return res.json(ratingAdded);
        } else {
            const ratingUpdated = await Product.updateOne( //update based on rating and update the fields star in rating array
                {ratings: {$elemMatch: checkExistingRatedUser}},
                {$set:{"ratings.$.star":star}},
                {new:true}
            ).exec();
            console.log("**Rating Updated**", ratingUpdated);
            return res.json(ratingUpdated);
        }
        
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}
exports.listRelated = async(req,res) => {
    try {
        const product = await Product.findById(req.params.productId).exec();
        //find all products that have the same category exclude current product
        const related = await Product.find(
            {
                _id:{$ne: product._id},
                category:product.category
            }
        )
        .limit(3)
        .populate('category')
        .populate('subs')
        .populate('postedBy') 
        .exec();
    
        res.json(related);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
}

const handleQuery = async(req,res,query) => {
    const products = await Product.find(
        {$text : {$search:query}}
    ).populate("category","_id name")
    .populate("subs","_id name")
    .populate("postedBy", "_id name")
    .exec();
    console.log(products);
    res.json(products);
}
//gte = greater than, lte = less than price will be an array which sends the range of the price user wants to query
const handlePrice = async(req,res,price) => {
    try {
        let products = await Product.find({
            price:{
                $gte : price[0],
                $lte : price[1]
            }
        }).populate("category","_id name")
        .populate("subs","_id name")
        .populate("postedBy", "_id name")
        .exec();

        res.json(products);
    }
    catch (err) {
        console.log(err);
    }
}

const handleCategory = async (req,res,category) => {
    try {
        const products = await Product.find({category:category})
        .populate("category","_id name")
        .populate("subs","_id name")
        .populate("postedBy", "_id name")
        .exec();

        res.json(products);
    }
    catch (err) {
        console.log(err);
    }
}

const handleStar = async (req,res,stars) => {
    Product.aggregate([
        {
            $project: {
                document:"$$ROOT", //get access tot all fields in Product collection
                floorAverage : {
                    $floor:{$avg:"$ratings.star"} //get average star of each products 
                }
            }
        },
        {$match:{floorAverage:stars}} //match average with the star object passed in
    ])
    .limit(12)
    .exec((err, aggregateRes) => {
        if(err) {
            console.log("ERROR Aggregate Res : ", aggreagteRes);
            return res.status(400).json(err.message);
        } else {
            console.log("aggregateRes",aggregateRes);
            Product.find({_id:aggregateRes})
            .populate("category","_id name")
            .populate("subs","_id name")
            .populate("postedBy", "_id name")
            .exec((err,productRes) => {
                if(err) {
                    console.log("ERROR Product Res: ", productRes);
                    return res.status(400).json(err.message);
                } else {
                    res.json(productRes);
                }
            })
        }
    })
}

const handleSub = async (req, res, sub) => {
    try {
        const products = await Product.find({subs:sub})
        .populate("category","_id name")
        .populate("subs","_id name")
        .populate("postedBy", "_id name").exec();
        
        return res.json(products);
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

const handleShipping = async (req, res, shipping) => {
    try {
        const products = await Product.find({shipping:shipping})
        .populate("category","_id name")
        .populate("subs","_id name")
        .populate("postedBy", "_id name").exec();
        
        return res.json(products);
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

const handleColor = async (req, res, color) => {
    try {
        const products = await Product.find({color:color})
        .populate("category","_id name")
        .populate("subs","_id name")
        .populate("postedBy", "_id name").exec();
        
        return res.json(products);
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

const handleBrand = async (req, res, brand) => {
    try {
        const products = await Product.find({brand:brand})
        .populate("category","_id name")
        .populate("subs","_id name")
        .populate("postedBy", "_id name").exec();
        
        return res.json(products);
    }
    catch(err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
}

exports.searchFilters = async(req,res) => {
    
    const {query, price,category,stars,sub,shipping,color,brand} = req.body;
    if(query) {
        await handleQuery(req,res,query);
    }
    //price will be an array between [0,200] example $0-200
    if(price !== undefined) {
        console.log("price--->", price)
        await handlePrice(req,res,price);
    }
    if(category) {
        console.log("Category--->", category);
        await handleCategory(req,res,category);
    }
    if(stars) {
        console.log("Stars--->", stars);
        await handleStar(req,res,stars);
    }
    if(sub) {
        console.log("sub--->", sub);
        await handleSub(req,res,sub);
    }
    if(shipping) {
        console.log("shipping--->", shipping);
        await handleShipping(req,res,shipping);
    }
    if(color) {
        console.log("color--->", color);
        await handleColor(req,res,color);
    }
    if(brand) {
        console.log("brand--->", brand);
        await handleBrand(req,res,brand);
    }
    
}
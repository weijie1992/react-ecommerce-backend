const cloudinary = require("cloudinary");

//config
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

exports.upload = async(req,res) => {
    
    try{
        let result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `${Date.now()}`,
            resource_type:"auto"//jpeg, png
        });
        console.log(result);
        res.json({
            public_id:result.public_id,
            url:result.secure_url
        });
    }
    catch(err) {
        console.log(err);
        res.status(400).json(err);
    }
};

exports.remove = async(req,res) => {
    try{
        let image_id = req.body.public_id;
        let result = await cloudinary.uploader.destroy(image_id);
        console.log(result);
        res.send("ok");
    }
    catch(err) {
        return res.status(400).json({IsSuccess:"false",err});
    }
};
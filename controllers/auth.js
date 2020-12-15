const User = require("../models/user");

exports.createOrUpdateUser=async (req,res)=>{
   const {picture, email} = req.user;//destructure req.user from middleware/auth
   //console.log(name, picture, email);
   //check if user exist
   const user = await User.findOneAndUpdate(
       //find by Email
        {
            email:email
        },
        //update name and picture
        {
            name:email.split("@")[0],
           picture:picture
        },
        //this flag return the updated user record, without this flag it may not return the update user record
        {
            new:true
        }
   );
    //if user found in which is update
   if(user) {
       res.json(user);
   }
   //create user
   else {
       const newUser =await new User (
           {
               email:email,
               name:email.split("@")[0],
               picture:picture
           }
       ).save();
       res.json(newUser);
   }
};

exports.currentUser = async (req,res)=>{
    User.findOne({email:req.user.email}).exec((err,user)=> {
        if(err) {
            throw new Error(err);
        } 
        res.json(user);
    });
}

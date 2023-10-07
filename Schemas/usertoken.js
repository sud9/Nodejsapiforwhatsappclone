const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const usertokenschema = mongoose.Schema({
    userid:String,
    token:String,
    email:String,

})

// signupschema.pre('save',async function (next){   
//     if(this.isModified('password')){
//        this.password = await bcrypt.hash(this.password,12)
//     //    this.cpassword = await bcrypt.hash(this.cpassword,12)
//     }
//     next();
//   })
  module.exports= mongoose.model("usertoken",usertokenschema,"usertoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const signupschema = mongoose.Schema({
  name: String,
  phone: Number,
  password: String,
  Accesstoken: String,
  Refreshtoken: String,
  profileImage: String,
});

signupschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    //    this.cpassword = await bcrypt.hash(this.cpassword,12)
  }
  next();
});
module.exports = mongoose.model("signup", signupschema, "signup");

const mongoose = require("mongoose");

const usertokenschema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    passord: { type: String, required: true },
    is_online: { type: String, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("usertoken", usertokenschema, "usertoken");

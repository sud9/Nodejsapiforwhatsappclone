const express = require("express");
const multer = require("multer");
const {
  createaccunt,
  Loginapi,
  getapi,
  authenticationtoken,
  Refreshtoken,
  Storage,
} = require("../controller/apicontroller");

const app = express();
require("../Database/config");
app.use(express.json());

const upload = multer({ storage: Storage });
app.route("/create").post(upload.single("profileImage"), createaccunt);
app.route("/login").post(Loginapi);
app.route("/get").get(authenticationtoken, getapi);
app.route("/refresh-token").post(Refreshtoken);

module.exports = app;

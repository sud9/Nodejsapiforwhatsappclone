const create = require("../Schemas/Create");
const usertoken = require("../Schemas/usertoken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { decode } = require("punycode");
const fs = require("fs");
const path = require("path");
const con = require("./env");
const multer = require("multer");
require("dotenv").config();
// const secretkey= process.env.ACCESS_TOKEN_SECRET
const secretkey = con.ACCESS_TOKEN_SECRET;
const refreshsecret = con.REFRESH_TOKEN_SECRET;

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
// const paths = "env";

function generateAccessToken(payload, mysecret, expire) {
  return jwt.sign(payload, mysecret, { expiresIn: expire }); // Set the token expiration time (e.g., 15 minutes)
}

const authenticationtoken = async (req, res, next) => {
  const token = req.headers["authorization"];
  try {
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    } else {
      console.log(token);
      const tokenBearer = token.split(" ");
      const tokenValue = tokenBearer[1];
      const access = jwt.verify(tokenValue, secretkey);
      // req.tokenValue = access
      next();

      // console.log(access)
    }
  } catch (e) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

//   jwt.verify(token,secretkey);
// res.send('de')
//     const token = req.headers['authorization'];

//     if (!token) {
//       return res.status(401).json({ error: 'Token not provided' });
//     }else{
//         // Extract the token from the 'Authorization' header
//     const tokenBearer = token.split(' ');
//     const tokenValue = tokenBearer[1];
//     req.token =tokenValue;
//   next()
//     }
// }

const createaccunt = async (req, resp) => {
  let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
  let passcoderegex = new RegExp(
    "^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[d]){1,})(?=(.*[W]){1,})(?!.*s).{8,}$"
  );
  const { name, phone, password } = req.body;
  const profileImage = req.file ? req.file.filename : "";
  if (!name || !phone || !password) {
    return resp.status(401).json({ error: "Please fill all the fields" });
  }
  try {
    const userexist = await create.findOne({ phone: phone });
    if (userexist) {
      return resp.status(409).json({ error: "User already Exist" });
    }

    let newUser = new create({
      name,
      phone,
      password,
      Refreshtoken: "",
      Accesstoken: "",
      profileImage: profileImage,
    });
    let result = await newUser.save();
    resp
      .status(201)
      .json({ message: "USer Created Successfully", response: { result } });
    resp.send(result);
    console.log(result);
  } catch (err) {
    console.log(err);
    //   resp.status(500).json({error:"Internal Server Error"})
  }
};

const Refreshtoken = async (req, resp) => {
  const { refreshtok } = req.body;
  const refreshvalid = "7d";
  const accessvalid = "20s";
  if (!refreshtok) {
    return resp.status(401).json({ error: "Please Enter a valid token" });
  }
  try {
    const decoded = jwt.verify(refreshtok, refreshsecret);
    if (decoded) {
      const user = await create.findOne({ Refreshtoken: refreshtok });
      if (user) {
        var newSecret_jwt = crypto.randomBytes(64).toString("hex");
        var newSecret_jwt2 = crypto.randomBytes(64).toString("hex");
        fs.readFile("controller/env.js", "utf-8", function (err, data) {
          if (err) throw err;
          var newValue = data.replace(
            new RegExp(secretkey, "g"),
            newSecret_jwt
          );
          fs.writeFile(
            "controller/env.js",
            newValue,
            "utf-8",
            function (err, data) {
              if (err) throw err;
              console.log("done");
            }
          );
        });
        const payload = {
          userId: decoded.userId,
          name: decoded.name,
          email: decoded.email,
        };
        const accesstoken = generateAccessToken(
          payload,
          newSecret_jwt,
          accessvalid
        );
        const refreshtoken = generateAccessToken(
          payload,
          refreshsecret,
          refreshvalid
        );
        resp
          .status(200)
          .json({ accesstoken: accesstoken, Refreshtoken: refreshtoken });
        await create.findByIdAndUpdate(
          user._id,
          { Refreshtoken: refreshtoken, Accesstoken: accesstoken },
          console.log("update")
        );
        // console.log("Token Verified",refreshtok)
      } else {
        resp.status(400).send({ message: "User not found" });
      }
    } else {
      console.log("Token Verified failed");
    }
  } catch (e) {
    resp.status(400).send({ message: "Error in generating" });
  }
};

const Loginapi = async (req, resp) => {
  const { phone, password } = req.body;
  const refreshvalid = "7d";
  const accessvalid = "7d";
  try {
    const user = await create.findOne({ phone });
    if (!user) {
      resp.status(400).json({ error: "Invalid phone or password" });
      return;
    }
    const passwordmatch = await bcrypt.compare(password, user.password);
    if (passwordmatch) {
      const payload = {
        userId: user._id,
        name: user.name,
        phone: user.phone,
      };
      const accesstoken = generateAccessToken(payload, secretkey, accessvalid);
      const refreshtoken = generateAccessToken(
        payload,
        refreshsecret,
        refreshvalid
      );

      let alluser = await create.findOne({ phone: phone });
      if (alluser) {
        await create.findByIdAndUpdate(user._id, {
          Refreshtoken: refreshtoken,
          Accesstoken: accesstoken,
        });
        console.log(process.env.NAME);
      } else {
        null;
        // let data = new create({
        //     // userid:user._id,
        //     Accesstoken:accesstoken,
        //     Refreshtoken:refreshtoken
        // });
        //  await data.save();
        //  console.log("ff") Hawaa Banai Thadi re Meri sudhir gupta si boddy re
      }

      resp.status(200).json({
        message: "Login successful",
        data: { phone: user.phone, id: user._id },
        Accesstoken: accesstoken,
        Refreshtoken: refreshtoken,
        secretkey,
      });
    } else {
      resp.status(200).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error finding user:", error);
    resp.status(400).json({ error: "Internal server error" });
  }
};

const getapi = async (req, resp) => {
  let data = await create.find();
  resp.send(data);
};

module.exports = {
  createaccunt,
  Loginapi,
  getapi,
  authenticationtoken,
  Refreshtoken,
  Storage,
};

const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const sharp = require("sharp");
const multer = require("multer");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/account"); // using destructuring
const router = new express.Router();
////*****User******************* */
///*create///////
router.post("/users", async (req, res) => {
  // post is uses to send info to server from client
  //console.log(req.body); // to show the data that posted from client in the console
  const user = new User(req.body);
  try {
    // because if catch work the await will return and stop the compilation so we use try and catch to go to catch if an error occur
    await user.save(); // we must save it before make it token because taken function will insert to it after he create in database
    sendWelcomeEmail(user.email, user.name); //L132 to sending a welcome email message to new users
    const token = await user.generateAuthToken();
    await res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({
      error: e.message,
      message1: process.env.MONGODB_URL,
      message1: process.env.PORT,
      message1: process.env.JWT_SECRET,
    }); // 400 --> bad request
  }
  //that is an old way know using promises we know use async and await
  // user
  //   .save()
  //   .then(() => {
  //     res.status(201).send(user); // the code  mean that created statement
  //   })
  //   .catch((error) => {
  //     // res.status(400); // to change the status in server to make like there is an error
  //     //res.send(error);
  //     res.status(400).send(error);
  //   });
});
//L105
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      // we will create this function is user model he is not built in function from mongoose
      req.body.email,
      req.body.password
    );
    // L107
    const token = await user.generateAuthToken(); // we use to take token for specific user to we not use User and not already build in mongoose its similar to above function
    res.send({ user: user.getPublicProfile(), token }); // we coded this function in model file (manual way)
  } catch (e) {
    res.status(400).send(e.message);
  }
});
//L111
// to log out from one account on one device so we gonna remove the token of your device only
router.post("/users/logout", auth, async (req, res) => {
  try {
    // to logout from one device
    req.user.tokens = req.user.tokens.filter((token) => {
      // to filter the tokens array and remove the token that we use it to login
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("you logout successfully");
  } catch (e) {
    res.status(500).send();
  }
});
// if you want to remove all accounts that register to your account from all devices like phone,laptop etc
router.post("/users/logoutAll", auth, (req, res) => {
  // to logout from all devices
  try {
    req.user.tokens = [];
    req.user.save();
    res.status(200).send("your account is logged out from all devices");
  } catch (e) {
    res.status(500).send();
  }
});

///*read///////
router.get("/users/me", auth, async (req, res) => {
  // we use auth to first run our middleware and then handler the method we just don't do this in post method because the user will not have the token yet it generates in this method
  res.send(req.user); // we will return the user profile after auth so don't have to insert his id
});
///* we replace it by using token and authentication instead and we will replace all the using of id to using authentication
// router.get("/users/:id", async (req, res) => {
//   //  to request a input from client id(route parameter) its provided RestApi
//   // console.log(req.params); // use it we can fitch and get access the all records like id the client is provided in Url
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);
//     if (!user) return res.status(404).send(); // 404--> user not found
//     res.send(user);
//   } catch (e) {
//     res.status(500).send(); // an Internal server Error
//   }
// });
///*update///////
router.patch("/users/me", auth, async (req, res) => {
  // patch it used to update a record in database
  // in general the update is more complex code
  // we doing that to provide the user that the field he want to update is not exist in user document like heigh the mongodb is by default ignore this request and prevent it but here we want send a message to user if that error occur so we do that
  const updates = Object.keys(req.body); // to get the keys of object that user want to update
  const allowedUpdates = ["name", "email", "password", "age"]; // the allowed updates that user can update
  const isValidOperation = updates.every((update) => {
    // to put every index of updates array to pass to callback function
    // to check if all updates that user want to update is exist in allowed updates
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation)
    return res.status(400).send({ error: "invalid updates!" });
  try {
    //const user = await User.findById(req.params.id);
    updates.forEach((updates) => {
      req.user[updates] = req.body[updates];
      // he we pass all the field of the updated user to the previous so we can update it and know can save it
    });
    await req.user.save(); // so here we can use middleware features

    // we comment it because middleware is not work when we use this function to pre save function so we used little traditional way
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidator: true,
    // }); // this option to make sure that the new update user will return to constant user and all validation steps will complete on this update because maybe in update you wanna broke the rules or update something you can't updated like id or update features that is not exist in user like height
    //if (!user) return res.status(404).send(); // for if the client enter an id is not exist
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
///***delete */
router.delete("/users/me", auth, async (req, res) => {
  try {
    // old way depending on delete by id
    //const user = await User.findByIdAndDelete(req.params.id);
    // if (!user) return res.status(404).send();
    sendCancellationEmail(req.user.email, req.user.name);
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
///****file uploading */
//L123
const upload = multer({
  // dest: "avatar", we remove it because we no longer want store our data in file know we wanna store it in user database
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
      return cb(new Error("you must insert a photo"));
    cb(undefined, true);
  },
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    //req.user.avatar = req.file.buffer; // this line is the instead of dest property it store the file in user database
    //L129
    // know we will use sharp npm to customize our photo
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer(); // equal to line 157
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    //L126
    //*error handling so no more html file will out to client
    res.status(400).send({ error: error.message });
  }
);
router.delete(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = undefined; // to remove the profile photo
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
    next();
  }
);
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error();
    res.set("Content-Type", "image/png"); // to tell the user what is the type of data we wanna back it's by default to json file
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;

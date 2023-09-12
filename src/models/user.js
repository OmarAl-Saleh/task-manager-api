const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const userSchema = new mongoose.Schema(
  {
    // we use schema to can use middleware to make pre post operations on the user info such as hashing the password
    // to customize the name age with validation condition
    name: {
      type: String,
      required: true,
      trim: true, // to remove the spaces
    },
    age: {
      // we make it optional
      type: Number,
      default: 0, // to give default value to age
      validate(value) {
        // the value is the number inserted by user
        if (value < 0) throw new Error("Age must be a positive number"); // to throw the error and stop the process
      },
    },
    email: {
      type: String,
      unique: true, // to make the email unique so no more than one user can have same email
      required: true,
      lowercase: true, // to make the email in lower case
      trim: true, // to remove the spaces
      validate(value) {
        if (!validator.isEmail(value)) {
          // the function return false is the email is not valid
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        // we can use it instead of minlength property
        // if (value.length < 6)
        //   throw new Error("the password must have more than six characters");
        if (value.toLowerCase().includes("password"))
          throw new Error("using a key password prohibited");
      },
    },
    tokens: [
      // its an object for each user that is mean we can use a lot of features inside but we know use only one
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      //L127
      // to can store the images and files as a binary code in user database
      type: Buffer,
    },
  },
  {
    // L118
    timestamps: true, // to add two new fields to user database which are createdAt & updatedAt to know the time
  }
);
//L114
userSchema.virtual("tasks", {
  // its like foreign key to link the user and his tasks but its virtual because it will store in tasks database
  ref: "Task",
  localField: "_id", // the name of field on user that we use as foreign key
  foreignField: "owner", // the the name of field on tasks that make a relationship as foreign key
});

//L107
// methods used when we deal with instance not all the model user
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user.id.toString() /*primary key*/ },
    process.env.JWT_SECRET
  );
  user.tokens = user.tokens.concat({ token: token }); // we use this function to insert the generated token to the instance user
  await user.save();

  return token;
};

//L112
// this is the manual method that you have to called this function whenever you wanna hide the password and token
userSchema.methods.getPublicProfile = function () {
  const user = this;
  const userObject = user.toObject(); // to get the raw object with our data its like a template
  delete userObject.password; // to delete the password from the object
  delete userObject.tokens;

  return userObject;
};
//this is the auto method that whenever you call user the function will work automatically
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject(); // to get the raw object with our data its like a template
  delete userObject.password; // to delete the password from the object
  delete userObject.tokens;
  delete userObject.avatar; // because this files are large and it will slow the system

  return userObject;
};
// L 105
// static used when we deal with model like all user not just an instance
userSchema.statics.findByCredentials = async (email, password) => {
  // static method that will be called from anywhere and this method will take two parameters which are email & password
  // we name this static as findByCredential use this name where ever in project use it runs here
  const user = await User.findOne({ email }); // we use this function to find the user by email
  if (!user) throw new Error("Unable to login"); // if the user is not exist
  const isMatch = await bcrypt.compare(password, user.password); // we use this function to compare the password that user entered with the password in database
  if (!isMatch) throw new Error("Unable to login"); // if the password is not match
  return user; // that is our design to return user to router
};
// we need to user middleware on schema
// L104 --> hash the plain text password before saving
userSchema.pre("save", async function (next) {
  // we pre to run this function before save function run if we want after it we use post
  // to use the this keyword we must use the normal function not arrow function
  const user = this; // we use this to give use access to the currently user that we will save it
  if (user.isModified("password")) {
    // This function will be true if a this user is been created new with password or modified the password
    user.password = await bcrypt.hash(user.password, 8);
  }
  next(); // we call it to tell compiler run the save function we end if we do not use it it will hang for ever
});
//L116
// to delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id }); // to delete all tasks that have the same foreign key in user
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
// const me = new User({
//   name: "   Andrew", // the compiler will remove the spaces
//   age: 26,
//   email: "Omar@gmaiL.com", // the compiler will make it lowercase
//   password: "omar is the best",
// });
// me.save()
//   .then(() => {
//     console.log(me);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

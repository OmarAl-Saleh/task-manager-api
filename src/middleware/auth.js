const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = async (req, res, next) => {
  try {
    // to fetch the header value that provide in url the header is what come after ?
    const token = req
      .header("Authorization")
      .replace("Bearer " /*be attention to space after bearer */, ""); // replace to omit a string bearer to have only the token ;
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // to know if the token valid and return it if valid or error to catch
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    }); // to find the user who is have the id the token we want to we use token for if is log out it will still valid to use
    if (!user) throw new Error("inter findOne"); // if user not found to branch direct to catch
    req.token = token; // to give access to use token we just auth and send it to req in router in logout
    req.user = user; // to give access to use user we just auth and send it to req in router
    next();
  } catch (e) {
    res
      .status(401)
      .send({
        error: "Please authenticate.",
        message: process.env.MONGODB_URL,
      });
  }
};
module.exports = auth;

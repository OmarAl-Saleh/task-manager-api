const mongoose = require("mongoose");
//process.env.MONGODB_URL
mongoose.connect(process.env.MONGODB_URL, {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false, // to prevent DeprecationWarning
});

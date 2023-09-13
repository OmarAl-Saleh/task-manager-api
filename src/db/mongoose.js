const mongoose = require("mongoose");
//process.env.MONGODB_URL
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  //useCreateIndex: true,// facing a lot of trouble because of you
  //useFindAndModify: false, // to prevent DeprecationWarning
  //useUnifiedTopology: true,
});

const express = require("express");
require("./db/mongoose"); // for ensure that database is run
const app = express();
const userRouter = require("./router/user"); // to link router to main file we use the term of router to decomposite the index file
const taskRouter = require("./router/task");

const port = process.env.PORT; // we set a local environment variable in config file

app.use(express.json()); // here we convert each we will get to object by parse it and use it in req parameter
app.use(userRouter); // to link user router
app.use(taskRouter); // to link task router
app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// //***JWT */
// //*L 106
// const jwt = require("jsonwebtoken");
// const myFunction = async () => {
//   const token = jwt.sign({ _id: "abc1234" }, "thisismynewcourse", {
//     expiresIn: "1 second", // this time is measure when pass from sign to handle some thing on it like verify if it expire we will have error
//   });
//   console.log(token);
//   const data = jwt.verify(token, "thisismynewcourse"); // if signature not the same we have an error
//   console.log(data);
// };
// myFunction();

//**L108
// without middleware: new request --> run route handler
// with middleware: new request --> something(function bellow in use)---> run route handler
// like this if you wanna disable the server for maintenance
// app.use((req, res, next) => {
//   if (true) res.status(503).send("Site is currently down. Check back soon!");
//   else next(); // you can omit it
// });
// know we will make middleware function in separate file to do authentication token

//**L123 */
// const multer = require("multer");
// const upload = multer({
//   dest: "images", // to create the file images and insert to any uploads by the middleware function bellow
//   limits: {
//     fileSize: 1000000, // to make the max file size equal million bytes or megabyte
//   },
//   fileFilter(req, file, cb /*call back */) {
// to make the file filter
// cb(new Error("you must upload pdf file")); to throw an error
// cb(undefined, true) to allow and pass the file
// cb(undefined, false) to reject the file uploaded
//  /* if (!file.originalname.endsWith("pdf")) {
// return cb(new Error("you must insert a pdf file"));
// } */
//     if (
/*      !file.originalname.match(*/
//         /\.(doc|docx)$/
//       ) /*that is a regular expression as we learn in python lab  in bookmark you will find a website to simulate it before you using in your program */
//     ) {
//       return cb(new Error("you must insert a word file"));
//     }
//     cb(undefined, true);
//   },
// });
// app.post(
//   "/upload",
//   upload.single("upload"),
//   (req, res) => {
//     res.send();
//   },
//   //*L126 handling errors
//   (error, req, res, next) => {
//     // to handle the error so no more html file will appear to client
//     res.status(400).send({ error: error.message });
//     next();
//   }
// );

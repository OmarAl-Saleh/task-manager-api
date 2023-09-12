const mongoose = require("mongoose");

///********Task *******/
const taskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      // to make the relation between task and user
      type: mongoose.Schema.Types.ObjectId, // to identify that the type is objectid
      required: true,
      ref: "User", // to make a reference from another model you must inter the model name right
    },
  },
  {
    timestamps: true,
  }
);
const task = mongoose.model("Task", taskSchema);
module.exports = task;
// const task1 = new Task({
//   description: "  fix the laptop",
//   //completed: false,
// });

// task1
//   .save()
//   .then(() => {
//     console.log(task1);
//   })
//   .catch((error) => {
//     console.log();
//   });

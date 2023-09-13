const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

////****Task*********f**/ */
router.post("/tasks", auth, async (req, res) => {
  console.log("this is req body: ", req.body);
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body, // the three dots are used to copy all the body of the new task here in json or model form
    owner: req.user._id, // to make the relation between task and user
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});
///*read//*
// GET /tasks?completed=false
// GET /tasks?limit=10&skip=0 --> will display the first ten skip=10 will displays the second tens record so it skipped the first 10 record
// GET / tasks?sortBy:createdAt:desc(asc)
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    //L119
    match.completed = req.query.completed == "true";
  }
  if (req.query.sortBy) {
    // to split the createdAt:desc by : to insert the parts as property to sort object
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // ternary method (comparison method)
  }
  try {
    //const task = await Task.find({ owner: req.user._id }); this line is right but we have another method using the foreign key
    //L114
    // await req.user.populate("tasks").execPopulate(); // this will print all tasks that have the same foreign key in user

    await req.user
      .populate({
        path: "tasks",
        match, // can be used to filtering to customize the completed L119
        options: {
          // can be used for pagination and sorting L120
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
          //L121
          // sort: {
          // to sort the records by anything you want and in descending(-1) desc or ascending(1) asc
          //createdAt: -1, // to sort by the time of creation desc
          //   completed: -1, // to sort by the completed field desc in string comparison desc will be true
          // },
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
router.get("/tasks/:id", auth, async (req, res) => {
  const taskId = req.params.id;
  try {
    //const task = await Task.findById(taskId);
    const task = await Task.findOne({ _id: taskId, owner: req.user._id }); // to return the task that make by the user that authenticated only
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});
///***update */
router.patch("/tasks/:id", auth, async (req, res) => {
  const taskId = req.params.id;
  // update field verification
  const allow = ["completed", "description"];
  const update = Object.keys(req.body);
  const isValid = update.every((update) => {
    return allow.includes(update);
  });
  if (!isValid) return res.status(400).send({ error: "invalid update!" });
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    update.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send();
  }
});
///**delete */
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    //const task = await Task.findByIdAndDelete(req.params.id);
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;

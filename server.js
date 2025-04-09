const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // for uploaded file access

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

let tasks = [];

app.post("/tasks", (req, res) => {
  const { name, description, dueDate, xp } = req.body;
  const newTask = {
    id: uuidv4(),
    name,
    description,
    dueDate,
    xp,
    status: "Pending",
    createdAt: new Date(),
    submittedFile: null,
    submissionText: null,
  };
  tasks.push(newTask);
  res.json(newTask);
});

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, dueDate, xp } = req.body;
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.name = name;
    task.description = description;
    task.dueDate = dueDate;
    task.xp = xp;
    res.json(task);
  } else {
    res.status(404).send("Task not found");
  }
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id !== id);
  res.sendStatus(204);
});

app.post("/tasks/:id/review", (req, res) => {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.status = "Reviewed";
    res.json(task);
  } else {
    res.status(404).send("Task not found");
  }
});

app.post("/tasks/:id/submit", upload.single("file"), (req, res) => {
  const { id } = req.params;
  const submissionText = req.body.text || null;
  const file = req.file ? `/uploads/${req.file.filename}` : null;

  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.status = "Submitted";
    task.submissionText = submissionText;
    task.submittedFile = file;
    res.json(task);
  } else {
    res.status(404).send("Task not found");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

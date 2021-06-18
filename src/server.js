const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const morganLogger = require("morgan");
app.use(morganLogger("dev"));

app.use("/command", require("./api/command.route"));

app.get("/check", async (req, res) => {
  res.send("ok");
});

module.exports = app;

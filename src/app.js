const express = require("express");
const app = express();

app.use(require("cors")());
app.use(require("morgan")("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/telemetry", require("./routes/telemetry.route"));
app.use("/provision", require("./routes/provision.route"));
app.get("/status", (_, res) => res.sendStatus(200));
app.use("*", (_, res) => res.sendStatus(404));

module.exports = app;

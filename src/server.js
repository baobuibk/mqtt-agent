const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/down/command", handleCommand);

const MQTT = require("./mqtt");

function handleCommand(req, res) {
  const { data, entity: id } = req.body;

  console.log("data", data);

  MQTT.publish(`down/command/${id}`, data);

  res.send("ok");
}

module.exports = app;

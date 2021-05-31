const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/downstream/command/:id", handleCommand);

app.get("/downstream/provision/:id", (req, res) => {
  const { id } = req.params;

  let message = {
    provisionStatus: "SUCCESS",
  };
  MQTT.publish(`downstream/provision/${id}`, message);

  return res.send("ok");
});

const MQTT = require("./mqtt");

function handleCommand(req, res) {
  const { id } = req.params;
  const { data } = req.body;

  console.log(data);
  MQTT.publish(`downstream/command/${id}`, data);

  res.send("ok");
}

app.get("/test/mqtt", (req, res) => {
  const id = "608a78baaa969877dec4e6f4";

  const message = { a: 1 };
  MQTT.publish(`upstream/provision/${id}`, message);
});

module.exports = app;

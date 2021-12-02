const express = require("express");
const router = express.Router();

const MQTT = require("../mqtt");

router.post("/:id", (req, res) => {
  const { id } = req.params;

  const { data, id } = req.body;
  console.log("command request from ... for", apikey);
  MQTT.publish(`down/command/${apikey}`, data);
  res.send("ok");
});

module.exports = router;

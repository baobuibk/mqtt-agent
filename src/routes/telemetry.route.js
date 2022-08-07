const express = require("express");
const router = express.Router();
// const debug = require("debug")("telemetry.route");
const debug = console.log;

const TeCon = require("../controllers/telemetry.controller");

router.post("/:gatewayId", async (req, res) => {
  const { gatewayId } = req.params;
  try {
    const result = await TeCon.request(gatewayId, req.body);
    return res.json(result);
  } catch (error) {
    debug(error.message);
    return res.sendStatus(500);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const TelemetryController = require("../controllers/telemetry.controller");

router.post("/", TelemetryController.request);
router.post("/gateway", TelemetryController.requestGateway);

module.exports = router;

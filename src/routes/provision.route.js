const express = require("express");
const router = express.Router();
const debug = require("debug")("provision.route");

const ProCon = require("../controllers/provision.controller");

const PROVISION_TIMEOUT = Number(process.env.PROVISION_TIMEOUT) || 120;

router.post("/:gatewayId", async (req, res) => {
  const { gatewayId } = req.params;
  try {
    const result = await ProCon.request(gatewayId, req.body);
    return res.json(result);
  } catch (error) {
    debug(error.message);
    return res.sendStatus(500);
  }
});

router.get("/:gatewayId/begin", async (req, res) => {
  const { gatewayId } = req.params;
  redisClient.set(`provision.${gatewayId}`, "any", "EX", PROVISION_TIMEOUT);
});

router.get("/:gatewayId/end", async (req, res) => {
  const { gatewayId } = req.params;

  redisClient.exists(gatewayId, (err, reply) => {
    if (err) return res.sendStatus(500);
    redisClient.del(gatewayId, (err, reply) => {
      if (err) return res.sendStatus(500);
      res.send({ status: "OK" });
    });
  });
});

module.exports = router;

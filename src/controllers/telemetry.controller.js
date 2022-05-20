const axios = require("axios");
const cbUrl = process.env.CONTEXT_BROKER_URL || "http://localhost:8000";
const debug = require("debug")("telemetry.controller");

class TelemetryController {
  static async request(gatewayId, data) {
    return Promise.all(
      data.map(
        async ({ id, _id, deviceId, entityId, ...channels }) =>
          await axios
            .patch(
              `${cbUrl}/entity/${deviceId || id || _id || entityId}`,
              makeUpdates(channels)
            )
            .then((res) => res.data)
      )
    );
  }
}

function makeUpdates(input) {
  let updates = {};
  for (const key in input) {
    updates[key] = { value: input[key] };
  }
  return updates;
}

module.exports = TelemetryController;

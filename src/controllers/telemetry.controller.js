const axios = require("axios");
const cbUrl = process.env.CONTEXT_BROKER_URL || "http://localhost:8000";
// const debug = require("debug")("telemetry.controller");

const ContextPublisher = require("../ContextPublisher");
const conPub = new ContextPublisher();

class TelemetryController {
  static async request(gatewayId, data) {
    return Promise.all(
      data.map(async ({ _id, id, deviceId, timestamp, ...channels }) => {
        const entityId = _id || id || deviceId;
        for (const key in channels) {
          conPub.publish(
            `telemetry.${entityId}.${key}`,
            JSON.stringify({ value: channels[key], timestamp: timestamp })
          );
        }
        return await axios
          .patch(`${cbUrl}/entity/${entityId}`, makeUpdates(channels))
          .then((res) => res.data);
      })
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

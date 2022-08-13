const axios = require("axios");
const CONTEXT_BROKER_HOST = process.env.CONTEXT_BROKER_HOST || "localhost";
const CONTEXT_BROKER_PORT = process.env.CONTEXT_BROKER_PORT || 8000;
const CONTEXT_BROKER_URL = process.env.CONTEXT_BROKER_URL;
const cbUrl =
  CONTEXT_BROKER_URL ||
  "http://" + CONTEXT_BROKER_HOST + ":" + CONTEXT_BROKER_PORT;

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const redisUrl = "redis://" + REDIS_HOST + ":6379";
const { createClient } = require("redis");
const redisClient = createClient({ url: redisUrl });
redisClient.on("connect", () => console.log("redis client connect"));
redisClient.connect();
const { IoTProducer } = require("node-iot-lib");
const producer = new IoTProducer(redisClient);

class TelemetryController {
  static async request(gatewayId, data) {
    return Promise.all(
      data.map(async ({ _id, id, deviceId, timestamp, ...channels }) => {
        const entityId = _id || id || deviceId;
        for (const key in channels) {
          producer.publish(
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

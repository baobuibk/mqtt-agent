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

class ProvisionController {
  static async request(gatewayId, data) {
    const foundGateway = await axios
      .get(`${cbUrl}/entity/${gatewayId}`, {
        params: { fields: "refSite" },
      })
      .then((res) => res.data);
    if (!foundGateway) return data.map(() => null);

    const result = await Promise.all(
      data.map(async (device) => {
        let entity = {
          ...device,
          type: { type: "string", value: "Device" },
          refGateway: { type: "string", value: gatewayId },
          refSite: { type: "string", value: foundGateway.refSite?.value || "" },
        };

        let query = {};
        for (const [key, data] of Object.entries(entity)) {
          if (data.value !== undefined) query[key] = data.value;
        }

        return (
          (
            await axios
              .get(`${cbUrl}/entity`, { params: { query } })
              .then((res) => res.data)
          )[0] ||
          (await axios.post(`${cbUrl}/entity`, entity).then((res) => res.data))
        );
      })
    );

    producer.publish(
      `provision.${gatewayId}`,
      JSON.stringify({ value: true, timestamp: new Date() })
    );

    return result.map((entity) => {
      return {
        deviceId: entity._id,
        deviceName: entity.deviceName?.value || null,
        name: entity.name?.value || null,
      };
    });
    // return result;
  }
}

module.exports = ProvisionController;

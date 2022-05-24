const axios = require("axios");
const cbUrl = process.env.CONTEXT_BROKER_URL || "http://localhost:8000";
// const debug = require("debug")("provision.controller");

const ContextPublisher = require("../ContextPublisher");
const conPub = new ContextPublisher();

class ProvisionController {
  static async request(gatewayId, data) {
    const result = await Promise.all(
      data.map(async (device) => {
        let entity = {
          ...device,
          type: { type: "string", value: "Device" },
          refGateway: { type: "string", value: gatewayId },
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

    conPub.publish(
      `provision.${gatewayId}`,
      JSON.stringify({ value: true, timestamp: new Date() })
    );

    return result;
  }
}

module.exports = ProvisionController;

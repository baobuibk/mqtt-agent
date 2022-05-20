const axios = require("axios");
const cbUrl = process.env.CONTEXT_BROKER_URL || "http://localhost:8000";
const debug = require("debug")("provision.controller");

class ProvisionController {
  static request(gatewayId, data) {
    return Promise.all(
      data.map(async (device) => {
        let entity = {
          ...device,
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
  }
}

module.exports = ProvisionController;

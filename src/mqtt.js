const mqtt = require("mqtt");
const axios = require("axios");
// const debug = require("debug")("mqtt.js");
const debug = console.log;

const ProCon = require("./controllers/provision.controller");
const TeCon = require("./controllers/telemetry.controller");

let client = mqtt.connect(process.env.MQTT_BROKER_URL || "mqtt://localhost");

client.on("error", (error) => debug("error", error.message));

client.on("connect", () => {
  debug("connect");

  topicsArr = ["up/status/+", "up/provision/+", "up/telemetry/+"];
  client.subscribe(topicsArr, (error) => {
    if (error) return debug("error", error.message);
  });
});

client.on("message", (topic, msgBuff) => {
  // msgBuff is a buffer, so convert it to string
  const msgStr = msgBuff.toString();

  const topicParts = topic.split("/");

  const type = topicParts[1];
  const gatewayId = topicParts[2];

  switch (type) {
    case "provision":
      return handleProvision(gatewayId, msgStr);
    case "telemetry":
      return handleTelemetry(gatewayId, msgStr);
    case "status":
      return handleStatus(gatewayId, msgStr);
    default:
      debug("Unrecognized topic:", topic);
      break;
  }
});

async function handleProvision(gatewayId, msgStr) {
  debug("provision");
  const downTopic = `down/provision/${gatewayId}`;

  try {
    const msgObj = JSON.parse(msgStr);
    const result = await ProCon.request(gatewayId, msgObj);
    debug(result);
    client.publish(downTopic, JSON.stringify(result));
  } catch (error) {
    debug(error.message);
  }
}

async function handleTelemetry(gatewayId, msgStr) {
  debug("telemetry");
  const downTopic = `down/telemetry/${gatewayId}`;

  try {
    const msgObj = JSON.parse(msgStr);
    const result = await TeCon.request(gatewayId, msgObj);
    debug(result);
    client.publish(downTopic, JSON.stringify(result));
  } catch (error) {
    debug(error.message);
  }
}

function handleStatus(gatewayId, message) {
  debug("check status from", gatewayId);
  const downTopic = `down/status/${gatewayId}`;
  client.publish(downTopic, message);
}

module.exports = client;

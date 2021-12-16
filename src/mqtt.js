const mqtt = require("mqtt");
const axios = require("axios");
const debug = require("debug")("mqttagent");

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const CONTEXT_BROKER_URL = process.env.CONTEXT_BROKER_URL;

let client = mqtt.connect(MQTT_BROKER_URL, {
  reconnectPeriod: 0,
});

client.on("error", (error) => {
  console.log("mqtt client error:", error.message);
});

client.on("connect", () => {
  console.log("connected to mqtt broker");

  topicsArr = ["up/status/+", "up/provision/+", "up/telemetry/+"];
  client.subscribe(topicsArr, (error) => {
    if (error) return console.log("mqtt error subscribe to topics");

    console.log("mqtt subscribed to topics");
  });
});

client.on("message", (topic, msgBuff) => {
  // msgBuff is a buffer, so convert it to string
  const msgStr = msgBuff.toString();

  const firstSlash = topic.indexOf("/");
  const secondSlash = topic.indexOf("/", firstSlash + 1);

  const type = topic.slice(firstSlash + 1, secondSlash);
  const apikey = topic.slice(secondSlash + 1);

  switch (type) {
    case "provision":
      return handleProvision(apikey, msgStr);
    case "telemetry":
      return handleTelemetry(apikey, msgStr);

    case "status":
      return handleCheckStatus(apikey, msgStr);
    default:
      console.log("mqtt topic not recognized");
      break;
  }
});

async function handleProvision(apikey, msgStr) {
  console.log("provision from", apikey);
  const downTopic = `down/provision/${apikey}`;

  try {
    const msgObj = JSON.parse(msgStr);
    let result = await axios
      .post(CONTEXT_BROKER_URL + "/api/provision/request", msgObj)
      .then((res) => res.data);
    debug(result);
    client.publish(downTopic, JSON.stringify({ ok: 1, result }));
  } catch (error) {
    debug(error.message);
    client.publish(downTopic, JSON.stringify({ ok: 0 }));
  }
}

async function handleTelemetry(apikey, msgStr) {
  debug("telemetry from", apikey);
  const downTopic = `down/telemetry/${apikey}`;

  try {
    const msgObj = JSON.parse(msgStr);
    let result = await axios
      .post(CONTEXT_BROKER_URL + "/api/entity/telemetry/gateway", msgObj)
      .then((res) => res.data);
    debug(result);
    client.publish(downTopic, JSON.stringify({ ok: 1, result }));
  } catch (error) {
    debug(error.message);
    client.publish(downTopic, JSON.stringify({ ok: 0 }));
  }
}

function handleCheckStatus(apikey, message) {
  console.log("check status from", apikey);
  const downTopic = `down/status/${apikey}`;
  MQTT.publish(downTopic, message);
}

module.exports = client;

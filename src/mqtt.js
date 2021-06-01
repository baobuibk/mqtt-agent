const mqtt = require("mqtt");
const axios = require("axios");

let client;
const CONTEXT_BROKER_URL = process.env.CONTEXT_BROKER_URL;

class MQTT {
  static connect(mqttBrokerUrl) {
    if (client) return;
    client = mqtt.connect(mqttBrokerUrl || "mqtt://localhost");
    client.on("connect", connectCB);
    client.on("message", messageCB);
  }

  static publish(topic, message) {
    let msgStr =
      typeof message === "string" ? message : JSON.stringify(message);

    client.publish(topic, msgStr, (error) => {
      if (error) return console.error(error);
      console.log("published to", topic);
    });
  }

  static subscribe(topic) {
    client.subscribe(topic, (error) => {
      if (error) return console.error(error);
      console.log("subscribed to", topic);
    });
  }

  static unsubscribe(topic) {
    client.unsubscribe(topic, (error) => {
      if (error) return console.error(error);
      console.log("unsubscribed from", topic);
    });
  }
}

async function connectCB() {
  console.log("mqtt connected");
  topicsArr = ["up/test/+", "up/provision/+", "up/telemetry/+"];
  MQTT.subscribe(topicsArr);
}

function messageCB(topic, msgBuff) {
  console.log("mqtt message on topic", topic);
  // message is a buffer, so convert it to string
  const msgStr = msgBuff.toString();

  const firstSlash = topic.indexOf("/");
  const secondSlash = topic.indexOf("/", firstSlash + 1);
  const type = topic.slice(firstSlash + 1, secondSlash);
  const apikey = topic.slice(secondSlash + 1);

  if (type === "telemetry") return handleTelemetry(apikey, msgStr);
  if (type === "provision") return handleProvision(apikey, msgStr);
  if (type === "test") return handleTest(apikey, msgStr);
  console("request not recognized");
}

module.exports = MQTT;

function handleTest(apikey, message) {
  console.log("test request from", apikey);
  const topic = `down/test/${apikey}`;
  MQTT.publish(topic, message);
}

function handleTelemetry(apikey, msgStr) {
  console.log("telemetry request from", apikey);

  try {
    const telemetryObj = JSON.parse(msgStr);
    const teleObj = { entity: apikey, ...telemetryObj };
    const telemetryUrl = CONTEXT_BROKER_URL + "/telemetry";

    axios
      .post(telemetryUrl, teleObj)
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error.message));
  } catch (error) {
    console.log(error);
  }
}

async function handleProvision(apikey, msgStr) {
  console.log("provision request from", apikey);

  const topic = `down/provision/${apikey}`;
  try {
    const provisionObj = JSON.parse(msgStr);
    const provObj = { entity: apikey, ...provisionObj };
    const provisionUrl = CONTEXT_BROKER_URL + "/provision";

    axios
      .post(provisionUrl, provObj)
      .then((res) => MQTT.publish(topic, res.data))
      .catch((err) => console.log(err.response));
  } catch (error) {
    console.log(error);
    MQTT.publish(topic, { ok: 0 });
  }
}

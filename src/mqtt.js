const mqtt = require("mqtt");
const axios = require("axios");

let client;
const CONTEXT_BROKER_URL = process.env.CONTEXT_BROKER_URL || "localhost://3002";

class MQTT {
  static connect(mqttBrokerUrl) {
    if (client) return;
    client = mqtt.connect(mqttBrokerUrl);
    client.on("connect", onConnectCallback);
    client.on("message", onMessageCallback);
  }

  static publish(topic, message) {
    let messageString =
      typeof message === "string" ? message : JSON.stringify(message);

    client.publish(topic, messageString, (error) => {
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

async function onConnectCallback() {
  console.log("connected to mqtt-broker");

  console.log("check context-broker status...");
  const { data } = await axios.get(CONTEXT_BROKER_URL + "/check");
  if (data === "ok") console.log("context-broker is running");

  topicsArr = [
    "up/check/+",
    "up/provision/+",
    "up/telemetry/+",
    "up/command/+",
  ];
  MQTT.subscribe(topicsArr);
}

function onMessageCallback(topic, message) {
  // message is a buffer, so convert it to string
  const messageString = message.toString();

  const firstSlash = topic.indexOf("/");
  const secondSlash = topic.indexOf("/", firstSlash + 1);
  const type = topic.slice(firstSlash + 1, secondSlash);
  const apikey = topic.slice(secondSlash + 1);

  switch (type) {
    case "check":
      return handleCheck(apikey, messageString);
    case "provision":
      return handleProvision(apikey, messageString);
    case "telemetry":
      return handleTelemetry(apikey, messageString);
    case "command":
      return handleCommand(apikey, messageString);
    case "time":
      return handleTime(apikey, messageString);
    default:
      console.log("request not recognized");
      break;
  }
}

function handleCheck(apikey, message) {
  console.log("check from", apikey);
  const topic = `down/check/${apikey}`;
  MQTT.publish(topic, message);
}

async function handleTelemetry(apikey, message) {
  console.log("telemetry from", apikey);

  try {
    const telemetryObj = JSON.parse(message);
    telemetryObj.entity = apikey;
    await axios.post(CONTEXT_BROKER_URL + "/telemetry", telemetryObj);
    console.log("telemetry ok");
  } catch (error) {
    console.log(error.message);
  }
}

async function handleProvision(apikey, message) {
  console.log("provision from", apikey);

  const downTopic = `down/provision/${apikey}`;
  try {
    const provisionObj = JSON.parse(message);
    provisionObj.entity = apikey;
    axios
      .post(CONTEXT_BROKER_URL + "/provision", provisionObj)
      .then(({ data }) => MQTT.publish(downTopic, data))
      .catch((error) => {
        if (error.response) {
          console.log(
            "provision request to context-broker failed:",
            error.response.data
          );
          MQTT.publish(downTopic, error.response.data);
        } else console.log(error.message);
      });
  } catch (error) {
    console.log(error.message);
    MQTT.publish(downTopic, "mqtt-agent error");
  }
}

async function handleCommand(apikey, message) {
  console.log("command response from", apikey);
  console.log(message);
}

async function handleTime(apikey, message) {
  console.log("time from", apikey);
  const now = new Date();
  const response = {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
    second: now.getUTCSeconds(),
  };
  const downTopic = "down/time/" + apikey;
  MQTT.publish(downTopic, response);
}

module.exports = MQTT;

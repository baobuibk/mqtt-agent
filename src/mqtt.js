const mqtt = require("mqtt");
const axios = require("axios");

let client;

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
  console.log("mqtt: connected");
  topicsArr = ["up/provision/+", "up/telemetry/+"];
  MQTT.subscribe(topicsArr);
}

function messageCB(topic, msgBuff) {
  // message is a buffer, so convert it to string
  const msgStr = msgBuff.toString();

  const firstSlash = topic.indexOf("/");
  const secondSlash = topic.indexOf("/", firstSlash + 1);
  const type = topic.slice(firstSlash + 1, secondSlash);
  const apikey = topic.slice(secondSlash + 1);

  try {
    const msgObj = JSON.parse(msgStr);
    if (type === "telemetry") return handleTelemetry(apikey, msgObj);
    if (type === "provision") return handleProvision(apikey, msgObj);
    if (type === "test") return handleTest(apikey, msgObj);
    console("message not recognized");
  } catch (error) {
    console.log(error);
  }
}

module.exports = MQTT;

function handleTest(apikey, message) {
  console.log("handle test", apikey);

  const topic = `down/test/${apikey}`;
  MQTT.publish(topic, "ok");
}

function handleTelemetry(apikey, message) {
  console.log("handle telemetry", message);

  let data = Object.entries(message).map(([key, value]) => {
    return {
      name: key,
      records: value,
    };
  });

  const telemetryObj = { data };

  const telemetryUrl = `${process.env.CONTEXT_BROKER_URL}/entities/${apikey}/telemetry`;

  axios
    .post(telemetryUrl, telemetryObj)
    .then((response) => console.log(response.data))
    .catch((error) => console.log(error.response.data));
}

function handleProvision(apikey, message) {
  console.log("handle provision", message);

  const resMsg = {
    ok: 1,
    data: {
      "01": {
        "01": 1,
        "02": 1,
      },
      "02": {
        "01": 1,
        "02": 1,
      },
    },
  };
  const topic = `down/provision/${apikey}`;
  MQTT.publish(topic, resMsg);

  // const provisionObj = { data };
  // const provisionUrl = `${process.env.CONTEXT_BROKER_URL}/entities/${apikey}/provision`;
  // axios
  //   .post(provisionUrl, provisionObj)
  //   .then((response) => console.log(response.data))
  //   .catch((error) => console.log(error.response.data));
}

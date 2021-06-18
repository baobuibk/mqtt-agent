const app = require("./server");
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost";
const MQTT = require("./mqtt");
MQTT.connect(MQTT_BROKER_URL);

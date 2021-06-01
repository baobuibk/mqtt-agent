const app = require("./server");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

const MQTT_URL = process.env.MQTT_URL;
const MQTT = require("./mqtt");
MQTT.connect(MQTT_URL);

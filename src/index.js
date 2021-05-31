const app = require("./server");
const PORT = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`server is listening on port ${PORT}`);
});

const MQTT = require("./mqtt");
MQTT.connect(process.env.MQTT_URL);

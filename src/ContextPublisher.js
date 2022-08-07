// const debug = require("debug")("ContextPublisher");
const debug = console.log;
const { createClient } = require("redis");

class ContextPublisher {
  client;
  constructor() {
    let client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6380",
    });
    client.on("connect", () => debug("connect"));
    client.on("ready", () => debug("ready"));
    client.on("end", () => debug("end"));
    client.on("error", (error) => debug("error", error.message));
    client.on("reconnecting", () => debug("reconnecting"));
    client.connect();
    this.client = client;
  }

  publish(channel, message) {
    this.client.publish(channel, message);
  }
}

module.exports = ContextPublisher;

require("dotenv").config();

const http = require("http");

require("./mqtt");
const expressApp = require("./express");

async function main() {
  const httpServer = http.createServer(expressApp);
  const PORT = process.env.PORT || 8003;

  httpServer.listen(PORT, () => {
    console.log("http server is listening on port", PORT);
  });
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});

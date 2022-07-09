const httpServer = require("http").createServer(require("./app"));
const PORT = process.env.PORT || 8003;

require("./mqtt");

async function main() {
  httpServer.listen(PORT, () =>
    console.log("server is listening on port", PORT)
  );
}

main().catch((error) => {
  console.log(error.message);
  process.exit(1);
});

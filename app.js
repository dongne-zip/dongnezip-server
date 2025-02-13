const express = require("express");
const http = require("http");
require("dotenv").config();
const cors = require("cors");

const indexRouter = require("./routes");
const PORT = 8080;

const app = express();
const server = http.createServer(app);
socketHandler(server);

app.use(cors());

const prefix = "/api-server";
app.use(prefix, indexRouter);

server.listen(PORT, () => {
  console.log("server is open!! PORT is", PORT);
});

const express = require("express");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const { sequelize } = require("./model");
const PORT = process.env.PORT;
const prefix = "/api-server";
const app = express();
const { socketHandler } = require("./socket/index");
const server = http.createServer(app);
const swaggerUi = require("swagger-ui-express");
const setupSwagger = require("./swagger/swaggerConfig"); // Swagger 설정 불러오기

socketHandler(server);

app.use(cors());
app.use(express.json()); // JSON 요청을 받을 수 있도록 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터를 받을 수 있도록 설정
// Swagger 설정 적용
setupSwagger(app);

// // 라우터 임포트
const indexRouter = require("./routes/index");
const chatRouter = require("./routes/chat");
// const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");

// // 메인 라우터 설정
app.use(prefix, indexRouter);

// // 개별 라우터 설정 (/api-server/user, /api-server/item 등)
app.use(`${prefix}/chat`, chatRouter);
app.use(`${prefix}/item`, itemRouter);

sequelize
  .sync({ force: false })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    console.log("database sync 오류!");
  });

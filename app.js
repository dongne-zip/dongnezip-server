const express = require("express");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const { sequelize } = require("./model");
const PORT = process.env.PORT;
const prefix = "/api-server";
const app = express();
const server = http.createServer(app);
//socketHandler(server);
app.use(cors());

app.use(express.json()); // JSON 요청을 받을 수 있도록 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터를 받을 수 있도록 설정

// // 라우터 임포트
// const indexRouter = require("./routes/index");
// const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");

// // 메인 라우터 설정
// app.use(prefix, indexRouter);

// // // 개별 라우터 설정 (/api-server/user, /api-server/item 등)
// // app.use(`${prefix}/user`, userRouter);
app.use(`${prefix}/item`, itemRouter);

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    console.log("database sync 오류!");
  });

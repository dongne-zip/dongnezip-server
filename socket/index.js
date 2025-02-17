const socketIO = require("socket.io");

function socketHandler(server) {
  const io = socketIO(server, {
    cors: {
      origin: `http://localhost:${process.env.PORT}`,
    },
  });

  const nickInfo = {}; // socket.id : nickname
  io.on("connection", (socket) => {
    // 입장 시 안내문구
    socket.on("checkNick", (nickname) => {
      nickInfo[socket.id] = nickname;

      socket.emit("success", nickname);

      io.emit("notice", nickInfo[socket.id] + "님이 입장했습니다");
    });

    // 퇴장 시 안내문구
    socket.on("disconnect", () => {
      io.emit("notice", nickInfo[socket.id] + "님이 퇴장하였습니다.");
      delete nickInfo[socket.id];
    });

    socket.on("send", (msgData) => {
      io.emit("message", {
        nick: msgData.myNick,
        message: msgData.msg,
      });
    });
  });
}

module.exports = socketHandler;

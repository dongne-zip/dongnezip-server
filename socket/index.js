const socketIO = require("socket.io");
const { ChatMessage } = require("../model/index");

let io;

function socketHandler(server) {
  io = socketIO(server, {
    cors: {
      origin: `http://localhost:3000`, // 통신하는 client
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

    // 메세지 전송
    socket.on("send", async (msgData) => {
      console.log("sendData", msgData);
      try {
        await ChatMessage.create({
          roomId: msgData.roomId,
          senderId: msgData.myNick,
          message: msgData.msg,
          isRead: false,
          msgType: "text",
        });
      } catch (err) {
        console.error(err);
      }
      io.to(msgData.roomId).emit("message", {
        nick: msgData.myNick,
        message: msgData.msg,
      });
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("socket.io가 초기화되지 않았습니다");
  }
  return io;
}

module.exports = { socketHandler, getIO };

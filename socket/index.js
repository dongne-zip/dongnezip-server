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
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    // 입장 시 안내문구
    socket.on("checkNick", (nickname, roomId) => {
      nickInfo[socket.id] = nickname;
      socket.emit("success", nickname);
      io.to(roomId).emit("notice", nickInfo[socket.id] + "님이 입장했습니다");
    });

    // 퇴장 시 안내문구
    socket.on("disconnect", () => {
      const rooms = Object.keys(socket.rooms);
      rooms.forEach((room) => {
        io.to(room).emit(
          "notice",
          nickInfo[socket.id] + "님이 퇴장하였습니다."
        );
      });
      delete nickInfo[socket.id];
    });

    // 메세지 전송
    socket.on("send", async (msgData) => {
      try {
        await ChatMessage.create({
          roomId: msgData.roomId,
          senderId: msgData.senderId,
          message: msgData.msg,
          isRead: false,
          msgType: msgData.type,
        });
      } catch (err) {
        console.error(err);
      }
      io.to(msgData.roomId).emit("message", {
        type: msgData.type,
        sender: msgData.senderId,
        message: msgData.msg,
        isRead: false,
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

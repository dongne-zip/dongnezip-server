const { ChatMessage, ChatRoom } = require("../model");
const { Op } = require("sequelize");
const { getIO } = require("../socket/index");

// front에 sql값 전달
exports.chat = async (req, res) => {
  try {
    const message = await ChatMessage.findAll();
    const room = await ChatRoom.findAll();

    res.json({ message: message, room: room });
  } catch (err) {
    console.error(err);
  }
};

// front에서 업로드한 image 파일 message에 저장 후 반환
exports.image = async (req, res) => {
  try {
    console.log(req.file);
    // 유효성 검증
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일이 없습니다" });
    }

    const imageUrl = req.file.location;
    const roomId = req.body.roomId;

    // sql에 새로운 값 생성
    const newMessage = await ChatMessage.create({
      roomId: req.body.roomId,
      senderId: req.body.senderId,
      message: imageUrl,
      msgType: "image",
      isRead: false,
    });

    // socket에 반환
    const io = getIO();
    io.to(roomId).emit("message", newMessage);

    res.json({ data: newMessage });
  } catch (err) {
    console.error(err);
  }
};

// 채팅방 메세지 읽었을 때 처리
exports.messageAsRead = async (req, res) => {
  try {
    const roomId = req.body.roomId;
    const userId = req.body.userId ? req.body.userId : null;

    // 유효성 검증
    if (!userId) {
      return res.status(401).json({ error: "사용자가 존재하지 않습니다" });
    }

    // sql의 isRead값 변경
    const [updateCount] = await ChatMessage.create(
      { isRead: true },
      {
        where: {
          roomId: roomId,
          senderId: { [Op.ne]: userId },
          isRead: false,
        },
      }
    );

    // 소켓에 반환
    const io = getIO();
    io.to(roomId).emit("count", updateCount);

    res.json(updateCount);
  } catch (err) {
    console.error(err);
  }
};

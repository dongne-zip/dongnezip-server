const { ChatMessage, ChatRoom } = require("../model");
const { Op } = require("sequelize");
const { getIO } = require("../socket/index");

// front에 sql값 전달
exports.chat = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const message = await ChatMessage.findAll({
      where: { roomId },
    });

    res.json({ message: message });
  } catch (err) {
    console.error("chatError", err);
  }
};

// 채팅방 생성
exports.createChatRoom = async (req, res) => {
  try {
    const { chatHost, itemId, chatGuest, guestNick } = req.body;
    // 중복 체크
    const existngRoom = await ChatRoom.findOne({
      where: { chatHost, chatGuest, itemId },
    });
    if (existngRoom) {
      return res.json({ roomId: existngRoom.id });
    }
    // 채팅방 생성
    const newChatRoom = await ChatRoom.create({
      chatHost,
      itemId,
      chatGuest,
      guestNick,
    });

    res.json({ roomId: newChatRoom.id });
  } catch (err) {
    console.error("chatRoomError", err);
  }
};

// front에서 업로드한 image 파일 message에 저장 후 반환
exports.image = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "이미지 파일이 없습니다" });
    }

    const imageUrl = req.file.location;
    // 메시지 저장 및 소켓 전송 제거, imageUrl만 반환
    res.json({ imageUrl });
  } catch (err) {
    console.error("imageError", err);
    res.status(500).json({ error: "이미지 업로드 실패" });
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
    console.error("readError", err);
  }
};

exports.getUserChatRooms = async (req, res) => {
  try {
    const userId = req.params.userId;

    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [{ chatHost: userId }],
      },
    });

    res.json({
      rooms: rooms.map((room) => ({
        roomId: room.id,
        itemId: room.itemId,
        chatHost: room.chatHost,
        chatGuest: room.chatGuest,
        guestNick: room.guestNick,
      })),
    });
  } catch (err) {
    console.error("getChatRoomsError", err);
    res.status(500).json({ error: "채팅방 목록 조회 실패" });
  }
};

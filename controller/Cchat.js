const { ChatMessage, ChatRoom } = require("../model");
const socket = require("../socket");

exports.chat = async (req, res) => {
  try {
    const message = await ChatMessage.findAll();

    const room = await ChatRoom.findAll();

    res.json({ message: message, room: room });
  } catch (err) {
    console.error(err);
  }
};

exports.image = async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageUrl = req.file.location;

    const newMessage = await ChatMessage.create({
      roomId: req.body.roomId,
      senderId: req.body.senderId,
      message: imageUrl,
      msgType: "image",
      createAt: new Date(),
    });

    const io = socket.getIO();
    io.to(roomId).emit("mewMessage", newMessage);

    res.json({ data: newMessage });
  } catch (err) {
    console.error(err);
  }
};

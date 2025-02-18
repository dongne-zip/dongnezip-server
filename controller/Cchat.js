const { ChatMessage, ChatRoom } = require("../model");

exports.chat = async (req, res) => {
  try {
    const message = await ChatMessage.findAll();

    const room = await ChatRoom.findAll();

    console.log(message);
    res.json({ message: message, room: room });
  } catch (err) {
    console.error(err);
  }
};

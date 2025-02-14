module.exports = (Sequelize, DataTypes) => {
  const chatMessage = Sequelize.define(
    "message",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roomId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
        field: "room_id",
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "sender_id",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        field: "is_read",
      },
      msgType: {
        type: DataTypes.ENUM(text, image),
        dafaultValue: text,
        field: "msg_type",
      },
    },
    {
      tableName: "message",
      timestamps: true,
    }
  );

  return chatMessage;
};

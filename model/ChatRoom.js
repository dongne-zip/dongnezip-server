module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define(
    "room",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "item_id",
      },
      chatHost: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "chat_host",
      },
      chatGuest: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "chat_guest",
      },
    },
    {
      tableName: "room",
      timestamps: true,
    }
  );

  return ChatRoom;
};

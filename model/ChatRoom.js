module.exports = (Sequelize, DataTypes) => {
  const chatRoom = Sequelize.define(
    "room",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      itemID: {
        tpye: DataTypes.INTEGER,
        allowNull: true,
        field: "item_id",
      },
      chatHost: {
        tpye: DataTypes.INTEGER,
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

  return chatRoom;
};

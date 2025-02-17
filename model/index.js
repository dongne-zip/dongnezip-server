const Sequelize = require("sequelize");
const db = {};
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 등록
db.Item = require("./Item")(sequelize, Sequelize);
db.ItemImage = require("./ItemImage")(sequelize, Sequelize);
db.Region = require("./Region")(sequelize, Sequelize);
db.Category = require("./Category")(sequelize, Sequelize);
db.Favorite = require("./Favorite")(sequelize, Sequelize);
db.Transaction = require("./Transaction")(sequelize, Sequelize);
db.User = require("./User")(sequelize, Sequelize);
db.Map = require("./Map")(sequelize, Sequelize);
db.ChatMessage = require("./ChatMessage")(sequelize, Sequelize);
db.ChatRoom = require("./ChatRoom")(sequelize, Sequelize);

// User & Room
db.User.hasMany(db.ChatRoom, {
  foreignKey: "chat_host",
});
db.User.hasMany(db.ChatRoom, {
  foreignKey: "chat_guest",
});
db.ChatRoom.belongsTo(db.User, {
  as: "Host",
  foreignKey: "chat_host",
});
db.ChatRoom.belongsTo(db.User, {
  as: "Guest",
  foreignKey: "chat_guest",
});

// User & Message
db.User.hasMany(db.ChatMessage, {
  foreignKey: "sender_id",
});
db.ChatMessage.belongsTo(db.User, {
  foreignKey: "sender_id",
});

// Item & Room
db.Item.hasMany(db.ChatRoom, {
  foreignKey: "item_id",
});
db.ChatRoom.belongsTo(db.Item, {
  foreignKey: "item_id",
});

module.exports = db;

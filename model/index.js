"use strict";

const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

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

// // /** 테이블 관계 설정 **/

/** 테이블 관계 설정 **/

// User → Item (1:N) - 사용자가 탈퇴하면 등록한 상품 삭제
db.User.hasMany(db.Item, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Item.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// User → Transaction (1:N) - 사용자가 탈퇴하면 거래 내역 삭제
db.User.hasMany(db.Transaction, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Transaction.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// User → Favorite (1:N) - 사용자가 탈퇴하면 찜 목록 삭제
db.User.hasMany(db.Favorite, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Favorite.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// User → ChatRoom (1:N) - 사용자가 탈퇴하면 관련 채팅방 삭제
db.User.hasMany(db.ChatRoom, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ChatRoom.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// User → ChatMessage (1:N) - 사용자가 탈퇴하면 보낸 메시지 삭제
db.User.hasMany(db.ChatMessage, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ChatMessage.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// Item → ItemImage (1:N) - 상품이 삭제되면 이미지도 삭제
db.Item.hasMany(db.ItemImage, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ItemImage.belongsTo(db.Item, { foreignKey: "itemId", targetKey: "id" });

// Item → Favorite (1:N) - 상품이 삭제되면 찜 목록에서도 삭제
db.Item.hasMany(db.Favorite, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Favorite.belongsTo(db.Item, { foreignKey: "itemId", targetKey: "id" });

// Item → Transaction (1:N) - 상품이 삭제되더라도 거래 내역은 유지 (SET NULL)
db.Item.hasMany(db.Transaction, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "SET NULL",
});
db.Transaction.belongsTo(db.Item, { foreignKey: "itemId", targetKey: "id" });

// Item → ChatRoom (1:N) - 상품이 삭제되더라도 채팅방은 유지 (SET NULL)
db.Item.hasMany(db.ChatRoom, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "SET NULL",
});
db.ChatRoom.belongsTo(db.Item, { foreignKey: "itemId", targetKey: "id" });

// ChatRoom → ChatMessage (1:N) - 채팅방이 삭제되면 메시지도 삭제
db.ChatRoom.hasMany(db.ChatMessage, {
  foreignKey: "roomId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ChatMessage.belongsTo(db.ChatRoom, {
  foreignKey: "roomId",
  targetKey: "id",
});

// Map → Item (1:1) - 상품이 삭제되면 지도 정보도 삭제
db.Map.hasOne(db.Item, {
  foreignKey: "mapId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Item.belongsTo(db.Map, { foreignKey: "mapId", targetKey: "id" });

module.exports = db;

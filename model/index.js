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

db.user = require("./User");
db.category = require("./Category");
db.chat_room = require("./ChatRoom");
db.chat_message = require("./ChatMessage");
db.item = require("./Item");
db.map = require("./Map");

module.exports = db;

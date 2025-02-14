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

module.exports = db;

module.exports = (Sequelize, DataTypes) => {
  const Item = Sequelize.define("Item", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "user_id",
    },
    roadAddress: {
      type: DataTypes.STRING(255),
      field: "road_address",
    },
  });
};

module.exports = (Sequelize, DataTypes) => {
  const Map = Sequelize.define(
    "map",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
      },
      roadAddress: {
        type: DataTypes.STRING(255),
        field: "road_address",
      },
    },
    {
      tableName: "map",
      timestamps: true,
    }
  );

  return Map;
};

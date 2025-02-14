module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: "id",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "user_id",
      },
      snsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "sns_id",
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "password",
      },
      userNm: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "user_nm",
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "nickname",
      },
      profileImg: {
        type: DataTypes.STRING,
        field: "profile_img",
      },
      phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "phone",
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );
  return User;
};

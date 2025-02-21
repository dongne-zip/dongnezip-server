"use strict";

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
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
        field: "email",
      },
      snsId: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
        field: "snsId",
      },
      provider: {
        type: DataTypes.ENUM("local", "kakao", "google"),
        allowNull: false,
        defaultValue: "local",
        field: "provider",
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "password",
      },
      userNm: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "user_nm",
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        field: "nickname",
      },
      profileImg: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: "profile_img",
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "phone",
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      // paranoid: true,
    }
  );
  return User;
};

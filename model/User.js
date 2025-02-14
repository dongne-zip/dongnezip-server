module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: "id",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        field: "user_id",
      },
      snsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        field: "sns_id",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "password",
      },
      userNm: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "user_nm",
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: "nickname",
      },
      place: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "place",
      },
      profileImg: {
        type: Sequelize.STRING,
        field: "profile_img",
      },
      phone: {
        type: Sequelize.INTEGER,
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

const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const google = require("./googleStrategy");
const User = require("../model/User");

module.exports = () => {
  local();
  // kakao();
  // google();
};

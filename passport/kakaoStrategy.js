const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../model/User");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/user/kakao/callback",
      },
      async (accessToken, refreshToken, user, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: user.id, provider: "kakao" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              nickname: user.properties.nickname,
              snsId: user.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};

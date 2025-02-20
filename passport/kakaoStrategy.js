const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../model/User");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "http://localhost:8080/api-server/user/kakao/callback",
      },
      async (profile, done) => {
        console.log("Kakao Strategy: ", profile);
        try {
          const { id, _json } = profile;
          const email = _json.kakao_account.email;

          const user = await User.findOne({
            where: {
              email,
              provider: "kakao",
            },
          });

          if (!user) {
            user = await User.create({
              email,
              snsId: profile.id,
              nickname: _json.kakao_account.profile.nickname,
              profileImg: _json.kakao_account.profile.profile_image_url,
            });
          }

          // 인증된 사용자 정보 반환
          return done(null, user);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};

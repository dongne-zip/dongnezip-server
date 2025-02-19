const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../model/User");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        callbackURL: "/user/google/callback",
      },
      async (accessToken, refreshToken, user, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: user.id, provider: "google" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              nickname: user.displayName,
              snsId: user.id,
              provider: "google",
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

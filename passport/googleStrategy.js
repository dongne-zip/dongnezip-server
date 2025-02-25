const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { User } = require("../model/User");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const id = profile.id;
          const email = profile.emails[0].value;
          const nickname = profile.displayName;

          let exUser = await User.findOne({
            where: {
              email: email,
              provider: "google",
            },
          });

          if (exUser) {
            return done(null, exUser);
          } else {
            exUser = new User({
              name: id,
              email: email,
              nickname: nickname,
              provider: "google",
            });

            await exUser.save();
            return done(null, exUser);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

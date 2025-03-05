import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from "../Models/userModel.js"  // Apne model ka path check kar lo

const configurePassport = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },  // Agar email se login karna hai
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          // TODO: Yahan bcrypt compare add karo
          const isMatch = password === user.password; // Replace with bcrypt
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default configurePassport;
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Serializar usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ==================== GOOGLE STRATEGY ====================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Buscar usuario existente por googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Buscar por email (por si se registró de forma tradicional)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Vincular cuenta de Google
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // Crear nuevo usuario
          const newUser = new User({
            googleId: profile.id,
            nombre: profile.displayName,
            email: profile.emails[0].value,
            password: 'google-oauth-' + profile.id, // Password temporal
            rol: 'user',
            activo: true
          });

          await newUser.save();
          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
}

module.exports = passport;
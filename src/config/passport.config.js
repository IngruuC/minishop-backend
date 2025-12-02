const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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

// ==================== FACEBOOK STRATEGY ====================
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'email'],
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Buscar usuario existente por facebookId
          let user = await User.findOne({ facebookId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Buscar por email (si Facebook proporciona email)
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // Vincular cuenta de Facebook
              user.facebookId = profile.id;
              await user.save();
              return done(null, user);
            }

            // Crear nuevo usuario con email
            const newUser = new User({
              facebookId: profile.id,
              nombre: profile.displayName,
              email: profile.emails[0].value,
              password: 'facebook-oauth-' + profile.id,
              rol: 'user',
              activo: true
            });

            await newUser.save();
            return done(null, newUser);
          }

          // Si Facebook no proporciona email, crear usuario sin email
          const newUser = new User({
            facebookId: profile.id,
            nombre: profile.displayName,
            email: `fb_${profile.id}@minishop.temp`, // Email temporal
            password: 'facebook-oauth-' + profile.id,
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
  console.warn('Facebook OAuth not configured: set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to enable it.');
}

module.exports = passport;
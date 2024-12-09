const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy: TwitchStrategy } = require("passport-twitch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do obsługi JSON
app.use(express.json());

// Konfiguracja sesji
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Konfiguracja strategii Twitch
passport.use(
  new TwitchStrategy(
    {
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: process.env.TWITCH_CALLBACK_URL,
      scope: ["user_read"], // Możesz dostosować zakres
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// Serializacja użytkownika
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

function authenticateApiRequest(req, res, next) {
  const apiToken = req.header("Authorization");

  if (!apiToken || apiToken !== `Bearer ${process.env.API_ACCESS_TOKEN}`) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid or missing token" });
  }

  next();
}

app.get("/api/auth/twitch", authenticateApiRequest, (req, res) => {
  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_CALLBACK_URL}&response_type=code&scope=user_read`;
  res.json({ authUrl });
});

app.get(
  "/api/auth/twitch/callback",
  authenticateApiRequest,
  passport.authenticate("twitch", { failureRedirect: "/api/auth/failed" }),
  (req, res) => {
    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        profileImageUrl: req.user.profileImageUrl || null,
      },
    });
  }
);

app.get("/api/auth/check", authenticateApiRequest, (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        profileImageUrl: req.user.profileImageUrl || null,
      },
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/api/auth/logout", authenticateApiRequest, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

app.get("/api/auth/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Authentication failed",
  });
});

app.listen(PORT, () =>
  console.log(`API is running at http://localhost:${PORT}`)
);

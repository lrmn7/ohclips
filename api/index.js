// Vercel Serverless Function
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Mux = require("@mux/mux-node");
const admin = require("firebase-admin");
const axios = require("axios");
const qs = require("qs");
const Redis = require("ioredis");
const rateLimit = require("express-rate-limit");
const Filter = require("bad-words");

// Init Express & dotenv
const app = express();
dotenv.config();

// Init CORS
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "https://ohclips.netlify.app", "https://ohclips.vercel.app"],
  })
);

// Init Rate Limit 🦥 (like && getUploadAuth endpoint)
const likeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // 20 requests per hour
  message: "Too many requests from this IP, please try again after an hour",
});
const uploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5, // 5 requests per day
  message: "Too many requests from this IP, please try again after a day",
});
app.use("/api/like", likeLimiter);
app.use("/api/getUploadAuth", uploadLimiter);

// Init Body Parser
app.use(bodyParser.json());

// Init redis cache
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// Init Filter (for profanity)
const filter = new Filter();

// Init Firebase
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Middleware to check if user is authenticated 🔐 (mux-webhook doesn't need this)
app.use((req, res, next) => {
  if (req.path !== "/api/mux-webhook" && req.path !== "/api/games") {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedIdToken) => {
          req.user = decodedIdToken;
          next();
        })
        .catch((error) => {
          res.status(401).send("Unauthorized ⛔");
        });
    } else {
      res.status(401).send("Unauthorized ⛔");
    }
  } else {
    next();
  }
});

// Init Mux
const { Video } = new Mux(
  process.env.MUX_TOKEN_ID,
  process.env.MUX_TOKEN_SECRET
);

// Return the Mux auth URL (needed so client can upload file to Mux) 🗃️
app.post("/api/getUploadAuth", async (req, res) => {
  const videoData = {
    title: req.body.title,
    game: req.body.game,
    userId: await db
      .collection("usernames")
      .where("uid", "==", req.user.uid)
      .get()
      .then((querySnapshot) => {
        let userId = "";
        querySnapshot.forEach((doc) => {
          userId = doc.id;
        });
        return userId;
      }),
  };
  console.log(videoData);

  if (!videoData.title || !videoData.game || !videoData.userId)
    return res.status(400).json({ error: "Missing required fields" });

  Video.Uploads.create({
    cors_origin: "https://ohclips.vercel.app",
    new_asset_settings: {
      playback_policy: ["public"],
      passthrough: JSON.stringify(videoData),
    },
  })
    .then((upload) => {
      return res.json({
        url: upload.url,
      });
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
});

// Mux webhook 🪝
app.post("/api/mux-webhook", async (req, res) => {
  const { type } = req.body;
  if (type == "video.asset.ready") {
    // Get Mux data from event
    const playbackId = req.body.data.playback_ids[0].id;
    const { title, game, userId } = JSON.parse(req.body.data.passthrough);

    try {
      // Grab user details from Firestore
      const user = await db.collection("usernames").doc(userId).get();
      const { photoURL } = user.data();

      // Add clip to Firestore
      await db.collection("clips").add({
        avatar: photoURL,
        date: new Date(),
        game,
        title,
        username: userId,
        playback_id: playbackId,
        likes: 0,
      });
    } catch {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
  // Let Mux know we received the event
  res.status(200).send("Event received");
});

// Get games list from Twitch API 🕹️
app.get("/api/games", async (req, res) => {
  // Check if games list is cached
  const cachedGames = await redis.get("games");

  if (cachedGames) {
    return res.json({ source: "cache", games: JSON.parse(cachedGames) });
  } else {
    try {
      // Get access token from Twitch API
      const twitchAuth = await axios({
        method: "post",
        url: "https://id.twitch.tv/oauth2/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: qs.stringify({
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        }),
      });
      // Throw error if no access token
      if (!twitchAuth.data.access_token)
        return res
          .status(500)
          .json({ error: "Can't fetch access token for Twitch API" });

      const { access_token } = twitchAuth.data;
      // Get games list from Twitch API
      const games = await axios({
        method: "get",
        url: "https://api.twitch.tv/helix/games/top?first=100",
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Add additional games to the list
      const addGames = await axios({
        method: "get",
        url: "https://api.twitch.tv/helix/games?name=Fallout 3&name=Ghostrunner",
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${access_token}`,
        },
      });

      games.data.data.push(...addGames.data.data);

      // Throw error if no games returned
      if (!games.data.data)
        return res.status(500).json({ error: "Issue fetching games list" });

      // Return only the name and box art
      const gamesList = games.data.data.map((game) => ({
        name: game.name,
        box_art_url: game.box_art_url
          .replace("{width}", "285")
          .replace("{height}", "380"),
      }));

      // Set games list in cache for 24 hours
      redis.set("games", JSON.stringify(gamesList), "EX", 86400);
      res.json({ state: "origin", games: gamesList });
    } catch {
      res.status(500).json({ error: "Issue fetching games list" });
    }
  }
});

// Handle liked clips 🤍
app.post("/api/like", async (req, res) => {
  const { clipId } = req.body;

  // Find the user doc.id from /usernames/{username}/uid = req.user.uid
  const userId = await db
    .collection("usernames")
    .where("uid", "==", req.user.uid)
    .get()
    .then((querySnapshot) => {
      let userId = "";
      querySnapshot.forEach((doc) => {
        userId = doc.id;
      });
      return userId;
    });

  if (!clipId) return res.status(400).json({ error: "Missing clip ID." });
  if (!userId) return res.status(400).json({ error: "Not authorized." });

  try {
    // Get clip from Firestore
    const clip = await db.collection("clips").doc(clipId).get();
    const { likes } = clip.data();

    // Check if user has already liked clip
    const liked = await db
      .collection("clips")
      .doc(clipId)
      .collection("likes")
      .doc(userId)
      .get();

    if (liked.exists) {
      // Remove like from Firestore
      await db
        .collection("clips")
        .doc(clipId)
        .collection("likes")
        .doc(userId)
        .delete();
      // Decrement likes count and return total likes
      await db
        .collection("clips")
        .doc(clipId)
        .update({ likes: likes - 1 })
        .then(() => {
          res.json({ liked: false, likes: likes - 1 });
        });
    } else {
      // Add like to Firestore
      await db
        .collection("clips")
        .doc(clipId)
        .collection("likes")
        .doc(userId)
        .set({
          date: new Date(),
          uid: req.user.uid,
        });
      // Increment likes count and return total likes
      await db
        .collection("clips")
        .doc(clipId)
        .update({ likes: likes + 1 })
        .then(() => {
          res.json({ liked: true, likes: likes + 1 });
        });
    }
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/deleteClip", async (req, res) => {
  const { clipId } = req.body;
  if (!clipId) return res.status(400).json({ error: "Missing clip ID." });

  // Find the user doc.id from /usernames/{username}/uid = req.user.uid
  const userId = await db
    .collection("usernames")
    .where("uid", "==", req.user.uid)
    .get()
    .then((querySnapshot) => {
      let userId = "";
      querySnapshot.forEach((doc) => {
        userId = doc.id;
      });
      return userId;
    });

  if (!userId) return res.status(400).json({ error: "Not authorized." });

  try {
    // Get clip from Firestore
    const clip = await db.collection("clips").doc(clipId).get();
    const { username } = clip.data();

    if (username !== userId)
      return res.status(400).json({ error: "Not authorized." });

    // Delete clip and any subcollections from Firestore
    await db.collection("clips").doc(clipId).delete();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Add comment to clip
app.post("/api/comment", async (req, res) => {
  const { clipId, comment } = req.body;

  if (!clipId) return res.status(400).json({ error: "Missing clip ID." });
  if (!comment) return res.status(400).json({ error: "Missing comment." });

  // Find the user doc.id and doc.data().photoURL from /usernames/{username}/uid = req.user.uid
  const usernameRef = await db.collection("usernames");
  const userQuery = await usernameRef.where("uid", "==", req.user.uid).get();
  const userDetails = userQuery.docs.map((doc) => ({
    userId: doc.id,
    avatar: doc.data().photoURL,
  }));

  const { userId, avatar } = userDetails[0];

  if (!userId) return res.status(400).json({ error: "Not authorized." });

  try {
    // Add comment to clips comment collection
    await db
      .collection("clips")
      .doc(clipId)
      .collection("comments")
      .add({
        comment: filter.clean(comment),
        date: new Date(),
        uid: req.user.uid,
        username: userId,
        avatar,
      })
      .then((docRef) => {
        res.json({
          success: true,
          commentData: {
            comment: filter.clean(comment),
            date: new Date(),
            uid: req.user.uid,
            username: userId,
            avatar,
          },
        });
      });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Close Redis connection on exit
process.on("SIGINT", () => {
  console.log("Closing Redis client connection...");
  redis.disconnect();
  process.exit();
});

// app.listen(
// process.env.PORT || 3001,
// console.log(`Server running on port ${process.env.PORT || 3001} 🚀`)
// );

// Deploy for vercel
module.exports = app;

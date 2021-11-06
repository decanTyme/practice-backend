const bcrypt = require("bcrypt");
const generateAccessToken = require("../services/generate-token");

// Mongoose model imports
const User = require("../models/users");
const RefreshToken = require("../models/refresh-token");

exports.signup = (req, res) => {
  bcrypt
    .hash(req.body.password, 12)
    .then((hash) => {
      bcrypt.compare(req.body.password, hash).then((valid) => {
        if (!valid)
          return res.status(500).json({
            message: "Unexpected error. Please try again later.",
          });
      });

      const newUser = new User({
        username: req.body.username,
        password: hash,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        role: req.body.role,
      });

      newUser
        .save()
        .then(() => {
          res.json({ message: "User added successfully." });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
            message: "There was an error in saving the user.",
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
        message: "Unexpected error. Please try again later.",
      });
    });
};

exports.login = async (req, res) => {
  const client = req.body;
  let longerSignin;

  try {
    longerSignin = JSON.parse(client.rememberUser);
  } catch (error) {
    console.log(error);

    longerSignin = false;
  }

  try {
    const user = await User.findOne({ username: client.username });

    if (!user) return res.status(401).json({ error: "Invalid Credentials" });

    /* Get the user data to send back to user */
    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };

    const access = user.role.toLowerCase() === "administrator";

    const valid = await bcrypt.compare(client.password, user.password);

    /* Validate the password */
    if (!valid) return res.status(401).json({ error: "Invalid Credentials" });

    /* Sign a new access token, serialize to cookie, and set to cookie header */
    res.cookie(
      "__auth_t",
      generateAccessToken({ ...userData, sub: user._id, access }),
      {
        maxAge: 1_800_000,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "none",
      }
    );

    /* If the user wants a longer signin, sign a new refresh token */
    if (longerSignin) {
      const refToken = generateAccessToken(
        { ...userData, sub: user._id, access },
        "REFRESH_TOKEN"
      );

      /* Save valid refresh token to database */
      const savedRFToken = await new RefreshToken({
        token: refToken,
        rememberUser: longerSignin,
      }).save();

      if (!savedRFToken) throw new Error("Database error");

      res.cookie("__trf", refToken, {
        maxAge: 86_400_000,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "none",
      });

      return res.status(200).json({
        userId: user._id,
        userData,
        adminAccess: access,
        persist: true,
      });
    } else
      res.status(200).json({
        userId: user._id,
        userData,
        adminAccess: access,
        persist: false,
      });
  } catch (error) {
    console.log(error);

    if (error instanceof SyntaxError)
      return res.status(400).json({
        error: error.message,
        message: "An error occured. Please try again later.",
      });

    return res.status(500).json({
      error: error.message,
      message: "There was an authentication error. Please try again later.",
    });
  }
};

exports.signoff = (req, res) => {
  console.log(req.path, "| Token:", req.cookies["__trf"]);

  RefreshToken.deleteOne({ token: req.cookies["__trf"] })
    .then(() => {
      console.log("Successfully invalidated the refresh token.");
      res
        .cookie("__auth_t", null, {
          maxAge: 0,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        })
        .cookie("__trf", null, {
          maxAge: 0,
          path: "api/auth",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        })
        .status(200)
        .json({ signoff: true });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ signoff: true });
    });
};

exports.authenticate = async (req, res) => {
  if (!req.body.userId)
    return res.status(401).json({ auth: false, message: "Please log in." });

  if (!req.cookies["__trf"])
    return res
      .cookie("__auth_t", null, {
        maxAge: 0,
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "none",
      })
      .status(403)
      .json({
        auth: false,
        message: "Session expired. Please login again.",
      });

  try {
    const user = await User.findOne({ _id: req.body.userId });

    if (!user)
      return res.status(403).json({ auth: false, message: "Invalid session." });

    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };

    const rf = await RefreshToken.findOne({
      token: req.cookies["__trf"],
    });

    if (!rf)
      return res.status(403).json({
        auth: false,
        invalidSession: true,
        message: "Invalid session.",
      });

    if (!rf.rememberUser) {
      await RefreshToken.deleteOne({ token: req.cookies["__trf"] });
      console.log("Refresh token invalidated.");

      return res
        .cookie("__auth_t", null, {
          maxAge: 0,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        })
        .status(403)
        .json({
          auth: false,
          message: "Session expired. Please login again.",
        });
    }

    const access = user.role.toLowerCase() === "administrator";

    console.log("Token refreshed.");
    return res
      .cookie(
        "__auth_t",
        generateAccessToken({ ...userData, sub: user._id, access }),
        {
          maxAge: 1_800_000,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        }
      )
      .status(200)
      .json({ auth: true });
  } catch (error) {
    console.log(error);

    if (error instanceof SyntaxError)
      return res.status(400).json({
        error: error.message,
        message: "An error occured. Please try again later.",
      });

    return res.status(500).json({
      error: error.message,
      message: "There was an authentication error. Please try again later.",
    });
  }
};

exports.ping = (req, res) => {
  if (!req.isDbConnected)
    return res.status(500).json({
      error: req.databaseConnectError,
      message: "Database connect error",
    });

  return res.json({ auth: true });
};

exports.user = (req, res) => {
  User.findOne({ _id: req.body.userId })
    .then((user) => {
      res.status(200).json({
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      });
    })
    .catch((error) => {
      res.status(404).json({ error: error, msg: "User not found." });
    });
};

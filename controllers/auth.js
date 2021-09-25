const bcrypt = require("bcrypt");
const cookie = require("cookie");
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

exports.login = (req, res) => {
  const client = req.body;
  const longerSignin = JSON.parse(client.rememberUser);

  /* Try to find user in database */
  User.findOne({ username: client.username }).then((user) => {
    if (!user) return res.status(401).json({ error: "Invalid Credentials" });

    /* Get the user data to send back to user */
    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };

    /* Validate the password */
    bcrypt.compare(client.password, user.password).then((valid) => {
      if (!valid) return res.status(401).json({ error: "Invalid Credentials" });

      /* Sign a new access token, serialize to cookie, and set to cookie header */
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("__auth_token", generateAccessToken(user._id), {
          maxAge: 1200,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        })
      );

      /* If the user wants a longer signin, sign a new refresh token */
      if (longerSignin) {
        const refToken = generateAccessToken(user._id, "REFRESH_TOKEN");
        const newRefToken = new RefreshToken({
          token: refToken,
          rememberUser: longerSignin,
        });

        /* Save valid refresh token to database */
        newRefToken
          .save()
          .then(() => {
            console.log("Refresh token added to DB.");
            return res.status(200).json({
              userId: user._id,
              refToken,
              userData,
            });
          })
          .catch(() => {
            return res.status(500).json({
              message:
                "There was an authentication error. Please try again later.",
            });
          });
      } else {
        res.status(200).json({
          userId: user._id,
          userData,
        });
      }
    });
  });
};

exports.signoff = (req, res) => {
  console.log(req.path, "| Token:", req.body.refToken);
  RefreshToken.deleteOne({ token: req.body.refToken })
    .then(() => {
      console.log("Successfully invalidated the refresh token.");
      res
        .status(200)
        .setHeader(
          "Set-Cookie",
          cookie.serialize("__auth_token", null, {
            maxAge: 0,
            path: "/",
            secure: true,
            httpOnly: true,
            sameSite: "none",
          })
        )
        .json({ signoff: true });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ signoff: true });
    });
};

exports.authenticate = (req, res) => {
  if (!req.body.userId)
    return res.status(401).json({ auth: false, message: "Please log in." });

  if (!req.body.refToken)
    return res
      .setHeader(
        "Set-Cookie",
        cookie.serialize("__auth_token", null, {
          maxAge: 0,
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "none",
        })
      )
      .status(403)
      .json({
        auth: false,
        message: "Session expired. Please login again.",
      });

  User.findOne({ _id: req.body.userId })
    .then((user) => {
      if (!user)
        return res
          .status(403)
          .json({ auth: false, message: "Invalid session." });

      RefreshToken.findOne({ token: req.body.refToken })
        .then((token) => {
          if (!token)
            return res.status(403).json({
              auth: false,
              invalidSession: true,
              message: "Invalid session.",
            });

          if (!token.rememberUser)
            return RefreshToken.deleteOne({ token: req.body.refToken }).then(
              () => {
                console.log("Refresh token invalidated.");

                res
                  .setHeader(
                    "Set-Cookie",
                    cookie.serialize("__auth_token", null, {
                      maxAge: 0,
                      path: "/",
                      secure: true,
                      httpOnly: true,
                      sameSite: "none",
                    })
                  )
                  .status(403)
                  .json({
                    auth: false,
                    message: "Session expired. Please login again.",
                  });
              }
            );

          console.log("Token refreshed.");
          res
            .setHeader(
              "Set-Cookie",
              cookie.serialize("__auth_token", generateAccessToken(user._id), {
                maxAge: 1200,
                path: "/",
                secure: true,
                httpOnly: true,
                sameSite: "none",
              })
            )
            .status(200)
            .json({ auth: true });
        })
        .catch(() => {
          res.status(403).json({ auth: false, message: "Invalid session." });
        });
    })
    .catch(() => {
      res.status(401).json({ auth: false, message: "Please log in." });
    });
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

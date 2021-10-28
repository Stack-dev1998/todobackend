const jwt = require("jsonwebtoken");

const withAuth = (req, res, next) => {
  console.log(req.headers.authorization);
  const token = req.headers.authorization;

  if (!token) {
    res
      .status(401)
      .json({ auth: false, msg: "Unauthorized: No token provided" });
  } else {
    jwt.verify(token, process.env.JWTSECRET, function (err, decoded) {
      if (err) {
        res
          .status(401)
          .json({ auth: false, msg: "Unauthorized: Invalid token" });
      } else {
        next();
      }
    });
  }
};

module.exports = withAuth;

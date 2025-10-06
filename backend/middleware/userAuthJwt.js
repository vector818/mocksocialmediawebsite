import db from "../clients/database-client";
import { secretUserConfigurations } from "../utils";

const jwt = require("jsonwebtoken");
const secret = secretUserConfigurations();

export const verifyUserToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided, Please log in again!"
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded._id;
    next();
  });
};

export const isUser = (req, res, next) => {
  db.User.findByPk(req.userId)
    .then(() => {
      next();
  })
  .catch(err => {
    return res.status(403).send({
      message: "No User entry found, Plese log in again! " + toString(err)
    });
  });
};

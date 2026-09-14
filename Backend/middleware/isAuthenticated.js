import jwt from "jsonwebtoken";
import config from "../config/index.js";
import ApiError from "../utils/ApiError.js";

const isAuthenticated = (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.id = decoded.userId || decoded.id;
    req.userId = req.id;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};

export default isAuthenticated;

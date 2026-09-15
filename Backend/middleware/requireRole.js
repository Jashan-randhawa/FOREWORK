export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.id || !req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: requires one of the following roles: [${roles.join(", ")}]`,
        success: false,
      });
    }

    next();
  };
};

export default requireRole;

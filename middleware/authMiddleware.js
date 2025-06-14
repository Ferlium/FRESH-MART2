const User = require("../models/user");
const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
  try {
    // Check if user is logged in (session-based authentication)
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized, please log in" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // Attach user data to request
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication failed", error });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access token required" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });

    req.user = decoded;
    next();
  });
};


module.exports = { verifyUser, isAdmin, verifyToken };


// module.exports = verifyToken;
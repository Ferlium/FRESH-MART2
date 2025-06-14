const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Refresh Token Endpoint
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(403).json({ message: "Refresh token missing" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });

    const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.json({ accessToken: newAccessToken });
  });
});

module.exports = router;

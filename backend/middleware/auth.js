const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from header
  let token =
    req.header("x-auth-token") ||
    req.header("Authorization")?.replace("Bearer ", "");

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  // Clean the token - remove any extra whitespace or characters
  token = token.trim();

  // Basic JWT format validation (should have 3 parts separated by dots)
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    console.error("Token format invalid - not a proper JWT:", token);
    return res.status(401).json({ error: "Token format invalid" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    console.error("Token that failed:", token);
    console.error("JWT_SECRET exists:", !!process.env.JWT_SECRET);

    // Clear invalid token from client
    res.status(401).json({
      error: "Token is not valid",
      tokenCleared: true,
    });
  }
};

const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await authService.register(email, password, 'User', fullName);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await authService.login(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id,role: user.role },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      image: user.image || "https://dpgaire.github.io/image-server/projects/fallback-user.png",
      accessToken,
      refreshToken,
      paymentType: user.paymentType,
      apiKey: user.apiKey,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Fetch user by ID
    const userDetails = await userService.getUserById(decoded.id, decoded.id, decoded.role);

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      { id: userDetails.id, role: userDetails.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign(
      { id: userDetails.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      id: userDetails.id,
      fullName: userDetails.fullName,
      email: userDetails.email,
      role: userDetails.role,
      image: userDetails.image || "https://dpgaire.github.io/image-server/projects/fallback-user.png",
      accessToken,
      refreshToken: newRefreshToken,
      apiKey: userDetails.apiKey,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};

const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, password, role, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await authService.register(email, password, role, fullName);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await authService.login(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      image: "https://dpgaire.github.io/image-server/projects/durga.png",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const userDetails = await userService.getUserById(user.id);
    if (!userDetails) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('userDetails',userDetails)

    const accessToken = jwt.sign({ id: userDetails.id, role: userDetails.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const newRefreshToken = jwt.sign({ id: userDetails.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    
    res.json({
      fullName: userDetails.fullName,
      email: userDetails.email,
      role: userDetails.role,
      image: "https://dpgaire.github.io/image-server/projects/durga.png", // Assuming image is static or fetched elsewhere
      accessToken,
      refreshToken: newRefreshToken,
    });
  });
};


const logout = (req, res) => {
  // For token-based auth, the client is responsible for destroying the token.
  // The backend can simply confirm the logout.
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};

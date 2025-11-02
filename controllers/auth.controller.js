const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await authService.register(email, password);
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
      fullName: "Durga Gairhe",
      email: user.email,
      role: "admin",
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

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ id: user.id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    
    res.json({
      fullName: "Durga Gairhe",
      email: user.email,
      role: "admin",
      image: "https://dpgaire.github.io/image-server/projects/durga.png",
      accessToken,
      refreshToken,
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

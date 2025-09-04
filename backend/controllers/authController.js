const User = require('../models/User');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = new User({ name, email, password, role });
    await user.save();
    req.session.user = { id: user._id, role: user.role };
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.user = { id: user._id, role: user.role };
    res.json({ role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
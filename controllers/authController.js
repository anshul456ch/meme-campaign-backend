const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');

const { generateToken } = require('../utils/token');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, position, empType, createdBy } = req.body;

    // Check for existing email
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role,
      position,
      empType,
      createdBy
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', email);

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Check password
    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Create token
    const token = generateToken(user);
    console.log('Token generated:', token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err); // <- This will show the real error
    res.status(500).json({ message: 'Login failed' });
  }
};


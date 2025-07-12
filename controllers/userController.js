const User = require('../models/User');
const { hashPassword } = require('../utils/hash');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, position, empType } = req.body;

    // Check if email exists
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const passwordHash = await hashPassword(password);

    const user = new User({
      name,
      email,
      passwordHash,
      role,
      position,
      empType,
      createdBy: req.user._id // from JWT middleware
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'User creation failed' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash') // exclude passwordHash
      .populate('createdBy', 'name email role') // optional: show creator details
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, position, empType } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, position, empType },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'User update failed' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'User deletion failed' });
  }
};


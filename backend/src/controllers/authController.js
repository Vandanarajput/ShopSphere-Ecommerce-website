const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, failure } = require('../utils/apiResponse');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidator');

async function register(req, res, next) {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(failure('Validation failed', result.error.issues));
    }
    const { name, email, password, phone } = result.data;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json(failure('Email is already registered.'));

    const user = await User.create({ name, email, password, phone: phone || '' });
    const token = generateToken(user._id, user.role);

    res.status(201).json(
      success('Account created successfully.', {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      })
    );
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(failure('Validation failed', result.error.issues));
    }
    const { email, password } = result.data;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json(failure('Invalid email or password.'));
    if (!user.isActive) return res.status(401).json(failure('Account has been deactivated.'));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json(failure('Invalid email or password.'));

    const token = generateToken(user._id, user.role);

    res.json(
      success('Login successful.', {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      })
    );
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  const u = req.user;
  res.json(
    success('Profile fetched.', {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      addresses: u.addresses,
      createdAt: u.createdAt,
    })
  );
}

async function changePassword(req, res, next) {
  try {
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(failure('Validation failed', result.error.issues));
    }
    const { oldPassword, newPassword } = result.data;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json(failure('Old password is incorrect.'));

    user.password = newPassword;
    await user.save();
    res.json(success('Password changed successfully.'));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, changePassword };

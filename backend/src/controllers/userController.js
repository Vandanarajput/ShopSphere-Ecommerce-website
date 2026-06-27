const User = require('../models/User');
const { success, failure } = require('../utils/apiResponse');

async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    if (name !== undefined && !name.trim()) {
      return res.status(400).json(failure('Name cannot be empty.'));
    }
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    await user.save();
    res.json(
      success('Profile updated.', {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      })
    );
  } catch (e) {
    next(e);
  }
}

function validateAddress(body) {
  const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  for (const f of required) {
    if (!body[f] || !body[f].toString().trim()) {
      return `Field "${f}" is required.`;
    }
  }
  return null;
}

async function addAddress(req, res, next) {
  try {
    const err = validateAddress(req.body);
    if (err) return res.status(400).json(failure(err));

    const user = await User.findById(req.user._id);
    const { fullName, phone, addressLine1, city, state, pincode, isDefault } = req.body;

    if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });

    user.addresses.push({
      fullName, phone, addressLine1, city, state, pincode,
      isDefault: !!isDefault || user.addresses.length === 0, // first address is default
    });

    await user.save();
    res.status(201).json(success('Address added.', { addresses: user.addresses }));
  } catch (e) {
    next(e);
  }
}

async function updateAddress(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json(failure('Address not found.'));

    const { fullName, phone, addressLine1, city, state, pincode, isDefault } = req.body;

    if (isDefault === true) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (isDefault !== undefined) address.isDefault = !!isDefault;

    await user.save();
    res.json(success('Address updated.', { addresses: user.addresses }));
  } catch (e) {
    next(e);
  }
}

async function deleteAddress(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    const before = user.addresses.length;
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    if (user.addresses.length === before) return res.status(404).json(failure('Address not found.'));
    await user.save();
    res.json(success('Address deleted.', { addresses: user.addresses }));
  } catch (e) {
    next(e);
  }
}

module.exports = { updateProfile, addAddress, updateAddress, deleteAddress };

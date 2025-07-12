const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function comparePassword(plain, hash) {
  return await bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };

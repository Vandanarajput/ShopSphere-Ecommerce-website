const app = require('../src/app');
const connectDB = require('../src/config/db');

let dbPromise;

module.exports = async (req, res) => {
  try {
    if (!dbPromise) dbPromise = connectDB();
    await dbPromise;
  } catch (err) {
    dbPromise = undefined;
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
  return app(req, res);
};

const mongoose = require('mongoose');
const { Schema } = mongoose;

const pageSchema = new Schema({
  pageName: { type: String, required: true, unique: true },
  pageLink: String,
  groupLink: String,
  category: String,
  adminMobile: String,
  bigPage: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);

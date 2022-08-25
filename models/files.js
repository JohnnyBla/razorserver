const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema(
  {
    file: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Files', fileSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const loadSchema = new Schema(
  {
    Origin: { type: String, required: true },
    Destination: { type: String, required: true },
    PricePerMile: { type: Number, required: true },
    TotalMiles: { type: Number, required: true },
    TotalPrice: { type: Number, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Load', loadSchema);

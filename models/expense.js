const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  Misc: { type: Number, default: 0 },
  Repairs: { type: Number, default: 0 },
  RoomAndBoard: { type: Number, default: 0 },
  fuelPrice: { type: Number, default: 0 },
  user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Expense', expenseSchema);

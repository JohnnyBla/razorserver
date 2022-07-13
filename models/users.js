const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: { type: String, default: '' },
  lastname: { type: String, default: '' },
  email: { type: String, unique: true },
  loads: [{ type: mongoose.Types.ObjectId, ref: 'Load' }],
  expenses: [{ type: mongoose.Types.ObjectId, ref: 'Expense' }],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);

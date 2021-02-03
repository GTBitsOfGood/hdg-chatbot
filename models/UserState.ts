const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserStateSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  currMessage: { type: String, required: true },
  split: {type: Boolean, required: false }
});


module.exports = mongoose.model('UserState', UserStateSchema);

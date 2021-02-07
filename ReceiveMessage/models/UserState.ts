import mongoose, { Schema } from 'mongoose';

const UserStateSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    currMessage: { type: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage' }, required: true },
    split: { type: Boolean, required: false },
});

module.exports = mongoose.model('UserState', UserStateSchema);

import mongoose, { Schema } from 'mongoose';

const UserStateSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    currentMessage: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage', required: true },
    split: { type: Boolean, required: false },
});

export default mongoose.model('UserState', UserStateSchema);

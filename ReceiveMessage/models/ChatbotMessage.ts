import mongoose, { Schema } from 'mongoose';

const ChatbotMessageSchema = new Schema({
    body: { type: String, required: true },
    images: { type: [{ url: String }], required: false },
    nextMessages: { type: Map, of: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage' }, required: true },
    previousMessage: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage', required: false },
    module: { type: String, required: true },
});

export default mongoose.model('ChatbotMessage', ChatbotMessageSchema);

const ChatbotMessageSchema = new Schema({
    body: { type: String, required: true },
    images: { type: [{ url: String }], required: false },
    nextMessages: { type: Map, of: { type: Schema.ObjectId, ref: 'ChatbotMessage' }, required: true },
    previousMessage: { type: { type: Schema.ObjectId, ref: 'ChatbotMessage' }, required: true },
    module: { type: String, required: true },
});

module.exports = mongoose.model('ChatbotMessage', ChatbotMessageSchema);

const ChatbotMessageSchema = new Schema({
  body: { type: String, required: true },
  images: { type: Array, required: false },
  nextMessages: { type: Array, required: true },
  previousMessage: { type: String, required: true },
  module: { type: String, required: true } 
});


module.exports = mongoose.model('ChatbotMessage', ChatbotMessageSchema);
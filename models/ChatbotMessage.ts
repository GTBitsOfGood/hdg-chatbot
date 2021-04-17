import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
    messageId: number
    body: string
    image: string
    nextMessages: Map<string, Schema.Types.ObjectId>
    previousMessage: Schema.Types.ObjectId
    module: string
    messageType: string //can only be "question", "final-message", "message", or "no-instruction"
    lowData: string
}

const ChatbotMessageSchema = new Schema({
    messageId: { type: Number, required: true },
    body: { type: String, required: true },
    image: { type: String, required: false },
    nextMessages: { type: Map, of: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage' }, required: true },
    previousMessage: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage', required: false },
    module: { type: String, required: true },
    messageType: { type: String, enum: ['question', 'final-message', 'message', 'no-instruction'], required: true },
    lowData: { type: String, required: true },
})

export default mongoose.model<IMessage>('ChatbotMessage', ChatbotMessageSchema)

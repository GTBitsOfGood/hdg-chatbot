import mongoose, { Schema, Document } from 'mongoose'

const MessageResponseSchema: Schema = new Schema({
    accountID: { type: String, required: true },
    chatBotMessageID: { type: String, required: true },
    response: { type: String, required: true },
})

export interface IMessageResponse extends Document {
    accountID: string
    chatBotMessageID: string
    response: string
}

export default mongoose.model<IMessageResponse>('MessageResponse', MessageResponseSchema)

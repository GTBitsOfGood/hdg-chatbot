import mongoose, { Schema, Document } from 'mongoose'

const MessageResponseSchema: Schema = new Schema({
    accountID: { type: String, required: true },
    messageID: { type: Number, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    response: { type: String, required: true },
})

export interface IMessageResponse extends Document {
    accountID: string
    messageID: number
    message: string
    timestamp: Date
    response: string
}

export default mongoose.model<IMessageResponse>('MessageResponse', MessageResponseSchema)

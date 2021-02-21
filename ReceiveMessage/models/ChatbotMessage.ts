/* eslint-disable prettier/prettier */
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    messageId: number;
    body: string;
    images: string[];
    nextMessages: Map<string, Schema.Types.ObjectId>;
    previousMessage?: Schema.Types.ObjectId;
    module: string;
    isQuestion: boolean;
    lowData: string;
}

const ChatbotMessageSchema = new Schema({
    messageId: { type: Number, required: true},
    body: { type: String, required: true },
    images: { type: [String], required: false },
    nextMessages: { type: Map, of: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage' }, required: true },
    previousMessage: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage', required: false },
    module: { type: String, required: true },
    isQuestion: { type: Boolean, required: false },
    lowData: { type: String, required: true },
});

export default mongoose.model<IMessage>('ChatbotMessage', ChatbotMessageSchema);

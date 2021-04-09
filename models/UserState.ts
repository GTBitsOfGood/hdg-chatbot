import mongoose, { Schema, Document } from 'mongoose'
import { IMessage } from './ChatbotMessage'


export interface IUserState extends Document {
    userId: string
    currMessage: IMessage['_id']
    lowData: boolean
    moduleCompletionTime: Array<Date>
    dataConsent: boolean
    lastActivity: Date
}

const UserStateSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    currMessage: {
        type: Schema.Types.ObjectId,
        ref: 'ChatbotMessage',
        required: true,
        default: '6022178429efc055c8e74e50',
    },
    lowData: { type: Boolean },
    moduleCompletionTime: { type: [Date], default: [null, null, null, null, null] },
    dataConsent: { type: Boolean, required: true},
    lastActivity: { type: Date },
})

export default mongoose.model<IUserState>('UserState', UserStateSchema);

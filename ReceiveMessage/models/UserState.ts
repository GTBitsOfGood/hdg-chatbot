import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from './ChatbotMessage';

export interface State extends Document {
    userId: string;
    currMessage: IMessage['_id'];
    completedModules: Array<number>;
    split: boolean;
    lowData: boolean;
    completedTimes: Array<Schema.Types.Date>;
}

const UserStateSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    currMessage: {
        type: Schema.Types.ObjectId,
        ref: 'ChatbotMessage',
        required: true,
        default: '6022178429efc055c8e74e50',
    },
    completedModules: { type: Array, default: [] },
    split: { type: Boolean, required: false },
    lowData: { type: Boolean },
    completedTimes: { type: Array, default: [null, null, null, null, null] },
});

export default mongoose.model<State>('UserState', UserStateSchema);

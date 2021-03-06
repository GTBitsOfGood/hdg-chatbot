import mongoose, { Schema, Document } from 'mongoose';
import {IMessage} from './ChatbotMessage';

export interface IUserState extends Document {
    userId: string;
    currMessage: IMessage['_id'];
    split: boolean;
    lowData: boolean;
    moduleCompletionTime: Array <Date>;
    lastActivity: Date;
}

const UserStateSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    currMessage: { type: Schema.Types.ObjectId, ref: 'ChatbotMessage', required: true },
    split: { type: Boolean, required: false },
    lowData: { type: Boolean},
    moduleCompletionTime: {type: Array, "default": [null, null, null, null, null]},
    lastActivity: {type: Date}
});

export default mongoose.model<IUserState>("UserState", UserStateSchema);

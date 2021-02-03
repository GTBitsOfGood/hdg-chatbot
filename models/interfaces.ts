export interface UserState extends Document {
    userId: string;
    currMessage: string;
    split: boolean;
}

export interface ChatboxMessage {
    body: string;
    images: Array<ImageBitmap>;
    nextMessages: Array<String>;
    previousMessage: string;
    module: string;
}
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import MongoConnect from './db';
import UserState from '../models/UserState';
import ChatbotMessage from '../models/ChatbotMessage';

const formResponse = async function(state, message) {
    const p = state.currMessage;
    await MongoConnect();
    const prev = await ChatbotMessage.findById(p);
    const map = prev.nextMessages;
    const response = map.get(message);
    return response;
}
    
export default formResponse;

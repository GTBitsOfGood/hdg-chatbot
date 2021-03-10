import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import MongoConnect from './db'
import UserState from '../models/UserState'
import ChatbotMessage from '../models/ChatbotMessage'

import mongoose, {Schema} from 'mongoose';

const formResponse = async function (state, message) {
    const p = state.currMessage
    if (p == null) {
        state.currMessage = '6022178429efc055c8e74e50';
    }
    await MongoConnect()
    const prev = await ChatbotMessage.findById(p)
    const map = prev.nextMessages
    let nextChatbotMessageId = map.get(prev.isQuestion ? message : 'default')
    if (nextChatbotMessageId == null) { 
        nextChatbotMessageId = new Schema.Types.ObjectId('6022178429efc055c8e74e50'); //change this to whatever error message we want to send (for now it is welcome message)
    }
    state.currMessage = nextChatbotMessageId
    state.save(); // move this later
    const response = await ChatbotMessage.findById(nextChatbotMessageId)
    return response
}

export default formResponse

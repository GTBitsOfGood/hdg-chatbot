import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import { IUserState } from '../../ReceiveMessage/models/UserState'
import MongoConnect from '../../ReceiveMessage/Scripts/db'

const MessagingResponse = twilio.twiml.MessagingResponse
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

//will need to update functions when phone number is not directly stored
//another update for when multimedia messages get added, current both temporary string placeholders

export const sendCompletedMessage = async function (id: string, date: string, modules: Array<number>, lowData: boolean) {
    await MongoConnect();

    const message = lowData ? `Hi but on low data, you completed module(s) ${modules.join()} on ${date}. Pls respond.` 
        : `Hi, you completed module(s) ${modules.join()} on ${date}. Pls respond.`;

    await client.messages.create({ body: message, from: '+13159300241', to: id })
}

export const sendInactiveMessage = async function (id: string, date: string, lowData: boolean) {
    await MongoConnect();

    const message = lowData ? `Hi but on low data, you haven't had any activity since ${date}. Pls respond.` 
    : `Hi, you haven't had any activity since ${date}. Pls respond.`;

    await client.messages.create({ body: message, from: '+13159300241', to: id })
}

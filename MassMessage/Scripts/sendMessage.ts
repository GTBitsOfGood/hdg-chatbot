import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import { IUserState } from '../../ReceiveMessage/models/UserState'
import UserState from '../../ReceiveMessage/models/UserState'
import MongoConnect from '../../ReceiveMessage/Scripts/db'
import fixedMessages from '../../ReceiveMessage/fixedMessages'

const MessagingResponse = twilio.twiml.MessagingResponse
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

//will need to update functions when phone number is not directly stored
//another update for when multimedia messages get added, current both temporary string placeholders

export const sendCompletedMessage = async function (user: typeof UserState, id: string, date: string, modules: Array<number>, lowData: boolean) {
    await MongoConnect();

    const message = lowData ? `Hi but on low data, you completed module(s) ${modules.join()} on ${date}. Pls respond.` 
        : `Hi, you completed module(s) ${modules.join()} on ${date}. Pls respond.`;

    await client.messages.create({ body: message, from: '+13159300241', to: id })

    user.currMessage = message;

    await sendDiagnosticQuizzes(user, id, modules, lowData);
}

export const sendDiagnosticQuizzes = async function (user: typeof UserState, id: string, modules: Array<number>, lowData: boolean) {
    await MongoConnect();
    
    const start = lowData ? `Sending you diagnostic quizzes for the modules you have completed.` 
        : `Sending diagnostic quizzes.`;

    await client.messages.create({ body: start, from: '+13159300241', to: id })

    modules.forEach(async function (value) { //probably have to change this later but I'll keep it 
        let key = "";
        switch(value) {
            case 1:
                key = "Exercise Diagnostic";
                break;
            case 2: 
                key = "WASH Diagnostic";
                break;
            case 3: 
                key = "Nutrition Diagnostic";
                break;
            case 4: 
                key = "Maternal Infant Care Diagnostic";
                break;
            case 5:
                key = "Mental Health Diagnostic";
                break;
            default:
                key = "Welcome";
                break;
        }
        const quiz = fixedMessages.get(key)

        await client.messages.create({ body: quiz, from: '+13159300241', to: id })
        user.currMessage = quiz;
    })

}

export const sendInactiveMessage = async function (id: string, date: string, lowData: boolean) {
    await MongoConnect();

    const message = lowData ? `Hi but on low data, you haven't had any activity since ${date}. Pls respond.` 
    : `Hi, you haven't had any activity since ${date}. Pls respond.`;

    await client.messages.create({ body: message, from: '+13159300241', to: id })
}

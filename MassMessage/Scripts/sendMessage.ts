import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import { IUserState } from '../../models/UserState'
import UserState from '../../models/UserState'
import MongoConnect from '../../db'
import fixedMessages from '../../ReceiveMessage/fixedMessages'

const MessagingResponse = twilio.twiml.MessagingResponse
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

//will need to update functions when phone number is not directly stored
//another update for when multimedia messages get added, current both temporary string placeholders

export const sendCompletedMessage = async function (
    user: IUserState,
    id: string,
    date: string,
    modules: Array<number>,
    lowData: boolean,
) {
    await MongoConnect()

    //TODO: delete this message; not actually needed but nice for debugging
    const message = lowData
        ? `Hi but on low data, you completed module(s) ${modules.join()} on ${date}. Pls respond.`
        : `Hi, you completed module(s) ${modules.join()} on ${date}. Pls respond.`

    await client.messages.create({ body: message, from: '+13159300241', to: id })

    await sendDiagnosticQuizzes(user, id, modules, lowData)
}

export const sendDiagnosticQuizzes = async function (
    user: IUserState,
    id: string,
    modules: Array<number>,
    lowData: boolean,
) {
    await MongoConnect()

    //deleted

    modules.forEach(async function (value) {
        //probably have to change this later but I'll keep it
        let key = ''
        switch (value) {
            case 1:
                key = 'exercise diagnostic'
                break
            case 2:
                key = 'wash diagnostic'
                break
            case 3:
                key = 'nutrition diagnostic'
                break
            case 4:
                key = 'maternal infant care diagnostic'
                break
            case 5:
                key = 'mental health diagnostic'
                break
            default:
                //TODO: Replace with Inactivity
                key = 'welcome'
                break
        }
        const quiz = await fixedMessages.get(key)

        await client.messages.create({ body: quiz.body, from: '+13159300241', to: id })
        user.currMessage = quiz
    })

    user.save((err) => {
        if (err) {
            console.error(err)
        }
    })
}

export const sendInactiveMessage = async function (id: string, date: string, lowData: boolean) {
    await MongoConnect()
    //TODO: Replace with Inactivity
    const message = await fixedMessages.get('welcome')

    await client.messages.create({ body: message.body, from: '+13159300241', to: id })
}

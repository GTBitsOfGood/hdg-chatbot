import { IUserState } from '../../models/UserState'
import MongoConnect from '../../db'
import fixedMessages from '../../ReceiveMessage/fixedMessages'
import config from '../../config'

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
): Promise<void> {
    await MongoConnect()

    //TODO: delete this message; not actually needed but nice for debugging
    // const message = lowData
    //     ? `Hi but on low data, you completed module(s) ${modules.join()} on ${date}. Pls respond.`
    //     : `Hi, you completed module(s) ${modules.join()} on ${date}. Pls respond.`

    // await client.messages.create({ body: message, from: '+13159300241', to: id })

    await sendDiagnosticQuizzes(user, id, modules)
}

export const sendDiagnosticQuizzes = async function (
    user: IUserState,
    id: string,
    modules: Array<number>,
): Promise<void> {
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
                key = 'inactivity'
                break
        }
        const quiz = await fixedMessages.get(key)

        if (id.includes('whatsapp')) {
            //TODO: Fix the whatsapp handling, since this means that it was sent from whatsapp
            await client.messages.create({ body: quiz.body, from: config.numbers.whatsapp, to: id })
        } else {
            //TODO: replace with actual whatsapp number
            await client.messages.create({ body: quiz.body, from: config.numbers.sms, to: id })
        }
        user.currMessage = quiz
    })

    user.save((err) => {
        if (err) {
            console.error(err)
        }
    })
}

export const sendInactiveMessage = async function (id: string): Promise<void> {
    await MongoConnect()
    const message = await fixedMessages.get('inactivity')

    if (id.includes('whatsapp')) {
        //TODO: Fix the whatsapp handling, since this means that it was sent from whatsapp
        await client.messages.create({ body: message.body, from: config.numbers.whatsapp, to: id })
    } else {
        //TODO: replace with actual whatsapp number
        await client.messages.create({ body: message.body, from: config.numbers.sms, to: id })
    }
}

import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import MongoConnect from './db'
import UserState from '../models/UserState'

const MessagingResponse = twilio.twiml.MessagingResponse

//change to Promise<UserState> later
const getUserState = async function (req: HttpRequest) {
    const body = qs.parse(req.body)
    // do necessary processing on the request (nothing at this point)
    await MongoConnect()
    const userState = await UserState.find({ userId: body.From as string })
    if (userState.length === 0) {
        const newUserState = new UserState({ userId: body.From })
        newUserState.save(function (err) {
            if (err) {
                console.log(err)
            }
            ;``
        })
        const result = await UserState.find({ userId: body.From as string })
        return result[0]
    } else {
        return userState[0]
    }
}

export default getUserState

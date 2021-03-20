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
    const userStateResult = await UserState.find({ userId: body.From as string })
    if (userStateResult.length === 0) {
        const newUser = new UserState({ userId: body.From })
        newUser.save(function (err) {
            if (err) {
                console.log(err)
            }
            ;``
        })
    }
    // retrieve and return the corresponding state
    return userStateResult[0]
}

export default getUserState

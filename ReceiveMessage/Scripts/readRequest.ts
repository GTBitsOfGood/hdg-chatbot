import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import MongoConnect from './db';
import UserState from '../models/UserState';
import Mongoose from 'mongoose';

const MessagingResponse = twilio.twiml.MessagingResponse;

//change to Promise<UserState> later
const getUserState = async function (req: HttpRequest) {
    const body = qs.parse(req.body);
    // do necessary processing on the request (nothing at this point)
    await MongoConnect();
    const userStateResult = await UserState.findOne({ userId: body.From as string });
    if (!userStateResult) {
        /*
        const messageId = Mongoose.Types.ObjectId("60563883ea9f2e441461118b");
        const newUser = new UserState({ userId: body.From, messageConsent: false, dataConsent: false, currMessage: messageId});
        newUser.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
        return newUser;
        */
    }

    return userStateResult;
};



export default getUserState;

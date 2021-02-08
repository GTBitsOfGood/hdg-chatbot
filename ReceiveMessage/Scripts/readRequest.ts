import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import MongoConnect from './db';
//import UserState from '../models/UserState';

const MessagingResponse = twilio.twiml.MessagingResponse;

const getUserState = async function (req: HttpRequest): Promise<void> {
    const body = qs.parse(req.body);

    // do necessary processing on the request (nothing at this point)

    // retrieve and return the corresponding state
    const id = body.AccountSid;
    //mongoose query here
    await MongoConnect();
    // const Users = ??? need to load database
    // const result = await Users.find({userId: id});
    // return result;
};

export default getUserState;

import { AzureFunction, Context } from "@azure/functions"

import { Schema } from 'mongoose';
import UserState from '../ReceiveMessage/models/UserState';
import MongoConnect from '../ReceiveMessage/Scripts/db';

//the timer is currently set to run everyday at our 9AM (10AM in guatemala), can be changed in function.json
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('Timer function is running late!');
    }
    context.log('Timer trigger function ran!', timeStamp);

    await MongoConnect();

    let date = new Date();
    //avoiding the use of times
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    //set to two months ago
    date.setMonth(date.getMonth() - 2);

    const inactive = await findInactiveUsers(date);
    context.log(inactive);
    const catchup = await findCompletedUsers(date);
    context.log(catchup)
};

//gets users where last activity was exactly 2 months ago
const findInactiveUsers = async function(date:Date) {
    return UserState.find({
        lastActivity: date
    });
}

//gets users where they completed a module 2 months ago
const findCompletedUsers = async function (date:Date) {
    let prevDay = new Date(date.toDateString());
    prevDay.setDate(prevDay.getDate()-1);

    return UserState.find({
        completedTimes: {
            $gte: prevDay,
            $lte: date
        }
    });
}

export default timerTrigger;

import { AzureFunction, Context } from "@azure/functions"

import UserState from '../ReceiveMessage/models/UserState';
import MongoConnect from '../ReceiveMessage/Scripts/db';

import {sendCompletedMessage, sendInactiveMessage} from './Scripts/sendMessage';

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

    const inactive = await messageInactiveUsers(date);
    context.log(inactive);
    const catchup = await messageCompletedUsers(date, context);
    context.log(catchup)
};

//gets users where last activity was exactly 2 months ago
const messageInactiveUsers = async function(date:Date) {
    const allUsers = await UserState.find({
        lastActivity: date
    });
    allUsers.forEach(user => {
        sendInactiveMessage(user.userId, date.toDateString());
    });
}

//gets users where they completed a module 2 months ago
const messageCompletedUsers = async function (date:Date, context: Context) {
    let prevDay = new Date(date.toDateString());
    prevDay.setDate(prevDay.getDate()-1);

    const allUsers = await UserState.find({
        completedTimes: {
            $gte: prevDay,
            $lt: date
        }
    });
    allUsers.forEach(user => {
        const modules = user.completedTimes.map((time, index) => {
            if (time >= prevDay && time < date) { // module was completed 2 months ago
                return index;
            } else {
                return undefined;
            }
        }).filter(x => {
            // undefined is falsy 
            // 0 is also falsy so we need the second check to make sure any match at index 0 goes through
            return (x || x >= 0);
        })
        sendCompletedMessage(user.userId, date.toDateString(), modules);
    });
}

export default timerTrigger;

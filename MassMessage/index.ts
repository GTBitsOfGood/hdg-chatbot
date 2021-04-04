import { AzureFunction, Context } from '@azure/functions'
import Mongoose from 'mongoose';

import UserState from '../ReceiveMessage/models/UserState'
import MongoConnect from '../ReceiveMessage/Scripts/db'

import { sendCompletedMessage, sendInactiveMessage } from './Scripts/sendMessage'

//the timer is currently set to run everyday at our 9AM (10AM in guatemala), can be changed in function.json
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    const timeStamp = new Date().toISOString()

    if (myTimer.isPastDue) {
        context.log('Timer function is running late!')
    }
    context.log('Timer trigger function ran!', timeStamp)

    await MongoConnect()

    const curDate = new Date()
    //avoiding the use of times
    curDate.setHours(0)
    curDate.setMinutes(0)
    curDate.setSeconds(0)
    curDate.setMilliseconds(0)
    // passing this date around so we don't need to repeatedly set times to 0

    const inactive = await messageInactiveUsers(curDate)
    context.log(inactive);
    const completed = await messageCompletedUsers(curDate, context)
    context.log(completed);
}

//gets users where last activity was exactly 2 weeks ago
const messageInactiveUsers = async function (date: Date) {
    //set to two weeks ago
    const twoWeeks = new Date(date);
    twoWeeks.setDate(twoWeeks.getDate() - 14);
    
    const allUsers = await UserState.find({
        lastActivity: twoWeeks,
    })
    allUsers.forEach((user) => {
        //sendInactiveMessage(user.userId, twoWeeks.toDateString(), user.lowData)
        //hardcoded to welcome message
        user.currMessage = Mongoose.Types.ObjectId("6022178429efc055c8e74e50");
        user.save((err) => {
            if (err) {
                console.error(err);
            }
        })
    })
    return allUsers;
}

//gets users where they completed a module 2 months ago
const messageCompletedUsers = async function (date: Date, context: Context) {
    //set to two months ago
    const twoMonths = new Date(date);
    twoMonths.setMonth(twoMonths.getMonth() - 2);

    const prevDay = new Date(twoMonths)
    prevDay.setDate(prevDay.getDate() - 1)
    

    const allUsers = await UserState.find({
        moduleCompletionTime: {
            $gt: prevDay,
            $lt: twoMonths,
        },
    })
    allUsers.forEach((user) => {
        const modules = user.moduleCompletionTime
            .map((time, index) => {
                if (time >= prevDay && time < twoMonths) {
                    // module was completed 2 months ago
                    return index
                } else {
                    return undefined
                }
            })
            .filter((x) => {
                // undefined is falsy
                // 0 is also falsy so we need the second check to make sure any match at index 0 goes through
                return x || x >= 0
            })
        if (modules === undefined) {
            sendInactiveMessage(user.userId, twoMonths.toDateString(), user.lowData)
            //hardcoded to welcome message
            user.currMessage = Mongoose.Types.ObjectId("6022178429efc055c8e74e50")
        } else {
            sendCompletedMessage(user.userId, twoMonths.toDateString(), modules, user.lowData)
        }
    })
    return allUsers;
}

export default timerTrigger

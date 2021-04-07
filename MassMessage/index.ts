import { AzureFunction, Context } from '@azure/functions'
import Mongoose from 'mongoose'

import UserState from '../ReceiveMessage/models/UserState'
import MongoConnect from '../ReceiveMessage/Scripts/db'

import { sendCompletedMessage, sendInactiveMessage } from './Scripts/sendMessage'
import fixedMessages from '../ReceiveMessage/fixedMessages'

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
    context.log(inactive)
    const completed = await messageCompletedUsers(curDate)
    context.log(completed)
}

//gets users where last activity was exactly 2 weeks ago
const messageInactiveUsers = async function (date: Date) {
    //set to two weeks ago
    const twoWeeks = new Date(date)
    twoWeeks.setDate(twoWeeks.getDate() - 14)

    const nextDay = new Date(twoWeeks)
    nextDay.setDate(nextDay.getDate() + 1)

    const allUsers = await UserState.find({
        lastActivity: {
            $lt: nextDay,
            $gte: twoWeeks,
        },
    })
    allUsers.forEach(async (user) => {
        sendInactiveMessage(user.userId, twoWeeks.toDateString(), user.lowData)
        //hardcoded to welcome message
        user.currMessage = (await fixedMessages.get('welcome'))._id
        user.save((err) => {
            if (err) {
                console.error(err)
            }
        })
    })
    return allUsers
}

//gets users where they completed a module 2 months ago
const messageCompletedUsers = async function (date: Date) {
    //set to two months ago
    const twoMonths = new Date(date)
    twoMonths.setMonth(twoMonths.getMonth() - 2)

    const nextDay = new Date(twoMonths)
    nextDay.setDate(nextDay.getDate() + 1)

    const allUsers = await UserState.find({
        moduleCompletionTime: {
            $elemMatch: {
                $lt: nextDay,
                $gte: twoMonths,
            },
        },
    })

    allUsers.forEach((user) => {
        const modules = user.moduleCompletionTime
            .map((time, index) => {
                if (time >= twoMonths && time < nextDay) {
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

        sendCompletedMessage(user, user.userId, twoMonths.toDateString(), modules, user.lowData)

        /*
        modules.forEach(mod => {
            sendCompletedMessage(user, user.userId, twoMonths.toDateString(), modules, user.lowData)
        });
        */
        //not sure how to save cur userState if we potentially have two completed modules

        /*
        // can't hardcode at the moment but would be here
        // user.currMessage = Mongoose.Types.ObjectId("????");
        user.currMessage = Mongoose.Types.ObjectId("6022178429efc055c8e74e52");
        user.save((err) => {
            if (err) {
                console.error(err);
            }
        })
        */
    })

    return allUsers
}

export default timerTrigger

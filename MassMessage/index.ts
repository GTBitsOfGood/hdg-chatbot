import { AzureFunction, Context } from '@azure/functions'

import UserState from '../models/UserState'
import MongoConnect from '../db'

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

    const completed = await messageCompletedUsers(curDate)
    const inactive = await messageInactiveUsers(curDate)
    context.log(completed)
    context.log(inactive)
    inactive.forEach(async (user) => {
        if (completed.has(user.userId)) return
        sendInactiveMessage(user.userId)
        //hardcoded to welcome message
        user.currMessage = (await fixedMessages.get('welcome'))._id
        user.save((err) => {
            if (err) {
                console.error(err)
            }
        })
    })
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
    return allUsers
}

//gets users where they completed a module 2 months ago
const messageCompletedUsers = async function (date: Date) {
    //set to two months ago
    const twoMonths = new Date(date)
    twoMonths.setDate(twoMonths.getDate() - 56)

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

    const completedSet = new Set<string>()

    allUsers.forEach((user) => {
        let module = -1
        let found = false
        for (let i = 0; i < user.moduleCompletionTime.length; i++) {
            const time = user.moduleCompletionTime[i]
            if (time >= twoMonths && time < nextDay) {
                if (found) {
                    time.setDate(time.getDate() + 1)
                    user.moduleCompletionTime.set(i, time)
                } else {
                    module = i
                    found = true
                }
            }
        }

        sendCompletedMessage(user, user.userId, twoMonths.toDateString(), module)
        completedSet.add(user.userId)
        user.save((err) => {
            if (err) {
                console.error(err)
            }
        })

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

    return completedSet
}

export default timerTrigger

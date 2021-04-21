import { HttpRequest } from '@azure/functions'
import qs from 'qs'
import MongoConnect from '../../db'
import UserState, { IUserState } from '../../models/UserState'

//change to Promise<UserState> later
const getUserState = async function (req: HttpRequest): Promise<IUserState> {
    const body = qs.parse(req.body)
    // do necessary processing on the request (nothing at this point)
    await MongoConnect()
    const userStateResult = await UserState.findOne({ userId: body.From as string })
    // if (!userStateResult) {
    //     const newUser = new UserState({ userId: body.From })
    //     newUser.save(function (err) {
    //         if (err) {
    //             console.log(err)
    //         }
    //     })
    // }
    // retrieve and return the corresponding state
    return userStateResult
}

export default getUserState

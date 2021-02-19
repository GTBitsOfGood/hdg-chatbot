import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import Mongo from '../ReceiveMessage/Scripts/db'
import xlsxFile from 'read-excel-file/node'
import ChatbotMessage, { IMessage } from '../ReceiveMessage/models/ChatbotMessage'

type MessageToBeCreated = {
    record: IMessage
    keywords: string[]
    nextMessages: number[]
}

//https://medium.com/javascript-in-plain-english/how-to-read-an-excel-file-in-node-js-6e669e9a3ce1
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.')

    let success = true

    const path = req.query.path || (req.body && req.body.path)

    //from the root dir, for whatever reason
    let defaultPath = './InputData/messages.xlsx'
    if (path) {
        defaultPath = path
    }
    //CHANGE THIS TO MATCH THE CHATBOTMESSAGE SCHEMA
    //TODO: FIgure out keywords
    const schema = {
        ID: {
            prop: 'messageId',
            type: Number,
            required: true,
        },
        BODY: {
            prop: 'body',
            type: String,
            required: true,
        },
        MULTIMEDIA: {
            prop: 'multimedia',
            type: String,
        },
        'NEXT MESSAGES': {
            prop: 'nextMessages',
            type: String,
        },
        'PREVIOUS MESSAGE': {
            prop: 'prevMessage',
            type: Number,
        },
        MODULE: {
            prop: 'module',
            type: Number,
        },
        'LOW DATA': {
            prop: 'lowDataBody',
            type: String, // it is possible to validate each of these values.
        },
        KEYWORDS: {
            prop: 'keywords',
            type: String,
        },
        ISQUESTION: {
            prop: 'isQuestion',
            type: Boolean,
        },
    }
    await Mongo()
    xlsxFile(defaultPath, { schema }).then(async ({ rows, errors }) => {
        if (errors.length != 0) {
            success = false
            return
        }
        const messagesToInsert = new Map<number, MessageToBeCreated>()
        // 1.) Make a map based upon all of the messageIds, with the value being a chatbotMessage
        for (const row of rows) {
            console.log(row)
            // 0.) Convert nextMessages into an array; same with keywords:
            const nextMessagesArray: number[] = row.nextMessages.split(',').map((x: string) => parseInt(x))
            const nextKeywordsArray: string[] = row.keywords.split(',')

            if (nextMessagesArray.length != nextKeywordsArray.length) {
                success = false
                return
            }

            // 1.) query for the messageId
            const existingMessage = await ChatbotMessage.findOne({
                messageId: row.messageId,
            }).exec()

            // 2.) If that record exists, set the value to be that chatbotMessage
            if (!existingMessage) {
                messagesToInsert.set(row.messageId, {
                    record: existingMessage[0],
                    keywords: nextKeywordsArray,
                    nextMessages: nextMessagesArray,
                })
            }
            // 3.) else, create a new one
            else {
                messagesToInsert.set(row.messageId, {
                    record: new ChatbotMessage({
                        //put stuff here
                        body: row.body,
                        nextMessages: {},
                        images: row.images,
                        module: row.module,
                        isQuestion: row.isQuestion,
                        lowData: row.lowDataBody,
                        previousMessage: 'lol oops',
                    }),
                    keywords: nextKeywordsArray,
                    nextMessages: nextMessagesArray,
                })
            }
        }
        if (success == false) {
            return
        }

        // 2.) Iterate through every entry of the map, and make connections between all of the messages.
        for (const [key, record] of messagesToInsert) {
            for (let i = 0; i < record.nextMessages.length; i++) {
                const nextMessage = await ChatbotMessage.findOne({
                    messageId: record.nextMessages[i],
                }).exec()
                record.record.nextMessages.set(record.keywords[i], nextMessage['_id'])
            }
        }
        // 3.) Save every record. This could be done in conjunction with (2), but save() is safer than insertMany(), and this function
        //      won't be constantly called, so we can take the hit in efficiency.
        //      The one caveat is that if there is an error somehow with saving, then it will keep saving everything else, which probably
        //      isn't desirable. If we do a good job error checking above, though, that would be fine.
        for (const [key, record] of messagesToInsert) {
            record.record.save()
        }
    })
    let responseMessage = path
        ? 'Input, ' + path + '. This HTTP triggered function executed successfully.'
        : 'This HTTP triggered function executed successfully. Pass a path for not the default excel sheet.'
    if (!success) {
        responseMessage = 'Your upload was incorrect. Please verify the xlsx spreadsheet format matches.'
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage,
    }
}

export default httpTrigger

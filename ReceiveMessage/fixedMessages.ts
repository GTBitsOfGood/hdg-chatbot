import ChatbotMessage, { IMessage } from './models/ChatbotMessage'
import db from './Scripts/db'

interface templateFixedMessageHandler {
    (messageId: number): Promise<IMessage>
}

const generalHandler: templateFixedMessageHandler = async function (messageId: number): Promise<IMessage> {
    db()
    return ChatbotMessage.findOne({ messageId: messageId })
}

const fixedMessages: Map<string | qs.ParsedQs | string[] | qs.ParsedQs[], Promise<IMessage>> = new Map<
    string | qs.ParsedQs | string[] | qs.ParsedQs[],
    Promise<IMessage>
>()

fixedMessages.set('messagepermission', generalHandler(-1))
fixedMessages.set('datapermission', generalHandler(0))
fixedMessages.set('welcome', generalHandler(1))
fixedMessages.set('moduleone', generalHandler(100))
fixedMessages.set('moduletwo', generalHandler(200))
fixedMessages.set('modulethree', generalHandler(300))
fixedMessages.set('modulefour', generalHandler(400))
fixedMessages.set('modulefive', generalHandler(500))
fixedMessages.set('commands', generalHandler(911))
fixedMessages.set('exercise diagnostic', generalHandler(1100))
fixedMessages.set('wash diagnostic', generalHandler(1200))
fixedMessages.set('nutrition diagnostic', generalHandler(1300))
fixedMessages.set('maternal infant care diagnostic', generalHandler(1400))
fixedMessages.set('mental health diagnostic', generalHandler(1500))
fixedMessages.set('error message', generalHandler(4200))
fixedMessages.set('modules completed message', generalHandler(9696))
fixedMessages.set('complete exit message', generalHandler(1738))
fixedMessages.set('num modules', generalHandler(4201))
fixedMessages.set('helpme', generalHandler(950))

export default fixedMessages

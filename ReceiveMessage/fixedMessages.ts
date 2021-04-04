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

fixedMessages.set('MessagePermission', generalHandler(-1))
fixedMessages.set('DataPermission', generalHandler(0))
fixedMessages.set('Welcome', generalHandler(1))
fixedMessages.set('ModuleOne', generalHandler(100))
fixedMessages.set('ModuleTwo', generalHandler(200))
fixedMessages.set('ModuleThree', generalHandler(300))
fixedMessages.set('ModuleFour', generalHandler(400))
fixedMessages.set('ModuleFive', generalHandler(500))
fixedMessages.set('commands', generalHandler(911))
fixedMessages.set('helpme', generalHandler(950))
fixedMessages.set('Exercise Diagnostic', generalHandler(1100))
fixedMessages.set('WASH Diagnostic', generalHandler(1200))
fixedMessages.set('Nutrition Diagnostic', generalHandler(1300))
fixedMessages.set('Maternal Infant Care Diagnostic', generalHandler(1400))
fixedMessages.set('Mental Health Diagnostic', generalHandler(1500))

export default fixedMessages

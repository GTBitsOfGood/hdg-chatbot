require('dotenv').config()

export default {
    db: {
        name: process.env.DB_NAME, //need to change
        url: process.env.DB_URL, //need to change
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        },
    },
    numbers: {
        whatsapp: process.env.WHATSAPP_NUMBER,
        sms: process.env.SMS_NUMBER,
    },
    account_sid: process.env.TWILIO_ACCOUNT_SID,
    auth_token: process.env.TWILIO_AUTH_TOKEN,
}

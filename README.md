# hdg-chatbot

**Local Development**

Before doing anything:
```npm install```

Stick the necessary ```.env``` file into your repo:
```
npm run secrets
```
OR
```
npm run secrets:login
npm run secrets:sync
```

Use the former for Mac, and the latter for Windows. This is the BoG development Bitwarden account.

To actually run Azure Functions and supporting source code locally, first run these commands:
```
npm run ngrok-host
npm run ngrok
```
These should be running concurrently, so split terminals or open up another one to have both running. The first command compiles the ```ts``` and starts up the Azure Functions on ```localhost:8080```, while the second exposes that same port to the internet using ngrok. 

Copy the ngrok link popped out by the second command. Remember to input your phone number as an approved sender on the link here: https://www.twilio.com/console/phone-numbers/incoming (SMS). Then, within the Twilio dashboard, navigate to where our Twilio SMS number exists and paste the ngrok link copied into the where incoming messages should be passed on to. Remember to include the HTTP query route associated with the proper Azure Function 

To test with whatsapp, go through the set up steps here and paste the ngrok link into the endpoint at the end of it. https://www.twilio.com/console/sms/whatsapp/learn, but Whatsapp is annoying, so don't do that.

There is CI/CD forthcoming that will deploy the Azure Functions to the cloud, but that has not arrived at the time of writing this.

enjoy!

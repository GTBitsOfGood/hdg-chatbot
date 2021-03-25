const specialMessageIds = new Map()

//restarts progress
specialMessageIds.set(
    'restart',
    '(Welcome Message) What would you like to learn about? 1. (emoji) Exercise - brief description2. (emoji) WASH- brief description3. (emoji) Nutrition-brief description4. (emoji) Maternal Infant Care-brief description5. (emoji) Mental Health- brief description',
)

//checking # of completed modules
specialMessageIds.set('completed', '')

// message that gives full list of special messages commands
specialMessageIds.set('commands', 'Here is a list of commands that can be used anywhere: restart, completed, help')

// help for app navigation
specialMessageIds.set('help', '')

// exit by deleting user state
specialMessageIds.set('exit', '')

export default specialMessageIds

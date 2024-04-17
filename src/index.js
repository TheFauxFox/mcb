const mineflayer = require('mineflayer')
require('dotenv').config()

const bot = mineflayer.createBot({
    host: 'play.theoasismc.com',
    username: process.env.EMAIL,
    password: process.env.PASSWORD,
    auth: "microsoft",
})

bot.loadPlugin(require('mineflayer-dashboard'))

bot.once('inject_allowed', () => {
    global.console.log = bot.dashboard.log
    global.console.error = bot.dashboard.log
})

bot.on('spawn', () => {
    bot.dashboard.log('Logged in!')
})

// Log errors and kick reasons:
bot.on('kicked', bot.dashboard.log)
bot.on('error', bot.dashboard.log)
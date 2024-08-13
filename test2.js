require('dotenv').config();

const password = `${process.env.PASSWORD}`
const mail = `${process.env.MAIL}`
const url = `${process.env.WEBHOOK_URL}`
console.log(`[INFO] Password: ${password}`)
console.log(`[INFO] Mail: ${mail}`)
console.log(`[INFO] Webhook URL: ${url}`)
const user_list = process.env.USER_BALANCE_LIST.split(',')
console.log(user_list)


const {WebhookClient} = require('discord.js')
const webhook =
    new WebhookClient({
        url:
            `${url}`
    })

const mineflayer = require('mineflayer')

class User {
    constructor(username, money, gem, token) {
        this.username = username;
        this.money = money;
        this.gem = gem;
        this.token = token;
    }

    send() {
        const title = `${this.username}\'s Balance`;
        webhook.send(
            {
                username: `${real_bot.username}`,
                avatarURL: `https://mineskin.eu/avatar/${real_bot.username}/100.png`,
                embeds: [{
                    title: title,
                    fields: [
                        {
                            name: 'Money',
                            value: this.money,
                            inline: false
                        },
                        {
                            name: 'Gem',
                            value: this.gem,
                            inline: false
                        },
                        {
                            name: 'Token',
                            value: this.token,
                            inline: false
                        }
                    ],
                    color: 0xffae00,
                    timestamp: new Date().toISOString()
                }]
            }
    )
    }
}

const user = new User('', '', '', '');

let real_bot = login();

function get_balances() {
    for(let i = 0; i < user_list.length; i++) {
        setTimeout(() => {
            real_bot.chat(`/balance ${user_list[i]}`)
            setTimeout(() => {
                user.send()
            }, 500)
        }, 2000 * i)
    }
}

setInterval(() => {
    get_balances()
}, 3600 * 1000)

function login() {
    let bot = mineflayer.createBot({
        host: 'smc.fadecloud.com', // minecraft server ip
        username: `${mail}`, // username to join as if auth is `offline`, else a unique identifier for this account. Switch if you want to change accounts
        auth: 'microsoft', // for offline mode servers, you can set this to 'offline'
        port: 25565,              // set if you need a port that isn't 25565
        version: '1.13',           // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
        password: `${password}`      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
    })

    bot.once('login', (player) => {
        console.log('I\'m now logged-in')
        webhook.send({
            username: `${bot.username}`,
            avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
            embeds: [{
                title: 'Information',
                description: 'I\'m now logged on `FadeCloud`',
                color: 0xffae00,
                timestamp: new Date().toISOString()
            }]
        })
        bot.chat('/server gens')
        setTimeout(() => {
            get_balances()
        }, 500)

    })

    bot.on('message', (message) => {
        const text = message.toString({key: 'en'});
        if (text?.includes('Coinflip') || text?.includes('Found')) {
            return
        }

        if (text?.includes('\'s Balance')) {
            logUsername(message)
        }

        if (text?.includes('Money')) {
            const color = 0x00ff00;
            logBalances(message, color);
        }
        if (text?.includes('Tokens') && !text?.includes('Buff') && !text?.includes('Trait')) {
            const color = 0xffd000;
            logBalances(message, color);
        }
        if (text?.includes('Gems')) {
            const color = 0x00ffff;
            logBalances(message, color);
        }
    })

// Log errors and kick reasons:
    bot.on('kicked', (reason, loggedIn) => {
        console.log(`Bot kicked for: ${reason}`)
        console.log('Reconnecting in 30s...')
        webhook.send({
            username: `${bot.username}`,
            avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
            embeds: [{
                title: 'Information',
                description: `I have been kicked from the server...\nReason: \`${reason}\`\n\nReconnecting in 30s...`,
                color: 0xffae00,
                timestamp: new Date().toISOString()
            }]
        })
        setTimeout(() => {
            reconnect();
        }, 30 * 1000);
    })

    bot.on('error', (err) => {
        console.log(`Bot errored for: ${err}`)
        console.log('Reconnecting in 30s...')
        webhook.send({
            username: `${bot.username}`,
            avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
            embeds: [{
                title: 'Information',
                description: `I have encountered an error...\n\`${err}\`\n\nReconnecting in 30s...`,
                color: 0xffae00,
                timestamp: new Date().toISOString()
            }]
        })
        setTimeout(() => {
            reconnect();
        }, 30 * 1000);
    })

    return bot
}

function reconnect() {
    real_bot.end();
    real_bot = login();
}

function logBalances(message, color) {
    console.log(message);
    const balances = message?.json;
    console.log(balances);

    const title = balances?.extra[1]?.text;
    const Value = balances?.extra[0]?.text;

    if (title === 'Money') {
        user.money = Value;
    }

    if (title === 'Gems') {
        user.gem = Value;
    }

    if (title === 'Tokens') {
        user.token = Value;
    }
}

function logUsername(message) {
    console.log(message);
    console.log(message?.json);
    user.username = message?.json?.text;
}

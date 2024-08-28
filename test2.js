require('dotenv').config();

const password = `${process.env.PASSWORD}`
const mail = `${process.env.MAIL}`
console.log(`[INFO] Password: ${password}`)
console.log(`[INFO] Mail: ${mail}`)
const user_list = process.env.USER_BALANCE_LIST.split(',')
console.log(user_list)
const ping_list = process.env.PING_LIST

let next_event = '';
let second = 0;
const {WebhookClient} = require('discord.js')
const webhook_balance =
    new WebhookClient({
        url:
            `${process.env.WEBHOOK_URL_BALANCE}`
    })

const webhook_ping = new WebhookClient({
    url:
        `${process.env.WEBHOOK_URL_EVENT}`
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
        webhook_balance.send(
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

const user = new User('Summerapi\'s ', '1', '1', '1');

let real_bot = login();

function get_balances() {
    for(let i = 0; i < user_list.length; i++) {
        setTimeout(() => {
            real_bot.chat(`/balance ${user_list[i]}`)
            setTimeout(() => {
                user.send()
            }, 1000)
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
        webhook_balance.send({
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
            get_next_event()
        }, 1000)
        setTimeout(() => {
            get_balances()
        }, 3000)
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

        if (text?.includes("Next Event")) {
            console.log(message)
            next_event = text.split(":")[1].trim();
        }

        if (text?.includes("Time")) {
            console.log(message)
            let in_time = text.split(":")[1].trim();
            // parse time in format xxm xxs to seconds
            let time = in_time.split(" ");
            second = 0;
            if (time.length === 2) {
                second = parseInt(time[0].replace("m", "")) * 60 + parseInt(time[1].replace("s", ""));
            } else {
                second = parseInt(time[0].replace("s", ""));
            }

            setTimeout(() => {
                let now = new Date();
                let unix_timestamp = now.getTime();
                let seconds = now.getSeconds() + second;
                now.setSeconds(seconds);
                console.log(now)
                unix_timestamp = now.getTime() / 1000;
                unix_timestamp = unix_timestamp.toString().split(".")[0];
                console.log(unix_timestamp)

                setTimeout(() => {
                    nextPing();
                }, (second - (5*60))* 1000)

                setTimeout(() => {
                    get_next_event();
                }, (second + (5*60))* 1000)

                webhook_ping.send({
                    username: `${bot.username}`,
                    avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
                    embeds: [{
                        title: 'Information',
                        description: `Next Event: ${next_event} <t:${unix_timestamp}:R> \n<t:${unix_timestamp}:T>`,
                        color: 0xffae00,
                        timestamp: new Date().toISOString()
                    }]
                })
                second = 0;
                }, 1000 * 2)
        }

        if (text?.includes("Duration")) {
            console.log(message)
            let in_time = text.split(":")[1].trim();
            // parse time in format xxm xxs to seconds
            let time = in_time.split(" ");
            second = 0;
            if (time.length === 2) {
                second = parseInt(time[0].replace("m", "")) * 60 + parseInt(time[1].replace("s", ""));
            } else {
                second = parseInt(time[0].replace("s", ""));
            }

            setTimeout(() => {
                let now = new Date();
                let unix_timestamp = now.getTime();
                let seconds = now.getSeconds() + second;
                now.setSeconds(seconds);
                console.log(now)
                unix_timestamp = now.getTime() / 1000;
                unix_timestamp = unix_timestamp.toString().split(".")[0];
                console.log(unix_timestamp)
                setTimeout(() => {
                    currentPing();
                }, (second - (5*60))* 1000)

                setTimeout(() => {
                    get_next_event();
                }, (second + (5*60))* 1000)
                webhook_ping.send({
                    username: `${bot.username}`,
                    avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
                    embeds: [{
                        title: 'Information',
                        description: `Current Event: ${next_event}  Finish <t:${unix_timestamp}:R>`,
                        color: 0xffae00,
                        timestamp: new Date().toISOString()
                    }]
                })
                second = 0;
            }, 1000 * 2)
        }
    })

// Log errors and kick reasons:
    bot.on('kicked', (reason, loggedIn) => {
        console.log(`Bot kicked for: ${reason}`)
        console.log('Reconnecting in 30s...')
        webhook_balance.send({
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
        webhook_balance.send({
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

function get_next_event() {
    real_bot.chat('/events')
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

function nextPing() {
    let message = `event ${next_event} is starting in 5 minutes! ${ping_list}`
    webhook_ping.send({
        username: `${real_bot.username}`,
        avatarURL: `https://mineskin.eu/avatar/${real_bot.username}/100.png`,
        content: message
    })
}

function currentPing() {
    let message = `event ${next_event} is active ${ping_list}`
    webhook_ping.send({
        username: `${real_bot.username}`,
        avatarURL: `https://mineskin.eu/avatar/${real_bot.username}/100.png`,
        content: message
    })
}

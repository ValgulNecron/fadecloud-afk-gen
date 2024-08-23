const baseSellingInterval = 15; // in seconds

require('dotenv').config();

const password = `${process.env.PASSWORD}`
const mail = `${process.env.MAIL}`
const url = `${process.env.WEBHOOK_URL}`
const url_balance = `${process.env.WEBHOOK_URL_BALANCE}`
console.log(`[INFO] Password: ${password}`)
console.log(`[INFO] Mail: ${mail}`)
console.log(`[INFO] Webhook URL: ${url}`)


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
                username: `${bot.username}`,
                avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
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

const mineflayer = require('mineflayer')
let bot = login()

const {WebhookClient} = require('discord.js')
const webhook =
    new WebhookClient({
        url:
            `${url}`
    })

const webhook_balance =
    new WebhookClient({
        url:
            `${url_balance}`
    })

const moneyRegex = /(\$)?\s*(\d+(?:\.\d+)*)(?:\s*[A-Za-z])?/;
const xpRegex = /(\d+,\d+)/;
const boosterRegex = /(\d+[.,]\d)/
let user_list = [];
let do_balance = false
if (do_balance) {
    user_list = process.env.USER_BALANCE_LIST.split(',')
}



let moneyBooster = 0.0;
let xpBooster = 0.0;

let totalSessionMoney = 0.0;
let totalSessionXP = 0.0;

let totalSessionItemsSold = 0;
let soldItems = 0;

let currentClouds = 0;

let totalSessionTime;

const seconds = 1000;
const minutes = seconds * 60;
const hours = minutes * 60;

setTimeout(() => {
    setInterval(() => {
        console.log('Selling my inventory...')
        bot.inventory.items().forEach((item) => {
            if(item.displayName.toLowerCase().includes('hoe') || item.displayName.toLowerCase().includes('egg')) {} else {
                soldItems += item.count;
            }
        })
        bot.chat('/sellall')
    }, baseSellingInterval * 1000)
    setInterval(() => {
        console.log('Boost')
        bot.chat('/boosters')
    }, 30 * minutes)
    setInterval(() => {
        console.log('Getting cloud balance...')
        bot.chat('/cloud balance')
    }, hours)
    if (do_balance) {
        setInterval(() => {
            get_balances()
        }, 3600 * 1000)
    }
}, seconds)



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
                color: 0xe100ff,
                timestamp: new Date().toISOString()
            }]
        })

        bot.chat('/server gens')
        setTimeout(() => {
            console.log('Sellall')
            bot.inventory.items().forEach((item) => {
                if(item.displayName.toLowerCase().includes('hoe') || item.displayName.toLowerCase().includes('egg')) {} else {
                    soldItems += item.count;
                }
            })
            bot.chat('/sellall')
        }, 1500)
        setTimeout(() => {
            console.log('Boost')
            bot.chat('/boosters')
            totalSessionTime = new Date().getTime();
        }, 500)

        if (do_balance) {
            setTimeout(() => {
                get_balances()
            }, 500)
        }
    })

    // turn on gravity
    bot.physicsEnabled = true;

    bot.on('windowOpen', (window) => {
        const title = window.title
        console.log(`[INFO] Window title: ${title}`)
        if (title.includes('Active Boosters')) {
            console.log('Boost...')
            const items = window.containerItems()
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item) {
                    if (item.displayName === 'Emerald') {
                        const lore = item.customLore[3]
                        const boosterMatch = lore.match(boosterRegex);
                        // parse boosterMatch as a number
                        if (boosterMatch && boosterMatch.length > 1) {
                            moneyBooster = parseFloat(boosterMatch[0]);
                        }
                    }
                    if (item.displayName === 'Bottle o\' Enchanting') {
                        const lore = item.customLore[3]
                        const boosterMatch = lore.match(boosterRegex);
                        // parse boosterMatch as a number
                        if (boosterMatch && boosterMatch.length > 1) {
                            xpBooster = parseFloat(boosterMatch[0]);
                        }
                    }
                }
            }
        }
        window.close()
    })

    bot.on('message', (message) => {
        const text = message.toString({key: 'en'});
        if (text?.includes('Sold the items in your Inventory for')) {
            const message_json = message.toString();
            const moneyMatch = message_json.match(moneyRegex);
            let moneyValue = '';
            if (moneyMatch && moneyMatch.length > 1) {
                moneyValue = moneyMatch[0]; // Extracting the first captured group (the actual value)
            }

            // Extracting XP value
            const xpMatch = message_json.match(xpRegex);
            let xpValue = '';
            if (xpMatch && xpMatch.length > 1) {
                xpValue = xpMatch[0]; // Extracting the first captured group (the actual value)
            }
            // parse xpValue as a number
            let boostXpValue = parseInt(xpValue.replace(',', ''));
            boostXpValue = boostXpValue * xpBooster;

            console.log(`[INFO] XP: ${xpValue}`)
            console.log(`[INFO] XP Booster: ${xpBooster}`)
            console.log(`[INFO] Total XP: ${boostXpValue}`)

            // parse moneyValue as a number and multiply if k or m or b or t
            let boostMoneyValue = moneyValue.replace(',', '');
            boostMoneyValue = boostMoneyValue.replace('$', '');
            if (boostMoneyValue.toLowerCase().includes('k')) {
                console.log(`[INFO] k`)
                const lowerCase = boostMoneyValue.toLowerCase();
                console.log(`[INFO] Lowercase: ${lowerCase}`)
                boostMoneyValue = parseFloat(lowerCase.replace('k', '')) * 1000;
            } else if (boostMoneyValue.toLowerCase().includes('m')) {
                console.log(`[INFO] m`)
                const lowerCase = boostMoneyValue.toLowerCase();
                console.log(`[INFO] Lowercase: ${lowerCase}`)
                boostMoneyValue = parseFloat(lowerCase.replace('m', '')) * 1000000;
            } else if (boostMoneyValue.toLowerCase().includes('b')) {
                console.log(`[INFO] b`)
                const lowerCase = boostMoneyValue.toLowerCase();
                console.log(`[INFO] Lowercase: ${lowerCase}`)
                boostMoneyValue = parseFloat(lowerCase.replace('b', '')) * 1000000000;
            }else if (boostMoneyValue.toLowerCase().includes('t')) {
                console.log(`[INFO] t`)
                const lowerCase = boostMoneyValue.toLowerCase();
                console.log(`[INFO] Lowercase: ${lowerCase}`)
                boostMoneyValue = parseFloat(lowerCase.replace('t', '')) * 100000000
            } else {
                console.log(`[INFO] none`)
                boostMoneyValue = parseFloat(boostMoneyValue);
            }
            boostMoneyValue = boostMoneyValue * moneyBooster;

            console.log(`[INFO] Money: ${moneyValue}`)
            console.log(`[INFO] Money Booster: ${moneyBooster}`)
            console.log(`[INFO] Total Money: ${boostMoneyValue}`)


            const currentTime = new Date().getTime();
            const timeDiff = currentTime - totalSessionTime;
            const timeDiffInHours = timeDiff / (1000 * 3600);
            totalSessionMoney += boostMoneyValue;
            totalSessionXP += boostXpValue;
            totalSessionItemsSold += soldItems;

            webhook.send({
                username: `${bot.username}`,
                avatarURL: `https://mineskin.eu/avatar/${bot.username}/100.png`,
                embeds: [{
                    title: `Selling report (${baseSellingInterval}s interval)`,
                    description: `${message}`,
                    fields: [
                        {
                            name: 'Money',
                            value: `${moneyValue}`,
                            inline: true
                        },
                        {
                            name: 'Money Booster',
                            value: `${moneyBooster}`,
                            inline: true
                        },
                        {
                            name: 'Total Money',
                            value: `${boostMoneyValue}`,
                            inline: true
                        },
                        {
                            name: 'XP',
                            value: `${xpValue}`,
                            inline: true
                        },

                        {
                            name: 'XP Booster',
                            value: `${xpBooster}`,
                            inline: true
                        },

                        {
                            name: 'Total XP',
                            value: `${boostXpValue}`,
                            inline: true
                        },
                        {
                            name: 'Total Session Money',
                            value: `${totalSessionMoney}`,
                            inline: true
                        },
                        {
                            name: 'Total Session XP',
                            value: `${totalSessionXP}`,
                            inline: true
                        },
                        {
                            name: 'Total Session Time',
                            value: `${timeDiffInHours} hours`,
                            inline: true
                        },
                        {
                            name: 'Items Sold',
                            value: `${soldItems}`,
                            inline: true
                        },
                        {
                            name: 'Total Session Items Sold',
                            value: `${totalSessionItemsSold}`,
                            inline: true
                        },
                        {
                            name: 'Current Clouds',
                            value: `${currentClouds}`,
                            inline: true
                        }
                    ],
                    color: 0xff00ae,
                    timestamp: new Date().toISOString()
                }]
            })
            soldItems = 0;
        }


        if (!do_balance || (text?.includes('Coinflip') || text?.includes('Found'))) {
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
                color: 0xff8000,
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
                color: 0xff0000,
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
    bot.end();
    bot = login();
}

function get_balances() {
    for(let i = 0; i < user_list.length; i++) {
        setTimeout(() => {
            bot.chat(`/balance ${user_list[i]}`)
            setTimeout(() => {
                user.send()
            }, 500)
        }, 2000 * i)
    }
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
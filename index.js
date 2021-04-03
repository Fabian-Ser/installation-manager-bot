const discord = require('discord.js');
const fs = require('fs');
const bot = new discord.Client();
const config = require('./data/config.json')
const axios = require("axios")
bot.commands = new discord.Collection();
bot.aliases = new discord.Collection();
var settings = require("./data/settings.json")

fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err)

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        return console.log("[LOGS] No commands found!");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);
        console.log(`[LOGS] ${f} will be loaded...`);
        bot.commands.set(pull.config.name, pull);
        pull.config.aliases.forEach(alias => {
            bot.aliases.set(alias, pull.config.name)
        });
    })
});

bot.on('ready', () => {
    bot.user.setActivity(config.bot.activity, { type: 'PLAYING' });
    console.log("[LOGS]", bot.user.username + " is online and ready for installations");
});

bot.on("message", async message => {

    if (message.author.bot) return;

    if (message.channel.type === "dm") return;

    var prefix = config.bot.prefix

    if (!message.content.startsWith(prefix)) return;

    var messageArray = message.content.split(" ")

    var command = messageArray[0];

    var args = messageArray.slice(1);

    let commands = bot.commands.get(command.slice(prefix.length)) || bot.commands.get(bot.aliases.get(command.slice(prefix.length)))

    if (commands) {
        if (!message.content.toLowerCase().startsWith("!setup")) {
            if (settings.installationCategoryID != undefined) {
                commands.run(bot, message, args);
            } else {
                message.channel.send(`Before you can use my commands, I need to be setupped. Please setup me with ${prefix}setup`)
            }
        } else {
            commands.run(bot, message, args);
        }
    }
})

bot.login(config.bot.token);

function getStatus(url) {
    return new Promise(async(resolve, reject) => {
        const res = await axios.get(url, {
            headers: {
                'Authorization': config.installation.apikey
            }
        });
        resolve(res.data)
    })
}


setInterval(async function() {
    var path = require('path');
    var filename = path.resolve('./data/installs.json');
    delete require.cache[filename];
    let installs = require("./data/installs.json")
    for (var i = 0; i < Object.keys(installs).length; i++) {
        if (!installs[Object.keys(installs)[i]].finished) {
            var api = installs[Object.keys(installs)[i]].api
            var thing = installs[Object.keys(installs)[i]];
            let channel = bot.channels.cache.get(installs[Object.keys(installs)[i]].channel)
            if (channel == undefined || channel == null) {
                installs[Object.keys(installs)[i]].finished = true;
                fs.writeFile("./data/installs.json", JSON.stringify(installs), (err) => {
                    if (err) console.log(err)
                })
            } else {
                channel.messages.fetch({ around: installs[Object.keys(installs)[i]].messageid, limit: 1 })
                    .then(async msg => {
                        const fetchedMsg = msg.first();
                        let status = await getStatus(api);
                        if (status.succes) {
                            let progressbar = "";
                            for (var i = 0; i < 50; i++) {
                                if (Math.round(Number(status.progress) / 2) == i) {
                                    progressbar += "⏺️";
                                } else {
                                    progressbar += "─";
                                }
                                if (i == 49) {
                                    if (Math.round(Number(status.progress) / 2) == 50) {
                                        progressbar += "⏺️";
                                    }
                                }
                            }
                            if (status.progress == 100) {
                                thing.finished = true;
                                fs.writeFile("./data/installs.json", JSON.stringify(installs), (err) => {
                                    if (err) console.log(err)
                                })
                            }
                            var today = new Date();
                            var h = today.getHours();
                            var m = today.getMinutes();
                            var s = today.getSeconds();
                            var month = '' + (today.getMonth() + 1);
                            var day = '' + today.getDate();
                            var year = today.getFullYear();

                            if (month.length < 2)
                                month = '0' + month;
                            if (day.length < 2)
                                day = '0' + day;
                            if (h.length < 2)
                                h = '0' + h;
                            if (m.toString().length < 2)
                                m = '0' + m;
                            if (s.toString().length < 2)
                                s = '0' + s;
                            fetchedMsg.edit(`\`\`\`|${progressbar}|\nProgress: ${status.progress}% | Task: ${status.task}\nLast update: ${[year, month, day].join('-')} ${h}:${m}:${s}\`\`\``);
                        }
                    });
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}, 5000)

//© 2021 Installation Manager
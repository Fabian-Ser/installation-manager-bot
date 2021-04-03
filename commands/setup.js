var fs = require("fs")
var embed = require("../handlers/createEmbed.js")
var settings = require("../data/settings.json")
var config = require("../data/config.json")
module.exports = {
    config: {
        name: "setup",
        aliases: []
    },
    run: async(bot, message, args) => {
        function manualSetup() {
            message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "Please answer all the questions to complete the installation\n\nQuestion (1/4): Can everyone use this bot, or only users with a specific role?\nValid answers: everyone/*roleid*/cancel"))
            let validAnswersQ1 = ["cancel", "everyone"]
            let filter = m => validAnswersQ1.includes(m.content.toLowerCase()) || m.content.length == 18 && m.author.id == message.author.id && m.channel.id == message.channel.id;
            let collector = message.channel.createMessageCollector(filter, { max: 1, time: 60000 });
            collector.on('collect', m => {
                if (m.content.toLowerCase() == "cancel") {
                    return message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "The setup has been canceled by the user"))
                } else {
                    if (!isNaN(Number(m.content.toLowerCase()))) {
                        if (message.guild.roles.cache.get(m.content.toLowerCase()) == undefined) {
                            return message.channel.send(embed.createEmbed("error", `Setup ${bot.user.username}`, `This is not a valid roleid, please restart the setup and try again.`))
                        } else {
                            message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `The users with the <@&${m.content.toLowerCase()}> can use the bot once the installation completes.`))
                        }
                    } else {
                        message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `Everyone can use the bot once the installation completes.`))
                    }
                    settings.installationsAllowed = m.content.toLowerCase()
                    message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "Please answer all the questions to complete the installation\n\nQuestion (2/4): On which category should I place the installations?\nValid answers: none/*categoryid*/cancel"))
                    let validAnswersQ2 = ["none", "cancel"]
                    let filter2 = m2 => validAnswersQ2.includes(m2.content.toLowerCase()) || m2.content.length == 18 && m2.author.id == message.author.id && m.channel.id == message.channel.id;
                    let collector2 = message.channel.createMessageCollector(filter2, { max: 1, time: 60000 });
                    collector2.on('collect', m2 => {
                        if (m2.content.toLowerCase() == "cancel") {
                            return message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "The setup has been canceled by the user"))
                        } else {
                            if (m2.content.toLowerCase() != "none") {
                                let cat = message.guild.channels.cache.find(cat => cat.id === m2.content.toLowerCase())
                                if (cat == undefined) {
                                    return message.channel.send(embed.createEmbed("error", `Setup ${bot.user.username}`, `This is not a valid category, please restart the setup and try again.`))
                                }
                                if (cat.type == "category") {
                                    message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `The installations will be placed under the category: **${cat.name}**.`))
                                } else {
                                    return message.channel.send(embed.createEmbed("error", `Setup ${bot.user.username}`, `This is not a valid category, please restart the setup and try again.`))
                                }
                            } else {
                                message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `The installations will be placed as singel channel without category`))
                            }
                            settings.installationCategoryID = m2.content.toLowerCase();
                            message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "Please answer all the questions to complete the installation\n\nQuestion (3/4): Should the passwords, generated while installing, be saved or removed after the installation is completed.\nValid answers: remove/save/cancel"))
                            let validAnswersQ3 = ["remove", "save", "cancel"]
                            let filter3 = m3 => validAnswersQ3.includes(m3.content.toLowerCase()) && m3.author.id == message.author.id && m.channel.id == message.channel.id;
                            let collector3 = message.channel.createMessageCollector(filter3, { max: 1, time: 60000 });
                            collector3.on('collect', m3 => {
                                if (m3.content.toLowerCase() == "cancel") {
                                    return message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "The setup has been canceled by the user"))
                                } else {
                                    message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `After the installations, the passwords will be ${m3.content.toLowerCase()}d.`))
                                    if (m3.content.toLowerCase() == "save") {
                                        settings.savePasswords = true;
                                    } else {
                                        settings.savePasswords = false;
                                    }
                                }
                                message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "Please answer all the questions to complete the installation\n\nQuestion (4/4): What is the limit of installs users can do per user?\nValid answers: *number*/no-limit/cancel"))
                                let validAnswersQ4 = ["no-limit", "cancel"]
                                let filter4 = m4 => validAnswersQ4.includes(m4.content.toLowerCase()) || !isNaN(m4.content.toLowerCase()) && m4.author.id == message.author.id && m.channel.id == message.channel.id;
                                let collector4 = message.channel.createMessageCollector(filter4, { max: 1, time: 60000 });
                                collector4.on('collect', m4 => {
                                    if (m4.content.toLowerCase() == "cancel") {
                                        return message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "The setup has been canceled by the user"))
                                    } else {
                                        if (isNaN(m4.content.toLowerCase())) {
                                            if (m4.content.toLowerCase() !== "no-limit") {
                                                return message.channel.send(embed.createEmbed("error", `Setup ${bot.user.username}`, `This is not a valid number, please restart the setup and try again.`))
                                            } else {
                                                message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `There will be no limit on the installs per user.`))
                                                settings.maxInstallationPerUser = "no-limit";
                                            }
                                        } else {
                                            message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `There will be a limit of ${m4.content} installations per user.`))
                                            settings.maxInstallationPerUser = Number(m4.content);
                                        }
                                        fs.writeFile('./data/settings.json', JSON.stringify(settings), (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            return message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `Setup complete! The setup is done, make sure that the API token is set correctly in the config.json file!`))
                                        });
                                    }
                                })
                            })
                        }
                    })
                }
            });
        }

        function autoSetup() {
            message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, "Setting up the bot...\nStep 1/4: Creating allowed role."))
            message.guild.roles.create({
                    data: {
                        name: 'Installation Whitelist',
                        color: 'BLUE',
                    },
                    reason: 'This will allow people to use the installation bot',
                })
                .then(role => {
                    message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `Succes! The role <@&${role.id}> will allow users to perform their installations.\nStep 2/4: Creating category.`))
                    settings.installationsAllowed = role.id;
                    message.guild.channels.create('Installations', { type: 'category' }).then(category => {
                        let cat = message.guild.channels.cache.find(cat => cat.id === category.id)
                        cat.overwritePermissions([{
                            id: message.guild.id,
                            deny: ['VIEW_CHANNEL'],
                        }]);
                        settings.installationCategoryID = cat.id;
                        message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `Succes! The category **${cat.name}** will be used to place the installations under.\nStep 3/4: Settings "save password" to false.`))
                        settings.savePasswords = false;
                        message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `Succes! The passwords will not be saved \nStep 4/4: Settings "max installations per user" to **3**.`))
                        settings.maxInstallationPerUser = 3;
                        fs.writeFile('./data/settings.json', JSON.stringify(settings), (err) => {
                            if (err) {
                                throw err;
                            }
                            return message.channel.send(embed.createEmbed("success", `Setup ${bot.user.username}`, `Setup complete! The setup is done, make sure that the API token is set correctly in the config.json file!`))
                        });
                    }).catch(e => {
                        return message.channel.send("There was an error while setting up the bot, please report: " + e)
                    })
                })
                .catch(e => {
                    return message.channel.send("There was an error while setting up the bot, please report: " + e)
                });
        }

        try {
            let validOptions = ["auto", "manual"]
            if (args[0] == undefined || validOptions.includes(args[0].toLowerCase()) == false) {
                message.channel.send(embed.createEmbed("default", `Setup ${bot.user.username}`, `It looks like you forgot a required parameter. \nPlease use: **${config.bot.prefix}setup** <*auto*/*manual*>`))
            } else {
                if (args[0].toLowerCase() == "manual") {
                    manualSetup()
                } else if (args[0].toLowerCase() == "auto") {
                    autoSetup()
                }
            }
        } catch (error) {
            return message.channel.send("**Error:** " + error)
        }
    }
}
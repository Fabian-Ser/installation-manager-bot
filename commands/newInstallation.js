var embed = require("../handlers/createEmbed.js")
var settings = require("../data/settings.json")
var config = require("../data/config.json")
var axios = require("axios")
var im = require("../handlers/installlationManager.js")
module.exports = {
    config: {
        name: "new",
        aliases: ["install", "pterodactyl", "ptero"]
    },
    run: async(bot, message, args) => {

        function handleInstallation(ip, username, password, option) {
            return new Promise((resolve, reject) => {
                const options = {
                    headers: { 'authorization': config.installation.apikey }
                };

                axios.post('https://pterodactyl.mc-node.net/api/v1/install/new', {
                        ip: ip,
                        password: password,
                        username: username,
                        option: option
                    }, options)
                    .then((response) => {
                        resolve(response.data);
                    }, (error) => {
                        reject(error);
                    });
            })
        }

        try {
            if (settings.installationsAllowed != "everyone") {
                if (message.guild.roles.cache.get(settings.installationsAllowed) == undefined) return message.channel.send(embed.createEmbed("error", "Setup Fault", `I could not find any role with id: ${settings.installationsAllowed}, please restart the setup`))
                if (!message.member.roles.cache.has(settings.installationsAllowed)) return message.channel.send(embed.createEmbed("error", "Perform installation", "You don't have the required role to perform this operation."))
            }
            if (settings.installationCategoryID != "none") {
                let cat = message.guild.channels.cache.find(cat => cat.id === settings.installationCategoryID)
                if (cat == undefined) {
                    return message.channel.send(embed.createEmbed("error", `Setup Fault`, `I could not find any category with id: ${settings.installationsAllowed}, please restart the setup`))
                }
            }

            if (settings.maxInstallationPerUser !== "no-limit") {
                if (im.installsPerUser(message.author.id) >= settings.maxInstallationPerUser) {
                    return message.channel.send(embed.createEmbed("error", "Perform installation", `You have a maximum of **${settings.maxInstallationPerUser}** installations by default, you have reached this amount.`))
                }
            }

            let count = im.getInstallsAmount()
            message.guild.channels.create(`Installation-${count}`, {
                type: 'text',
                permissionOverwrites: [{
                        id: message.guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: message.author.id,
                        allow: ['VIEW_CHANNEL'],
                    },
                ],
            }).then(chan => {
                message.channel.send(embed.createEmbed("success", `New Installation`, `I created a installation channel for the installation, ${chan}`)).then(msg => {
                    setTimeout(function() {
                        message.delete()
                        msg.delete()
                    }, 10000)
                })
                if (settings.installationCategoryID != "none") {
                    chan.setParent(settings.installationCategoryID)
                }
                let filter = m => m.author.id === message.author.id
                chan.send(embed.createEmbed("default", "New Installation", `Welcome to the install channel, there will be several things asked related to the installation. All installations are tested on OpenVZ and KVM with a clean image of Ubuntu 18.04. Guarantee on other software is not given.\nYou can close this channel by any time with the **${config.bot.prefix}close** command.\n\nPlease enter the ip adress of the VPS.`)).then(() => {
                    chan.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(message => {
                            message = message.first()
                            if (message.content.toLowerCase().split(".").length != 4) {
                                return chan.send(embed.createEmbed("error", "New Installation", `This is an invalid IP, please try again later. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                    chan.delete()
                                }, 5000))
                            } else {
                                for (var i; i < message.content.toLowerCase().split(".").length; i++) {
                                    if (isNaN(message.content.toLowerCase().split(".")[i])) {
                                        return chan.send(embed.createEmbed("error", "New Installation", `This is an invalid IP, please try again later. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                            chan.delete()
                                        }, 5000))
                                    }
                                }
                                let ip = message.content
                                chan.send(embed.createEmbed("default", "New Installation", `Please enter a username, if you are unsure, please use **root**\n\n*The user needs sudo permissions!`)).then(() => {
                                    chan.awaitMessages(filter, {
                                            max: 1,
                                            time: 30000,
                                            errors: ['time']
                                        })
                                        .then(message => {
                                            message = message.first()
                                            let username = message.content
                                            chan.send(embed.createEmbed("default", "New Installation", `Please the password for user **${message.content}**`)).then(() => {
                                                chan.awaitMessages(filter, {
                                                        max: 1,
                                                        time: 30000,
                                                        errors: ['time']
                                                    })
                                                    .then(message => {
                                                        message = message.first()
                                                        let password = message.content
                                                        chan.send(embed.createEmbed("default", "New Installation", `Please choose the installation option: 
                                                        1 = 1.0 Panel & Daemon 
                                                        2 = 1.0 Panel
                                                        3 = 1.0 Daemon
                                                        4 = 0.7 Panel & Daemon 
                                                        5 = 0.7 Panel
                                                        6 = 0.7 Daemon\nRespond with a number between 1 and 6.`)).then(() => {
                                                            chan.awaitMessages(filter, {
                                                                    max: 1,
                                                                    time: 30000,
                                                                    errors: ['time']
                                                                })
                                                                .then(async message => {
                                                                    message = message.first()
                                                                    let validOptions = [1, 2, 3, 4, 5, 6]
                                                                    if (!validOptions.includes(Number(message.content))) {
                                                                        return chan.send(embed.createEmbed("error", "New Installation", `This is an invalid option, please try again later. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                                                            chan.delete()
                                                                        }, 5000))
                                                                    }
                                                                    let option = message.content
                                                                    let output = await handleInstallation(ip, username, password, option)
                                                                    if (output.succes) {
                                                                        let statusmsg = await chan.send(`\`\`\`|─⏺️────────────────────────────────────────────────|\nVoortgang: 1% | Taak: Files aan het genereren\`\`\``)
                                                                        im.importInstall(message.author.id, chan.id, statusmsg.id, output.jsonStatus)
                                                                    } else {
                                                                        return chan.send(embed.createEmbed("error", "New Installation", `There was an error while starting this installation, please report: *${output.error}* to our staff members.\n This channel will be closed in 15 seconds...`)).then(setTimeout(function() {
                                                                            chan.delete()
                                                                        }, 15000))
                                                                    }
                                                                })
                                                        }).catch(collected => {
                                                            return chan.send(embed.createEmbed("error", "New Installation", `Timeout reached. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                                                chan.delete()
                                                            }, 5000))
                                                        });
                                                    })
                                            }).catch(collected => {
                                                return chan.send(embed.createEmbed("error", "New Installation", `Timeout reached. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                                    chan.delete()
                                                }, 5000))
                                            });
                                        })
                                }).catch(collected => {
                                    return chan.send(embed.createEmbed("error", "New Installation", `Timeout reached. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                        chan.delete()
                                    }, 5000))
                                });
                            }
                        })
                        .catch(collected => {
                            return chan.send(embed.createEmbed("error", "New Installation", `Timeout reached. This channel will be closed in 5 seconds...`)).then(setTimeout(function() {
                                chan.delete()
                            }, 5000))
                        });
                })
            }).catch(e => {
                return message.channel.send("There was an error while setting up the bot, please report: " + e)
            })
        } catch (error) {
            return message.channel.send("**Error:** " + error)
        }
    }
}